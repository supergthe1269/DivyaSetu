# DivyaSetu (दिव्यसेतु) — Societal Digital Innovation & TRL Report
**Course**: BCSE302P – Database Systems Lab  
**Challenge Track**: T7 — Inclusion & Accessibility  
**Target Maturity Level**: TRL 4–5 (Working Prototype Validated in Realistic Controlled Environment)  

---

## 1. Problem Discovery & Empirical Gap

### 1.1 Societal Context & Evidence
According to the Census of India and the National Sample Survey Office (NSSO 76th Round), over **26.8 million persons in India live with disabilities**, of which mobility and hearing impairments represent the largest share. Assistive technologies (wheelchairs, tri-cycles, crutches, hearing aids) are essential for personal mobility, dignity, education, and livelihood.

However, access to assistive devices in India is currently defined by:
1. **Episodic Camp Dependency**: Government schemes (such as ADIP — Assistance to Disabled Persons) and philanthropic NGOs organize periodic distribution camps. Between camps (often months or years apart), there is no digital mechanism to acquire equipment.
2. **Geographic Inversion of Surplus**: Urban centers (hospitals, affluent donors, specialized clinics) accumulate surplus, working assistive devices once a patient recovers or upgrades. Conversely, semi-urban and rural areas experience severe deficits.
3. **Trust & Safety Deficit**: Beneficiaries and field workers are reluctant to accept second-hand assistive equipment without certified guarantees of mechanical integrity, hygiene, and fit.
4. **Permanent Sunk Capital**: When an individual recovers from a temporary injury or outgrows a pediatric wheelchair, the device sits idle in storage rather than re-entering circulation.

---

## 2. The Innovation: Continuous Redistribution with Digital Trust Ledgers

DivyaSetu replaces the episodic camp model with an ongoing, location-aware digital clearinghouse:

| Dimension | Existing Model (Distribution Camps) | DivyaSetu Innovation |
| :--- | :--- | :--- |
| **Availability** | Episodic (1–2 times/year per district) | Continuous (365 days/year real-time) |
| **Matching Logic** | First-come, first-served queue at physical grounds | Multi-factor PostGIS geospatial proximity + urgency ranking |
| **Trust Mechanism** | Visual guess by recipient | Accredited verifier inspection with cryptographic digital twin |
| **Asset Lifecycle** | One-way donation (ends upon delivery) | Closed-loop circular economy (`DELIVERED` &rarr; `RE_LISTED`) |
| **Field Telemetry** | Paper registers, manual tallying | Real-time SQL View (`vw_district_aggregate`) and Scoped AI queries |

---

## 3. Measurable Societal Outcomes

1. **Reduction in Wait Time**: Critical post-injury and progressive conditions receive matches within hours instead of waiting months for the next regional camp.
2. **Capital Efficiency & Waste Reduction**: Mobilizes millions of rupees worth of idle assistive equipment into productive circulation, directly contributing to UN Sustainable Development Goals (SDG 3: Good Health, SDG 10: Reduced Inequalities, SDG 12: Responsible Consumption).
3. **Accessibility by Design**: Intuitive UI with role-based workflows enabling NGO field staff to onboard beneficiaries who do not own smartphones.

---

## 4. Technology Readiness Level (TRL) Justification

### Target Level: TRL 4–5
- **TRL 4 (Component Validation in Laboratory Environment)**:
  - PostgreSQL 16 + PostGIS relational engine verified with 11 normalized tables and 14 active DBMS concepts.
  - ACID transaction with row-level locking (`SELECT ... FOR UPDATE`) successfully stress-tested against concurrent double-claim race conditions.
  - Scoped NL&rarr;SQL assistant verified with read-only database role enforcement.
- **TRL 5 (Prototype Validated in Relevant Environment)**:
  - Realistic data model populated with 24 devices and 10 urgent needs mapped across realistic GPS coordinates in Chennai, Madurai, Coimbatore, Bengaluru, and other Indian districts.
  - End-to-end user journeys validated from donor listing to verifier certification, geospatial matching, and circular re-listing.
