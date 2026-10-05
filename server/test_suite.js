// Automated Live Integration & Contract Test Suite for DivyaSetu
const API_BASE = process.env.API_BASE || "http://localhost:4000/api";
const AI_BASE = process.env.AI_BASE || "http://localhost:8488";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("          DIVYASETU INTEGRATION TEST SUITE            ");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Health Endpoints
  await check("Express API Health Check (/api/health)", async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error("Status is not ok");
  });

  await check("FastAPI AI Service Health Check (/health)", async () => {
    const res = await fetch(`${AI_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error("Status is not ok");
  });

  // 2. Authentication for all 4 roles
  let donorToken, seekerToken, adminToken;

  await check("Authentication: Donor Login (9000000001)", async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9000000001", password: "pass1234" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    donorToken = data.token;
    if (data.user.role !== "DONOR") throw new Error(`Expected role DONOR, got ${data.user.role}`);
  });

  await check("Authentication: Seeker Login (9100000001)", async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9100000001", password: "pass1234" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    seekerToken = data.token;
    if (data.user.role !== "SEEKER") throw new Error(`Expected role SEEKER, got ${data.user.role}`);
  });

  await check("Authentication: Verifier Login (9200000001)", async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9200000001", password: "pass1234" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.user.role !== "VERIFIER") throw new Error(`Expected role VERIFIER, got ${data.user.role}`);
  });

  await check("Authentication: Admin Login (9300000001)", async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9300000001", password: "pass1234" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    adminToken = data.token;
    if (data.user.role !== "ADMIN") throw new Error(`Expected role ADMIN, got ${data.user.role}`);
  });

  // 3. Certified Devices Feed
  await check("Devices Feed with PostGIS Geo-Points (/api/devices)", async () => {
    const res = await fetch(`${API_BASE}/devices`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.devices) || data.devices.length === 0) {
      throw new Error("No devices returned");
    }
  });

  // 4. Beneficiary Needs Feed
  await check("Beneficiary Needs Feed (/api/needs)", async () => {
    const res = await fetch(`${API_BASE}/needs`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.needs) || data.needs.length === 0) {
      throw new Error("No needs returned");
    }
  });

  // 5. Database SQL View: District Aggregate
  await check("DBMS View: District Supply-Demand Aggregation (/api/reports/district-aggregate)", async () => {
    const res = await fetch(`${API_BASE}/reports/district-aggregate`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.rows) || data.rows.length === 0) {
      throw new Error("No aggregate rows returned from SQL view");
    }
  });

  // 6. Scoped AI NL->SQL Assistant
  await check("AI Service: Scoped NL->SQL Query Execution (/ask)", async () => {
    const res = await fetch(`${AI_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Show me certified wheelchairs available within 50 km of Chennai." }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.sql || !data.executed) throw new Error("SQL execution failed");
  });

  console.log("\n-------------------------------------------------------");
  console.log(`Summary: ${passed}/${total} test suites passing (${Math.round((passed / total) * 100)}%)`);
  console.log("-------------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
