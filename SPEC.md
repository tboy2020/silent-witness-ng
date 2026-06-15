# Silent Witness NG — Full System Specification

## Mission
Give Nigerian families a tool that turns their worst moment into actionable intelligence, protects them during ransom negotiations, and builds a collective dataset that exposes kidnapping networks over time.

---

## System Architecture

### Four Modules

**Module 1 — Dead Man's Switch (Prevention)**
A personal safety check-in that runs silently. If the user fails to respond within their set window, their last GPS coordinates and a pre-written alert are sent to their trusted circle.

**Module 2 — Ransom Call Intelligence (Active Crisis)**
The core of the system. Activates when a family receives a ransom call. Records, guides, and captures data — then routes it securely to the vetted network.

**Module 3 — Anonymous Tip Submission (Community Intel)**
Anyone can submit what they've seen — suspicious activity, vehicle plates, safe house locations — without revealing who they are.

**Module 4 — Pattern Intelligence Dashboard (Analysis)**
Aggregated data across all submissions. Phone number clusters, voice matches, geographic hotspots, ransom amount patterns. Accessible only to vetted journalists and investigators.

---

## Module 2 Deep Dive — Ransom Call Intelligence

### Screen Flow

```
HOME
  │
  ├── SETUP (one-time)
  │     ├── Add trusted contacts (who gets the data)
  │     ├── Set emergency passphrase
  │     └── Test recording capability
  │
  ├── RANSOM CALL MODE (crisis moment)
  │     │
  │     ├── PRE-CALL SCREEN
  │     │     "Take 3 breaths. You are not alone."
  │     │     [I'm Ready — Start Recording]
  │     │
  │     ├── DURING CALL SCREEN
  │     │     ● Recording indicator (pulsing)
  │     │     ● Live timer
  │     │     ● Guided prompts (swipeable cards):
  │     │         1. "Stay calm. Let them talk first."
  │     │         2. "Ask: Can I speak to [name]?"
  │     │         3. "Ask: What is your proof of life?"
  │     │         4. "Listen for background sounds"
  │     │         5. "Ask: When will you call again?"
  │     │         6. "Do NOT agree to a number yet"
  │     │     ● [End Call] button
  │     │
  │     ├── POST-CALL CAPTURE
  │     │     ● Auto-populated: timestamp, duration, caller number
  │     │     ● User inputs:
  │     │         - Victim's name
  │     │         - Victim's last known location
  │     │         - Ransom amount demanded
  │     │         - Language/dialect spoken by caller
  │     │         - Background sounds heard (checklist):
  │     │           □ Traffic / road noise
  │     │           □ Generator
  │     │           □ Animals (goats, chickens)
  │     │           □ Water / river
  │     │           □ Other voices
  │     │           □ Music / radio
  │     │           □ Construction
  │     │           □ Nothing — very quiet
  │     │         - Caller's tone/demeanor
  │     │         - Any names or nicknames used
  │     │         - Did they mention a deadline?
  │     │     ● [Add Photos] — victim's recent photo for alert
  │     │
  │     └── SEND & SECURE
  │           ● Data encrypted on-device
  │           ● Routed to vetted network
  │           ● Local copy deleted (optional)
  │           ● Confirmation: "Your data is with people who act."
  │           ● Next steps guidance displayed
  │
  └── CALL LOG
        ● History of all ransom calls logged
        ● Each entry shows: date, number, duration, status
        ● Can add follow-up calls to same case
```

### Data Model

```
CASE {
  case_id:            auto-generated UUID
  created_at:         timestamp
  status:             active | resolved | cold
  victim: {
    name:             string
    age:              number
    gender:           string
    last_known_location: {
      description:    string (e.g., "Along Abuja-Kaduna highway")
      coordinates:    lat/lng (if available)
    }
    photo:            encrypted blob
    date_taken:       timestamp
  }
}

RANSOM_CALL {
  call_id:            auto-generated UUID
  case_id:            foreign key → CASE
  timestamp:          ISO datetime
  duration_seconds:   number
  caller_number:      string (with country code)
  audio_recording:    encrypted blob
  audio_hash:         SHA-256 (for voice matching without decrypting)
  ransom_demanded:    number (NGN)
  language_spoken:    string
  dialect_notes:      string
  background_sounds:  string[] (from checklist)
  caller_demeanor:    string
  names_mentioned:    string[]
  deadline_given:     string
  proof_of_life:      boolean
  notes:              freetext
}

TIP {
  tip_id:             auto-generated UUID
  submitted_at:       timestamp
  location: {
    state:            string
    lga:              string
    description:      string
    coordinates:      lat/lng (optional)
  }
  tip_type:           suspicious_activity | vehicle | safe_house | phone_number | other
  details:            freetext
  attachments:        encrypted blob[]
  phone_numbers:      string[]
  vehicle_info: {
    plate:            string
    color:            string
    make_model:       string
  }
}

PHONE_CLUSTER {
  cluster_id:         auto-generated UUID
  phone_numbers:      string[]
  linked_cases:       case_id[]
  linked_tips:        tip_id[]
  first_seen:         timestamp
  last_seen:          timestamp
  states_active_in:   string[]
  confidence_score:   number (0-100)
}
```

### Security Architecture

```
DEVICE LAYER
  ├── No user accounts — no login, no identity
  ├── All data encrypted on-device before transmission
  ├── Encryption key derived from device + one-time passphrase
  ├── No persistent logs on device after send
  └── App disguisable (can appear as calculator or utility app)

TRANSPORT LAYER
  ├── Data sent via HTTPS to serverless endpoint
  ├── Endpoint hosted on Cloudflare Workers (no single server to seize)
  ├── Request metadata stripped (IP, user-agent)
  └── Tor-compatible for high-risk submitters

STORAGE LAYER
  ├── Encrypted at rest in cloud storage
  ├── Geographic distribution (data not stored in Nigeria)
  ├── Access requires multi-party decryption
  │   (no single person can access alone)
  └── Auto-purge after 24 months if no linked case

DISTRIBUTION LAYER
  ├── Vetted recipients receive encrypted packages
  ├── Each recipient gets a unique decryption key
  ├── Audit trail: who accessed what, when
  └── Recipient vetting process:
      ├── Known investigative journalist with published track record
      ├── Licensed human rights attorney
      ├── Verified diaspora advocacy organization
      └── Minimum 2 existing members must vouch
```

### The Intelligence Layer — How Patterns Emerge

After 50+ submissions, the system can reveal:

1. **Phone number networks** — Same number appearing across 3 cases in Kaduna and 2 in Niger State = organized gang, not opportunistic crime

2. **Voice clustering** — Audio hash comparison identifies the same caller across cases families thought were unrelated

3. **Geographic corridors** — Kidnappings cluster along specific highway segments at specific times, revealing operational patterns

4. **Ransom economics** — Demand amounts correlate with victim profiles, suggesting the gang has insider intelligence on family finances

5. **Temporal patterns** — Calls made at consistent times suggest a base of operations (they call when they feel safe)

6. **Language/dialect mapping** — Narrows the gang's origin even when they operate far from home

### Distribution & Adoption Strategy

**Phase 1 — Diaspora churches and community groups**
Nigerian churches abroad (like Winners Chapel International) become distribution hubs. Congregants install the app and share with family back home.

**Phase 2 — WhatsApp chain**
A shareable link that installs as a PWA. Spreads through existing community WhatsApp groups — the same networks that currently spread panic can spread protection.

**Phase 3 — Journalist partnerships**
Sahara Reporters, Premium Times, The Cable, Foundation for Investigative Journalism — formal agreements to receive and act on intelligence packages.

**Phase 4 — Scale**
If the model works in Nigeria, it's applicable anywhere with systemic kidnapping and institutional failure — Mexico, Colombia, Haiti, parts of Central America and South Asia.

---

## Tech Stack (Buildable by Pastor Taiwo)

| Component | Technology | Why |
|---|---|---|
| Frontend | Single HTML file, PWA | Your strength. Works offline. Installable. |
| Call recording | MediaRecorder API + native phone recorder guidance | Browser API where supported, fallback to native |
| Encryption | Web Crypto API (AES-256-GCM) | Built into every browser, no dependencies |
| Backend relay | Cloudflare Workers or Google Apps Script | Serverless, no infrastructure to seize |
| Data storage | Encrypted blobs in cloud storage (R2/GCS) | Distributed, outside local jurisdiction |
| Pattern analysis | Python scripts (your skill set) | Run offline on aggregated, de-identified data |
| Distribution | GitHub Pages PWA | Your existing deployment pipeline |

---

## What You Can Build Today

1. The Ransom Call Mode interface — screens, guidance prompts, data capture form
2. The encryption + relay pipeline (similar to CertWatch architecture)
3. The anonymous tip submission form
4. A prototype pattern dashboard

## What Needs Partners

1. Legal review — data protection, cross-border implications
2. Journalist agreements — formal MOU with receiving organizations
3. Voice analysis expertise — for audio clustering
4. Telecom knowledge — Nigerian cell tower / SIM registration landscape
5. On-the-ground testing — families willing to install and provide feedback

---

*"The only thing necessary for the triumph of evil is for good men to do nothing." — This tool is something.*
