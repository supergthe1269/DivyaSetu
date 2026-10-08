// DivyaSetu seed — realistic Indian district data.  npm run db:seed
// Demo login for every seeded user: mobile / pass1234
import { PrismaClient, DeviceCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const PASSWORD_HASH = bcrypt.hashSync("pass1234", 10);

interface Place { city: string; district: string; state: string; region: string; lat: number; lng: number }

// Nationwide spread across all zones of India, with high-density Chennai cluster for close proximity matching.
const PLACES: Place[] = [
  // --- South India ---
  { city: "Chennai", district: "Chennai", state: "Tamil Nadu", region: "South", lat: 13.0827, lng: 80.2707 },
  { city: "Vadapalani", district: "Chennai", state: "Tamil Nadu", region: "South", lat: 13.0589, lng: 80.1839 },
  { city: "Mylapore", district: "Chennai", state: "Tamil Nadu", region: "South", lat: 13.0029, lng: 80.2404 },
  { city: "Ambattur", district: "Tiruvallur", state: "Tamil Nadu", region: "South", lat: 13.0981, lng: 80.1476 },
  { city: "Pallavaram", district: "Chengalpattu", state: "Tamil Nadu", region: "South", lat: 12.9850, lng: 80.1690 },
  { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", region: "South", lat: 11.0168, lng: 76.9558 },
  { city: "Madurai", district: "Madurai", state: "Tamil Nadu", region: "South", lat: 9.9256, lng: 78.1198 },
  { city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", region: "South", lat: 12.9716, lng: 77.5946 },
  { city: "Mysuru", district: "Mysuru", state: "Karnataka", region: "South", lat: 12.2958, lng: 76.6394 },
  { city: "Hyderabad", district: "Hyderabad", state: "Telangana", region: "South", lat: 17.3850, lng: 78.4867 },
  { city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", region: "South", lat: 17.6868, lng: 83.2185 },
  { city: "Kochi", district: "Ernakulam", state: "Kerala", region: "South", lat: 9.9312, lng: 76.2673 },
  { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", region: "South", lat: 8.5241, lng: 76.9366 },

  // --- North India ---
  { city: "New Delhi", district: "New Delhi", state: "Delhi", region: "North", lat: 28.6315, lng: 77.2167 },
  { city: "Noida", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", region: "North", lat: 28.5355, lng: 77.3910 },
  { city: "Gurugram", district: "Gurugram", state: "Haryana", region: "North", lat: 28.4595, lng: 77.0266 },
  { city: "Chandigarh", district: "Chandigarh", state: "Chandigarh", region: "North", lat: 30.7333, lng: 76.7794 },
  { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", region: "North", lat: 26.8467, lng: 80.9462 },
  { city: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh", region: "North", lat: 26.4499, lng: 80.3319 },
  { city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", region: "North", lat: 25.3176, lng: 82.9739 },
  { city: "Jaipur", district: "Jaipur", state: "Rajasthan", region: "North", lat: 26.9124, lng: 75.7873 },
  { city: "Dehradun", district: "Dehradun", state: "Uttarakhand", region: "North", lat: 30.3165, lng: 78.0322 },
  { city: "Srinagar", district: "Srinagar", state: "Jammu and Kashmir", region: "North", lat: 34.0837, lng: 74.7973 },

  // --- West India ---
  { city: "Mumbai", district: "Mumbai City", state: "Maharashtra", region: "West", lat: 18.9220, lng: 72.8347 },
  { city: "Pune", district: "Pune", state: "Maharashtra", region: "West", lat: 18.5204, lng: 73.8567 },
  { city: "Nagpur", district: "Nagpur", state: "Maharashtra", region: "West", lat: 21.1458, lng: 79.0882 },
  { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", region: "West", lat: 23.0225, lng: 72.5714 },
  { city: "Surat", district: "Surat", state: "Gujarat", region: "West", lat: 21.1702, lng: 72.8311 },
  { city: "Panaji", district: "North Goa", state: "Goa", region: "West", lat: 15.4909, lng: 73.8278 },

  // --- East India ---
  { city: "Kolkata", district: "Kolkata", state: "West Bengal", region: "East", lat: 22.5726, lng: 88.3639 },
  { city: "Bhubaneswar", district: "Khurda", state: "Odisha", region: "East", lat: 20.2961, lng: 85.8245 },
  { city: "Patna", district: "Patna", state: "Bihar", region: "East", lat: 25.5941, lng: 85.1376 },
  { city: "Ranchi", district: "Ranchi", state: "Jharkhand", region: "East", lat: 23.3441, lng: 85.3096 },

  // --- Central India ---
  { city: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", region: "Central", lat: 23.2599, lng: 77.4126 },
  { city: "Indore", district: "Indore", state: "Madhya Pradesh", region: "Central", lat: 22.7196, lng: 75.8577 },
  { city: "Raipur", district: "Raipur", state: "Chhattisgarh", region: "Central", lat: 21.2514, lng: 81.6296 },

  // --- Northeast India ---
  { city: "Guwahati", district: "Kamrup Metropolitan", state: "Northeast", region: "Northeast", lat: 26.1445, lng: 91.7362 },
  { city: "Shillong", district: "East Khasi Hills", state: "Meghalaya", region: "Northeast", lat: 25.5788, lng: 91.8933 },
  { city: "Agartala", district: "West Tripura", state: "Tripura", region: "Northeast", lat: 23.8315, lng: 91.2868 },
  { city: "Imphal", district: "Imphal West", state: "Manipur", region: "Northeast", lat: 24.8170, lng: 93.9368 },
];

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  WHEELCHAIR: "Standard folding wheelchair",
  HEARING_AID: "Digital hearing aid",
  CRUTCH: "Adjustable forearm crutches (pair)",
  TRICYCLE: "Hand-operated mobility tricycle",
  BRAILLE_KIT: "Braille slate & stylus kit",
  PROSTHETIC: "Below-knee prosthetic leg",
};

const CATEGORY_IMAGES: Record<DeviceCategory, string> = {
  WHEELCHAIR: "/images/devices/wheelchair.jpg",
  HEARING_AID: "/images/devices/hearing_aid.jpg",
  CRUTCH: "/images/devices/crutch.jpg",
  TRICYCLE: "/images/devices/tricycle.jpg",
  BRAILLE_KIT: "/images/devices/braille_kit.jpg",
  PROSTHETIC: "/images/devices/prosthetic.jpg",
};
const CONDITIONS = ["GOOD", "VERY GOOD", "EXCELLENT", "FAIR"];

async function main() {
  console.log("Seeding DivyaSetu with pan-India regional hubs ...");
  
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
      create: { 
        name, 
        mobile, 
        passwordHash: PASSWORD_HASH, 
        role, 
        isApproved: true, 
        disabilityType: extra.disabilityType, 
        lat: place?.lat, 
        lng: place?.lng 
      },
      select: { id: true },
    });
    return row.id;
  };

  const donorNames = [
    "Ravi Krishnan", "Meena Iyer", "Arjun Sharma", "Lakshmi Natarajan", "Farhan Qureshi",
    "Sunita Devi", "Vikram Rathore", "Anita Menon", "Basheer Ahmed", "Divya Rao",
    "Karthik S", "Rashmi Kulkarni", "Prakash Joshi", "Neha Gupta", "Subhash Mukherjee",
    "Arup Borah", "Deepak Patel", "Bhavna Chawla"
  ];
  for (let i = 0; i < donorNames.length; i++) {
    donors.push(await upsertUser(donorNames[i], `900000${String(i + 1).padStart(4, "0")}`, "DONOR", {}, PLACES[i % PLACES.length]));
  }

  const seekerNames = [
    "Manoj Kumar", "Sharmila B", "Ramesh Yadav", "Jaya Rani", "Ganesh Potti", "Kavita Verma",
    "Selvi Anbu", "Raju Nayak", "Padma K", "Abdul Rahman", "Sita Devi", "Harish Kumar",
    "Pranab Saikia", "Ankita Roy", "Chirag Gandhi"
  ];
  const seekerDisabilities = [
    "Orthopaedic handicap", "Hearing impairment", "Visual impairment", 
    "Orthopaedic handicap", "Hearing impairment", "Orthopaedic handicap"
  ];
  for (let i = 0; i < seekerNames.length; i++) {
    const p = PLACES[i % PLACES.length];
    seekers.push(await upsertUser(
      seekerNames[i], 
      `910000${String(i + 1).padStart(4, "0")}`, 
      "SEEKER", 
      { disabilityType: seekerDisabilities[i % seekerDisabilities.length] }, 
      p
    ));
  }

  for (let i = 0; i < 3; i++) {
    verifierIds.push(await upsertUser(`Dr. Verifier ${i + 1}`, `920000${String(i + 1).padStart(4, "0")}`, "VERIFIER"));
  }
  await upsertUser("Admin", "9300000001", "ADMIN", {}, PLACES[0]);
  console.log(`  · users: donors=${donors.length} seekers=${seekers.length} verifiers=${verifierIds.length}`);

  // 3. Devices — Distributed nationwide across all 40 hubs so every region has available inventory
  const catCycle: DeviceCategory[] = [
    "WHEELCHAIR", "WHEELCHAIR", "CRUTCH", "TRICYCLE", "HEARING_AID", "BRAILLE_KIT", "PROSTHETIC", "WHEELCHAIR"
  ];

  const totalDeviceCount = 48;
  for (let i = 0; i < totalDeviceCount; i++) {
    const cat = catCycle[i % catCycle.length];
    const serial = `DS-${String(i + 1).padStart(4, "0")}`;
    const place = PLACES[i % PLACES.length];
    const condition = CONDITIONS[i % CONDITIONS.length];

    const imageUrl = CATEGORY_IMAGES[cat];
    const device = await prisma.device.upsert({
      where: { serial },
      update: {
        condition,
        lat: place.lat,
        lng: place.lng,
        imageUrl,
        status: "AVAILABLE",
      },
      create: {
        serial,
        donorId: donors[i % donors.length],
        typeId: typeIds[cat],
        condition,
        description: `${CATEGORY_LABELS[cat]} — ${condition.toLowerCase()} condition, registered at ${place.city} (${place.state}).`,
        lat: place.lat,
        lng: place.lng,
        imageUrl,
        status: "AVAILABLE",
      },
    });

    await prisma.$executeRawUnsafe(
      `UPDATE devices SET geometry = ST_SetSRID(ST_MakePoint(${place.lng}, ${place.lat}), 4326)::geometry WHERE id = ${device.id}`
    );
  }
  console.log(`  · devices: ${totalDeviceCount} across all 6 Indian zones`);

  // 4. Certifications — Certify devices as SAFE so Discover page and map render live inventory nationwide
  const allDevices = await prisma.device.findMany({ orderBy: { id: "asc" } });
  let certCount = 0;
  for (const dev of allDevices) {
    const existingCert = await prisma.certification.findFirst({ where: { deviceId: dev.id } });
    if (!existingCert) {
      await prisma.certification.create({
        data: {
          deviceId: dev.id,
          verifierId: verifierIds[certCount % verifierIds.length],
          verdict: "SAFE",
          notes: `Visual and mechanical safety inspection verified conforming to ISO 7176 assistive standards.`,
          certificateRef: `CERT-${dev.id}`,
          inspectedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        },
      });
      certCount++;
    }
  }
  console.log(`  · certified SAFE devices: ${allDevices.length}`);

  // 5. Needs — Open demand requests across diverse Indian zones
  const needSeeds: Array<{ cat: DeviceCategory; urgencyH: number; placeIdx: number }> = [
    { cat: "WHEELCHAIR", urgencyH: 48, placeIdx: 0 },   // Chennai
    { cat: "HEARING_AID", urgencyH: 120, placeIdx: 1 },  // Vadapalani
    { cat: "WHEELCHAIR", urgencyH: 24, placeIdx: 7 },   // Bengaluru
    { cat: "CRUTCH", urgencyH: 72, placeIdx: 9 },       // Hyderabad
    { cat: "TRICYCLE", urgencyH: 168, placeIdx: 13 },   // New Delhi
    { cat: "WHEELCHAIR", urgencyH: 96, placeIdx: 17 },   // Lucknow
    { cat: "BRAILLE_KIT", urgencyH: 240, placeIdx: 20 }, // Jaipur
    { cat: "PROSTHETIC", urgencyH: 216, placeIdx: 23 }, // Mumbai
    { cat: "WHEELCHAIR", urgencyH: 12, placeIdx: 24 },  // Pune
    { cat: "HEARING_AID", urgencyH: 36, placeIdx: 26 }, // Ahmedabad
    { cat: "WHEELCHAIR", urgencyH: 48, placeIdx: 29 },  // Kolkata
    { cat: "CRUTCH", urgencyH: 72, placeIdx: 33 },       // Bhopal
    { cat: "WHEELCHAIR", urgencyH: 24, placeIdx: 36 },  // Guwahati
  ];

  // Clean existing sample needs or insert if count is low
  const currentNeedCount = await prisma.need.count();
  if (currentNeedCount < needSeeds.length) {
    for (let i = 0; i < needSeeds.length; i++) {
      const n = needSeeds[i];
      const place = PLACES[n.placeIdx % PLACES.length];
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
  }
  console.log(`  · needs: seeded across Indian regions`);

  const summary = await Promise.all([
    prisma.user.count(), prisma.device.count(), prisma.need.count(), prisma.certification.count(),
  ]);
  console.log(`Seeded ✔  users=${summary[0]}  devices=${summary[1]}  needs=${summary[2]}  certifications=${summary[3]}`);
  console.log("Demo logins (any — password pass1234):");
  console.log("  donor  9000000001   seeker  9100000001   verifier 9200000001   admin 9300000001");
}

main().catch(async (e) => { 
  console.error("Seed failed:", e); 
  await prisma.$disconnect(); 
  process.exit(1); 
});