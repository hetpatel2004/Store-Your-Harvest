# AgriCold Connect — System Use Cases & Functional Specification

## 1. Actor Hierarchy & System Roles

```mermaid
graph TD
    User([System Users]) --> Farmer[🧑‍🌾 Farmer / Producer]
    User --> Owner[🏭 Cold Storage Owner]
    User --> Transporter[🚚 Transport & Export Carrier]
    User --> Admin[🛡️ Platform Super Administrator]

    Farmer -.->|No Login Needed| PublicFarmerServices[Public Discovery & Booking]
    Owner -.->|Register & JWT Login| OwnerPortal[Owner Dashboard & Facilities]
    Admin -.->|Static Super Admin| AdminPortal[Verification Queue & System Metrics]
```

| Actor | Authentication Requirement | Key Responsibilities |
|---|---|---|
| **Farmer** | **None** (100% Free & Open Access) | Search, compare facilities, run cost calculator, request booking, compare transport/export deals |
| **Storage Owner** | **JWT Authentication** (Register & Login) | Register facilities, manage chamber capacity, approve/reject farmer bookings |
| **Admin** | **Static Admin Credentials** (`admin@agricold.in`) | Verify cold storage facilities, inspect compliance, view platform telemetry |

---

## 2. Use Case Diagrams

### 2.1 Complete System Use Case Diagram

```mermaid
graph LR
    Farmer((🧑‍🌾 Farmer))
    Owner((🏭 Storage Owner))
    Admin((🛡️ Super Admin))

    subgraph "AgriCold Connect System Boundary"
        UC1(UC-01: Browse Storages without Login)
        UC2(UC-02: Filter by Crop & Temperature)
        UC3(UC-03: Simulate Total Cost with Freight)
        UC4(UC-04: Compare Storages Side-by-Side)
        UC5(UC-05: Send Instant Booking Request)
        UC6(UC-06: Compare Farm Pickup & Export Freight)
        UC7(UC-07: Book Doorstep Truck / Tractor Shuttle)
        UC8(UC-08: Register Storage Facility)
        UC9(UC-09: Authenticate via JWT)
        UC10(UC-10: Manage Chamber Capacity)
        UC11(UC-11: Accept / Reject Farmer Bookings)
        UC12(UC-12: Super Admin Facility Verification)
        UC13(UC-13: System Telemetry & Spoilage Audit)
    end

    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC6
    Farmer --> UC7

    Owner --> UC8
    Owner --> UC9
    Owner --> UC10
    Owner --> UC11

    Admin --> UC9
    Admin --> UC12
    Admin --> UC13
```

---

## 3. Detailed Use Case Specifications

### Use Case UC-01: Browse & Filter Available Cold Storages
- **Primary Actor**: Farmer
- **Preconditions**: Internet connection; web browser loaded at `/` or `/storages`.
- **Main Success Scenario**:
  1. Farmer enters crop name (e.g. Tomato), quantity (500 kg), location (Sanand), and expected duration (30 days).
  2. System queries active approved facilities in the MongoDB database matching crop compatibility and available capacity.
  3. System computes the **Smart Match Score (0–100%)** considering temperature tolerance, remaining capacity, price, and distance.
  4. Facilities are rendered with live capacity meters, per-kg rates, and APEDA insurance badges.
- **Postconditions**: Farmer views transparent storage choices with zero signup barriers.

---

### Use Case UC-03: Total Cost Simulation (Transparent Outlay)
- **Primary Actor**: Farmer
- **Trigger**: Farmer clicks "Calculate Total Cost" or modifies sliders on a facility card.
- **Business Logic**:
  $$\text{Total Outlay} = (\text{Quantity} \times \text{Rate/kg/month} \times \text{Months}) + \text{Handling Fee} + (\text{Distance} \times \text{Freight/km})$$
- **Expected Outcome**:
  - Itemized breakdown eliminates hidden mandi charges, loading surprises, and toll surcharges upfront.

---

### Use Case UC-06: Farm Pickup & Export Logistics Comparison
- **Primary Actor**: Farmer / Exporter
- **Preconditions**: Harvest yield ready for transportation to cold storage, mandi, or sea port.
- **Main Success Scenario**:
  1. Farmer navigates to `/transport`.
  2. Selects service scope: *All Deals*, *Farm Pickup*, or *Export Port Haulage*.
  3. Selects commodity (e.g., Rice, Wheat, Tomato), weight, and target destination (e.g., Mundra Port).
  4. System fetches verified logistics carriers and displays comparative quotes ranked from lowest total cost.
  5. Displays highlight badges for **Cheapest Verified Quote** and **Fastest Transit Time**.
  6. Farmer selects a carrier and submits a pickup request with zero advance payment.
- **Postconditions**: Carrier receives dispatch alert; driver contacts farmer with gate arrival schedule.

---

### Use Case UC-08 & UC-09: Storage Owner Registration & Management
- **Primary Actor**: Cold Storage Owner
- **Preconditions**: Commercial cold storage facility operator.
- **Main Success Scenario**:
  1. Owner clicks "Storage Owner Portal" on the navbar (`/auth?role=owner`).
  2. Submits facility details: facility name, address, temperature range, capacity, price, and accepted crops.
  3. System creates a secure account with Bcrypt password hashing and issues a signed JSON Web Token (JWT).
  4. Owner enters the **Owner Dashboard** to monitor real-time utilization dials, capacity gauges, and incoming farmer reservations.
  5. Owner clicks "Accept" or "Reject" on booking requests.
- **Postconditions**: Real-time status update propagates to the platform.

---

### Use Case UC-12: Super Admin Verification & Audit
- **Primary Actor**: Platform Administrator
- **Credentials**: `admin@agricold.in` / `Admin@123`
- **Main Success Scenario**:
  1. Admin logs into the Admin Portal (`/admin`).
  2. Inspects facilities submitted with status `pending`.
  3. Reviews generator backup compliance, fire safety, and APEDA insurance certificates.
  4. Approves or denies facility listing.
- **Postconditions**: Approved facilities immediately become discoverable to all Gujarat farmers.