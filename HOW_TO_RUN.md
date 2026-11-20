# How to Run: Elijah AI Company Frontend (Contractor Web App)

The **Company Frontend** is the core web portal used by contractor businesses (owners, dispatchers, technicians, and office managers) to manage customer inquiries, live VoIP/AI call transcripts, automated scheduling, technician dispatch swimlanes, and customer CRM. It also hosts the public booking widget where homeowners can schedule service or initiate browser-based WebRTC voice calls with the AI receptionist.

---

## 1. Quick Specifications

- **Framework:** Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Default Port:** `3000` (`http://localhost:3000`)
- **Key Integrations:**
  - Elijah Backend API (`http://localhost:5000/api/v1`)
  - Voice Service / Retell Client WebRTC SDK (`http://localhost:4002/api/v1`)
  - AI Service (`http://localhost:4003/api/v1`)
  - Workflow Service (`http://localhost:4004/api/v1`)

---

## 2. Prerequisites

1. **Node.js**: v18.17.0+ or v20+ installed.
2. **Backend Services**:
   - The Elijah Core Backend (`http://localhost:5000`) should be running for auth, jobs, leads, and CRM data.
   - The `AiService` Docker stack should be running if you are testing live voice calls, WebRTC, or recording playback.

---

## 3. Environment Configuration

Check or create the file `company-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_VOICE_API_URL=http://localhost:4002/api/v1
NEXT_PUBLIC_AI_API_URL=http://localhost:4003/api/v1
NEXT_PUBLIC_WORKFLOW_API_URL=http://localhost:4004/api/v1
```

---

## 4. Installation & Startup

Open a terminal (PowerShell or Bash) in `d:\PODS\ElijahAi\company-frontend`:

### Step 1: Install Dependencies
```powershell
# On Windows PowerShell:
npm.cmd install

# On macOS/Linux:
npm install
```

### Step 2: Start the Development Server
```powershell
# On Windows PowerShell:
npm.cmd run dev

# On macOS/Linux:
npm run dev
```

The application will start at **`http://localhost:3000`**.

---

## 5. Key URLs & Pages

| Page Route | Purpose | Features & Testing Notes |
|---|---|---|
| `http://localhost:3000/login` | Contractor Staff Login | Sign in as Owner, Dispatcher, Admin, or Technician. |
| `http://localhost:3000/` | Operations Dashboard | Live metrics: total revenue, unassigned triage calls, active technician tracking, recent calls. |
| `http://localhost:3000/inbox` | **Unified AI Inbox** | Live call recordings with real audio playback, waveform scrubbing, AI transcription, sentiment analysis, customer CRM sidebar, and two-way SMS reply interface. |
| `http://localhost:3000/leads` | Leads & Pipeline | Real-time inbound pipeline. Shows converted AI bookings, job numbers (`JOB-XXXX`), caller qualification summary, and triage status. |
| `http://localhost:3000/schedule` | Schedule & Technician Swimlanes | Visual dispatch board grouped by technician. Features date navigation, real appointment cards, and early dispatch safeguards. |
| `http://localhost:3000/customers` | Customers & CRM | Complete customer directory with service addresses, phone numbers, and past job histories. |
| `http://localhost:3000/book/vanguard-electric` | **Public Customer Booking Page** | Homeowner booking interface. Allows homeowners to submit a booking form or click **"Start AI Voice Call"** to talk directly to the AI receptionist via browser WebRTC. |

---

## 6. Demo Login Credentials

You can log in at `http://localhost:3000/login` using any seeded contractor tenant account:

| Role | Email | Password | Tenant |
|---|---|---|---|
| **Business Owner** | `owner@pashupat.cloud` | `password123` | Vanguard Electric & Power |
| **Dispatcher** | `dispatcher@pashupat.cloud` | `password123` | Vanguard Electric & Power |
| **Field Technician** | `technician@pashupat.cloud` | `password123` | Vanguard Electric & Power |
| **Office Manager** | `office@pashupat.cloud` | `password123` | Vanguard Electric & Power |

---

## 7. How to Test In-Browser Voice Calling (WebRTC)

1. Ensure the `AiService` Docker containers are up (`docker compose up -d`).
2. Go to `http://localhost:3000/book/vanguard-electric` in Google Chrome or Edge.
3. Click the **"Talk to AI Receptionist (Live Call)"** button.
4. Allow microphone permissions when prompted by your browser.
5. Speak with Elijah AI:
   - Provide an issue (e.g. *"My AC stopped blowing cold air"*).
   - Provide your name and address (e.g. *"100 North Central Ave, Phoenix"*).
   - Select a time window (e.g. *"Tomorrow between 3:30 PM and 5:30 PM"*).
6. Once the call ends:
   - Open `http://localhost:3000/inbox` to listen to the call audio and review the transcript.
   - Open `http://localhost:3000/schedule` to see the job assigned on the dispatch board.
   - Open `http://localhost:3000/leads` to view the converted lead.

---

## 8. Build for Production

```powershell
npm.cmd run build
npm.cmd run start
```
Runs production Next.js build on port 3000.
