// DivyaSetu seed — realistic Indian district data.  npm run db:seed
// Demo login for every seeded user: mobile / pass1234
import { PrismaClient, DeviceCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const PASSWORD_HASH = bcrypt.hashSync("pass1234", 10);

interface Place { city: string; district: string; state: string; lat: number; lng: number }

// Chennai cluster is dense (for match demos) + a nation-wide spread.
const PLACES: Place[] = [
  { city: "Chennai", district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Vadapalani", district: "Chennai", state: "Tamil Nadu", lat: 13.0589, lng: 80.1839 },
  { city: "Mylapore", district: "Chennai", state: "Tamil Nadu", lat: 13.0029, lng: 80.2404 },
  { city: "Ambattur", district: "Chennai", state: "Tamil Nadu", lat: 13.0981, lng: 80.1476 },
  { city: "Pallavaram", district: "Chengalpattu", state: "Tamil Nadu", lat: 12.985, lng: 80.169 },
  { city: "Sriperumbudur", district: "Kancheepuram", state: "Tamil Nadu", lat: 12.967, lng: 79.919 },
  { city: "Madurai", district: "Madurai", state: "Tamil Nadu", lat: 9.9256, lng: 78.1198 },
  { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { city: "Delhi", district: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Mumbai", district: "Mumbai City", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { city: "Pune", district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", district: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { city: "Kolkata", district: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Jaipur", district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
];

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  WHEELCHAIR: "Standard folding wheelchair",
  HEARING_AID: "Digital hearing aid",
  CRUTCH: "Adjustable forearm crutches (pair)",
  TRICYCLE: "Hand-operated mobility tricycle",
  BRAILLE_KIT: "Braille slate & stylus kit",
  PROSTHETIC: "Below-knee prosthetic leg",
};
const CONDITIONS = ["GOOD", "VERY GOOD", "EXCELLENT", "FAIR"];

async function main() {
  console.log("Seeding DivyaSetu ...");
  // 1. Reference catalog
  const typeIds: Record<string, number> = {};
  for (const cat of Object.keys(CATEGORY_LABELS)) {
    const row = await prisma.deviceType.upsert({
      where: { category: cat as DeviceCategory },
      update: { label: CATEGORY_LABELS[cat as DeviceCategory] },
      create: { category: cat as DeviceCategory, label: CATEGORY_LABELS[cat as DeviceCategory] },
    });
    typeIds[cat] = row.id;
  }
  console.log(`  · device_types: ${Object.keys(typeIds).length}`);

  // 2. Users
  const donors: number[] = [];
  const seekers: number[] = [];
  const verifierIds: number[] = [];
  const upsertUser = async (name: string, mobile: string, role: Role, extra: Partial<{ disabilityType: string }> = {}, place?: Place) => {
    const row = await prisma.user.upsert({
      where: { mobile },
      update: { passwordHash: PASSWORD_HASH, role },
      create: { name, mobile, passwordHash: PASSWORD_HASH, role, isApproved: true, disabilityType: extra.disabilityType, lat: place?.lat, lng: place?.lng },
      select: { id: true },
    });
    return row.id;
  };
  const donorNames = ["Ravi Krishnan", "Meena Iyer", "Arjun Sharma", "Lakshmi Natarajan", "Farhan Qureshi",
    "Sunita Devi", "Vikram Rathore", "Anita Menon", "Basheer Ahmed", "Divya Rao",
    "Karthik S", "Rashmi Kulkarni", "Prakash Joshi", "Neha Gupta"];
  for (let i = 0; i < donorNames.length; i++)
    donors.push(await upsertUser(donorNames[i], `900000${String(i + 1).padStart(4, "0")}`, "DONOR", {}, PLACES[i % PLACES.length]));

  const seekerNames = ["Manoj Kumar", "Sharmila B", "Ramesh Yadav", "Jaya Rani", "Ganesh Potti", "Kavita Verma",
    "Selvi Anbu", "Raju Nayak", "Padma K", "Abdul Rahman", "Sita Devi", "Harish Kumar"];
  const seekerPlaces = [3, 4, 5, 3, 5, 4, 3, 5, 4, 3, 4, 5];
  const seekerDisabilities = ["Orthopaedic handicap", "Hearing impairment", "Visual impairment", "Orthopaedic handicap", "Hearing impairment", "Orthopaedic handicap"];
  for (let i = 0; i < seekerNames.length; i++) {
    const p = PLACES[seekerPlaces[i]];
    seekers.push(await upsertUser(seekerNames[i], `910000${String(i + 1).padStart(4, "0")}`, "SEEKER", { disabilityType: seekerDisabilities[i % seekerDisabilities.length] }, p));
  }
  for (let i = 0; i < 3; i++) verifierIds.push(await upsertUser(`Dr. Verifier ${i + 1}`, `920000${String(i + 1).padStart(4, "0")}`, "VERIFIER"));
  await upsertUser("Admin", "9300000001", "ADMIN", {}, PLACES[0]);
  console.log(`  · users: donors=${donors.length} seekers=${seekers.length} verifiers=${verifierIds.length}`);

  // 3. Devices — 24 across categories, mostly AVAILABLE in the Chennai cluster.
  const catCycle: DeviceCategory[] = ["WHEELCHAIR", "WHEELCHAIR", "CRUTCH", "TRICYCLE", "HEARING_AID", "BRAILLE_KIT", "PROSTHETIC", "WHEELCHAIR"];
  for (let i = 0; i < 24; i++) {
    const cat = catCycle[i % catCycle.length];
    const serial = `DS-${String(i + 1).padStart(4, "0")}`;
    const existing = await prisma.device.findUnique({ where: { serial } });
    if (existing) continue;
    const place = PLACES[i % 6];
    const device = await prisma.device.create({
      data: {
        serial,
        donorId: donors[i % donors.length],
        typeId: typeIds[cat],
        condition: CONDITIONS[i % CONDITIONS.length],
        description: `${CATEGORY_LABELS[cat]} — ${CONDITIONS[i % CONDITIONS.length].toLowerCase()} condition, from ${place.city}.`,
        lat: place.lat,
        lng: place.lng,
        status: "AVAILABLE",
      },
    });
    await prisma.$executeRawUnsafe(
      `UPDATE devices SET geometry = ST_SetSRID(ST_MakePoint(${place.lng}, ${place.lat}), 4326)::geometry WHERE id = ${device.id}`
    );
  }
  console.log("  · devices: 24");

  // 4. Needs — 10 open demand requests.
  const needSeeds: Array<{ cat: DeviceCategory; urgencyH: number; placeIdx: number }> = [
    { cat: "WHEELCHAIR", urgencyH: 48, placeIdx: 3 },
    { cat: "HEARING_AID", urgencyH: 120, placeIdx: 4 },
    { cat: "WHEELCHAIR", urgencyH: 24, placeIdx: 5 },
    { cat: "CRUTCH", urgencyH: 72, placeIdx: 3 },
    { cat: "TRICYCLE", urgencyH: 168, placeIdx: 4 },
    { cat: "WHEELCHAIR", urgencyH: 96, placeIdx: 5 },
    { cat: "BRAILLE_KIT", urgencyH: 240, placeIdx: 0 },
    { cat: "PROSTHETIC", urgencyH: 216, placeIdx: 4 },
    { cat: "WHEELCHAIR", urgencyH: 12, placeIdx: 3 },
    { cat: "WHEELCHAIR", urgencyH: 36, placeIdx: 5 },
  ];
  for (let i = 0; i < needSeeds.length; i++) {
    const n = needSeeds[i];
    const place = PLACES[n.placeIdx];
    const need = await prisma.need.create({
      data: {
        seekerId: seekers[i % seekers.length],
        category: n.cat,
        urgencyHours: n.urgencyH,
        lat: place.lat,
        lng: place.lng,
        monthlyIncome: 8000 + Math.round(Math.random() * 12000),
        status: "AVAILABLE",
      },
    });
    await prisma.$executeRawUnsafe(
      `UPDATE needs SET geometry = ST_SetSRID(ST_MakePoint(${place.lng}, ${place.lat}), 4326)::geometry WHERE id = ${need.id}`
    );
  }
  console.log("  · needs: 10");

  // 5. A few SAFE certifications so the Discover page isn't empty.
  const firstDevices = await prisma.device.findMany({ take: 8, orderBy: { id: "asc" } });
  for (const dev of firstDevices) {
    await prisma.certification.create({
      data: {
        deviceId: dev.id,
        verifierId: verifierIds[0],
        verdict: "SAFE",
        notes: "Visual + basic mechanical check passed.",
        certificateRef: `CERT-${dev.id}`,
        inspectedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      },
    });
  }
  console.log("  · certifications: 8 (SAFE)");

  const summary = await Promise.all([
    prisma.user.count(), prisma.device.count(), prisma.need.count(), prisma.certification.count(),
  ]);
  console.log(`Seeded ✔  users=${summary[0]}  devices=${summary[1]}  needs=${summary[2]}  certifications=${summary[3]}`);
  console.log("Demo logins (any — password pass1234):");
  console.log("  donor  9000000001   seeker  9100000001   verifier 9200000001   admin 9300000001");
}

main().catch(async (e) => { console.error("Seed failed:", e); await prisma.$disconnect(); process.exit(1); });