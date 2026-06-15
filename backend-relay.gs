/**
 * SILENT WITNESS NG — Backend Relay
 * Google Apps Script (deploy as Web App)
 * 
 * PURPOSE:
 * - Receives encrypted data packages from the app
 * - Strips all sender metadata (IP is already stripped by Apps Script)
 * - Stores encrypted blobs in Google Sheets
 * - Forwards encrypted packages to vetted recipients via email
 * 
 * SETUP:
 * 1. Create a new Google Sheet called "SilentWitness_Intel"
 * 2. Create tabs: "Submissions", "Recipients", "PhoneLog"
 * 3. In "Recipients" tab, add vetted email addresses in column A
 * 4. Open Extensions > Apps Script, paste this code
 * 5. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL into the app's Setup > Backend Relay URL
 * 
 * SECURITY NOTES:
 * - Data arrives already encrypted (AES-256-GCM) from the client
 * - This script CANNOT read the data — it only stores and forwards the encrypted blob
 * - Google Apps Script does not log sender IP addresses
 * - No personally identifiable information is stored
 */

// =================== CONFIG ===================
const SHEET_NAME = 'SilentWitness_Intel';
const TAB_SUBMISSIONS = 'Submissions';
const TAB_RECIPIENTS = 'Recipients';
const TAB_PHONELOG = 'PhoneLog';

// =================== WEB APP ENTRY ===================

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Validate structure
    if (!payload.iv || !payload.data || !payload.timestamp) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid payload structure'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate submission ID
    const submissionId = 'SUB-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    
    // Store in Sheets
    storeSubmission(submissionId, payload);
    
    // Forward to vetted recipients
    forwardToRecipients(submissionId, payload);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'received',
      id: submissionId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error processing submission: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Processing failed'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    service: 'Silent Witness NG Relay',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// =================== STORAGE ===================

function storeSubmission(id, payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TAB_SUBMISSIONS);
  
  // Create tab if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(TAB_SUBMISSIONS);
    sheet.appendRow([
      'Submission ID',
      'Received At',
      'Original Timestamp',
      'IV (hex)',
      'Encrypted Data Size (bytes)',
      'Encrypted Data (truncated)',
      'Full Data Hash',
      'Forwarded To'
    ]);
    sheet.setFrozenRows(1);
  }
  
  // Hash the full encrypted data for integrity verification
  const dataStr = JSON.stringify(payload.data);
  const dataHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    dataStr
  ).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  
  // Store (only metadata + hash, NOT the full encrypted blob in sheets)
  // Full blob is sent via email to recipients
  sheet.appendRow([
    id,
    new Date().toISOString(),
    payload.timestamp,
    JSON.stringify(payload.iv),
    payload.data.length,
    dataStr.substring(0, 200) + '...',
    dataHash,
    '' // Will be updated after forwarding
  ]);
}

// =================== FORWARDING ===================

function forwardToRecipients(id, payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recipientSheet = ss.getSheetByName(TAB_RECIPIENTS);
  
  if (!recipientSheet) {
    Logger.log('No Recipients tab found — cannot forward');
    return;
  }
  
  const recipients = recipientSheet.getRange('A:A').getValues()
    .flat()
    .filter(email => email && email.includes('@'));
  
  if (recipients.length === 0) {
    Logger.log('No recipients configured');
    return;
  }
  
  // Create encrypted package as attachment
  const packageJson = JSON.stringify(payload, null, 2);
  const blob = Utilities.newBlob(packageJson, 'application/json', id + '_encrypted.json');
  
  const subject = '[Silent Witness] New Submission: ' + id;
  const body = [
    'SILENT WITNESS NG — ENCRYPTED INTELLIGENCE PACKAGE',
    '═══════════════════════════════════════════════════',
    '',
    'Submission ID: ' + id,
    'Received: ' + new Date().toISOString(),
    'Original Timestamp: ' + payload.timestamp,
    'Data Size: ' + payload.data.length + ' encrypted bytes',
    '',
    'The attached file contains an AES-256-GCM encrypted data package.',
    'You need the decryption passphrase to access the contents.',
    '',
    'This package may contain:',
    '• Ransom call audio recording',
    '• Caller phone number and metadata',
    '• Victim information and last known location',
    '• Background sound analysis',
    '• Voice analysis notes',
    '• Witness observations',
    '',
    'HANDLE WITH CARE. This data could save a life.',
    '',
    '— Silent Witness NG Automated Relay'
  ].join('\n');
  
  recipients.forEach(email => {
    try {
      GmailApp.sendEmail(email, subject, body, {
        attachments: [blob],
        name: 'Silent Witness NG',
        noReply: true
      });
    } catch (e) {
      Logger.log('Failed to send to ' + email + ': ' + e.toString());
    }
  });
  
  // Update forwarding status in sheet
  const subSheet = ss.getSheetByName(TAB_SUBMISSIONS);
  const lastRow = subSheet.getLastRow();
  subSheet.getRange(lastRow, 8).setValue(recipients.join(', '));
}

// =================== PHONE INTELLIGENCE ===================
// This function can be run periodically to scan for phone number patterns
// across submissions (requires decrypted data — run manually by investigators)

function analyzePhonePatterns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let phoneSheet = ss.getSheetByName(TAB_PHONELOG);
  
  if (!phoneSheet) {
    phoneSheet = ss.insertSheet(TAB_PHONELOG);
    phoneSheet.appendRow([
      'Phone Number',
      'Times Seen',
      'First Seen',
      'Last Seen',
      'Linked Submissions',
      'States',
      'Cluster ID',
      'Notes'
    ]);
    phoneSheet.setFrozenRows(1);
  }
  
  // NOTE: This function is a template.
  // Actual phone analysis requires decrypted data.
  // Investigators run this after decrypting submissions locally
  // and uploading phone numbers to the PhoneLog tab.
  
  Logger.log('Phone pattern analysis template ready. Populate PhoneLog with decrypted phone data.');
}

// =================== DECRYPTION HELPER ===================
// This is a standalone utility for investigators to decrypt packages
// It runs in their browser, NOT on the server

function getDecryptionInstructions() {
  return `
DECRYPTION INSTRUCTIONS FOR INVESTIGATORS
==========================================

1. Open any modern browser (Chrome, Firefox, Edge)
2. Press F12 to open Developer Console
3. Paste the following code:

---

async function decryptPackage(encryptedJson, passphrase) {
  const pkg = JSON.parse(encryptedJson);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt:enc.encode('SilentWitnessNG_2026'), iterations:100000, hash:'SHA-256'},
    keyMaterial,
    {name:'AES-GCM', length:256},
    false,
    ['decrypt']
  );
  const iv = new Uint8Array(pkg.iv);
  const data = new Uint8Array(pkg.data);
  const decrypted = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, data);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

// Usage:
// 1. Copy the contents of the encrypted JSON attachment
// 2. Run: decryptPackage(jsonString, 'YOUR_PASSPHRASE').then(console.log)

---

The passphrase must be shared securely (in person or via encrypted channel).
NEVER send the passphrase in the same email as the encrypted package.
  `;
}
