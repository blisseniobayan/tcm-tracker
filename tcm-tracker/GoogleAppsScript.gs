// ═══════════════════════════════════════════════════════════════════
//  TCM ACCOUNTABILITY TRACKER — Google Apps Script
//  Paste this entire file into script.google.com and follow the
//  SETUP INSTRUCTIONS below.
// ═══════════════════════════════════════════════════════════════════

// ─── CONFIGURATION ──────────────────────────────────────────────────
//  These two values must match what you have in the React app.
//  If you change the admin password in the app, change it here too.
var ADMIN_PASSWORD = "TCMGlobal2620!";
var SHEET_NAME     = "Check-Ins";        // Tab name in your Google Sheet
// ────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════
//  SETUP INSTRUCTIONS  (do this once, in order)
//
//  1. Go to https://script.google.com  →  New project
//  2. Delete any existing code and paste this entire file in.
//  3. Click the floppy-disk icon (Save).  Name the project "TCM Tracker".
//  4. Click  Extensions → Apps Script  (if not already there).
//  5. Open the Google Sheet you want to use as your database:
//       • Create a new blank Google Sheet at sheets.google.com
//       • Copy the Sheet ID from the URL bar:
//           https://docs.google.com/spreadsheets/d/ ► SHEET_ID ◄ /edit
//       • Paste it into the SPREADSHEET_ID variable below.
//  6. Save the script again.
//  7. Click  Deploy → New deployment
//       • Type: Web app
//       • Execute as: Me (your Google account)
//       • Who has access: Anyone
//       • Click Deploy → Authorise access → Choose your account → Allow
//  8. Copy the Web App URL that appears  (looks like:
//       https://script.google.com/macros/s/AKfycb.../exec )
//  9. Go to Netlify → Your Site → Site Configuration → Environment Variables
//       Add:  VITE_SCRIPT_URL  =  [the URL you just copied]
// 10. In Netlify, trigger a new deploy (Deploys → Trigger deploy → Deploy site).
//
//  That's it. Check-ins will now appear in your Google Sheet.
// ═══════════════════════════════════════════════════════════════════

var SPREADSHEET_ID = "PASTE_YOUR_SHEET_ID_HERE"; // ← replace this


// ─── HEADERS ────────────────────────────────────────────────────────
var HEADERS = ["Timestamp", "ID", "Name", "Week", "Worked On", "Completed", "Next Goal", "Rating"];


// ─── HELPERS ────────────────────────────────────────────────────────
function getSheet() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  // Auto-create the tab and header row on first run
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);

    // Style the header row
    var header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setFontWeight("bold");
    header.setBackground("#C10020");
    header.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  return sheet;
}


// ─── doPost  (called when the React app submits a check-in) ─────────
function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    sheet.appendRow([
      data.timestamp  || new Date().toISOString(),
      data.id         || "",
      data.name       || "",
      data.week       || "",
      data.did        || "",
      data.completed  || "",
      data.goal       || "",
      data.rating     || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ─── doGet  (called by the Admin view to read all check-ins) ────────
function doGet(e) {
  var params = e.parameter || {};

  // Protect the read endpoint with the admin password
  if (params.pw !== ADMIN_PASSWORD) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "unauthorised" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (params.action !== "getAll") {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheet  = getSheet();
    var rows   = sheet.getDataRange().getValues();
    var result = [];

    // rows[0] is the header row — skip it
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      result.push({
        timestamp: r[0] || "",
        id:        r[1] || String(i),
        name:      r[2] || "",
        week:      r[3] || "",
        did:       r[4] || "",
        completed: r[5] || "",
        goal:      r[6] || "",
        rating:    r[7] || 0,
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
