# Silent Witness NG — Deployment Guide

## What You Have

| File | Purpose |
|------|---------|
| `index.html` | The full app (rename silent-witness.html to this) |
| `manifest.json` | PWA manifest for home screen installation |
| `backend-relay.gs` | Google Apps Script backend relay |
| `silent-witness-spec.md` | Full system specification |

---

## Step 1: Create the GitHub Repo

```
Repository: tboy2020/silent-witness-ng
Description: Anonymous crisis intelligence platform
Visibility: Public (needed for GitHub Pages)
```

## Step 2: Push Files to GitHub

Using your standard Python/GitHub API workflow:

1. Rename `silent-witness.html` → `index.html`
2. Push `index.html` and `manifest.json` to the repo root

The app will be live at: **https://tboy2020.github.io/silent-witness-ng**

## Step 3: Set Up the Backend Relay

1. Go to Google Sheets → Create new spreadsheet named **"SilentWitness_Intel"**
2. Create three tabs:
   - **Submissions** — receives encrypted packages
   - **Recipients** — column A = vetted email addresses
   - **PhoneLog** — for investigator phone pattern analysis
3. In the Recipients tab, add email addresses of vetted journalists/lawyers (one per row in column A)
4. Go to **Extensions → Apps Script**
5. Delete default code, paste contents of `backend-relay.gs`
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the deployment URL
8. Open the Silent Witness app → Setup → paste the URL in **Backend Relay URL**

## Step 4: Test the Full Flow

1. Open the app on your phone
2. Go to Setup:
   - Add at least one trusted contact
   - Set your encryption passphrase
   - Paste the backend relay URL
   - Save
3. Test Ransom Call Mode:
   - Tap "Ransom Call Mode"
   - Allow microphone access
   - Tap through the guided prompts
   - End the call
   - Fill in test data
   - Hit "Encrypt & Send"
4. Verify:
   - Check the Google Sheet — a new row should appear in Submissions
   - Check the recipient emails — encrypted package should arrive as attachment
   - Check the Call Log in the app — test case should appear

## Step 5: Install as PWA

**On iPhone (Safari):**
1. Open https://tboy2020.github.io/silent-witness-ng
2. Tap Share → Add to Home Screen
3. Name it anything innocuous (e.g., "Calculator" or "Notes")

**On Android (Chrome):**
1. Open the URL
2. Tap the "Install" prompt or Menu → Install App

## Security Considerations

### What's Protected
- **No accounts** — nothing to hack, no passwords to steal
- **No server** — GitHub Pages is static, Apps Script is serverless
- **Encrypted on-device** — data is AES-256-GCM encrypted BEFORE leaving the phone
- **Metadata stripped** — no IP logging, no device fingerprinting
- **Relay is blind** — the backend cannot read the encrypted data

### What to Be Careful About
- **Passphrase sharing** — share the decryption passphrase with recipients IN PERSON or via Signal, never by email
- **Recipient vetting** — only add email addresses of people you trust completely
- **Phone security** — if the user's phone is seized, the app itself reveals nothing (no data stored after send)
- **GitHub Pages** — the source code is public; this is fine because security comes from encryption, not obscurity

### App Disguise
The app icon can be changed after PWA installation. On iOS, the home screen name can be set to anything during "Add to Home Screen." Consider naming it something innocuous.

---

## Distribution Strategy

### Phase 1: Your Network
- Install on your own devices
- Share with trusted church members at Winners Chapel
- Share with family in Nigeria via WhatsApp link

### Phase 2: Wider Church Network
- Present the concept to church leadership
- Create a one-page flyer explaining how to install
- Distribute the link through Winners Chapel International chapters

### Phase 3: Journalist Partnerships
- Contact Sahara Reporters, Premium Times, The Cable
- Offer them recipient access to the encrypted feed
- Draft a formal MOU for data handling

### Phase 4: Community Scaling
- WhatsApp chain distribution
- Community group presentations
- Diaspora organization partnerships

---

## Future Enhancements (Phase 2 Build)

1. **Offline mode** — Service worker for full offline capability
2. **Audio compression** — Reduce recording file size for low-bandwidth areas
3. **Multi-call case linking** — Connect follow-up calls to the same case
4. **Pattern dashboard** — Web interface for investigators to visualize phone clusters
5. **SMS fallback** — Send encrypted data via SMS where internet is unavailable
6. **Decryption portal** — Standalone web page for investigators to decrypt packages in-browser
7. **Amber Alert broadcast** — Auto-generate and distribute victim alerts to community networks
