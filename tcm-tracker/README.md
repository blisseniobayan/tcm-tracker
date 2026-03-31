# TCM Accountability Tracker — Deployment Guide

## What this is
The Career Multiverse weekly accountability check-in tool.
Members submit their weekly check-in. Bliss views all submissions via the Admin panel.
All data is saved to a Google Sheet.

---

## You will need
- A Google account (to set up the Google Sheet + Apps Script)
- A Netlify account (free tier is fine — netlify.com)
- This project folder

---

## STEP 1 — Set up the Google Sheet

1. Go to **sheets.google.com** → Create a new blank spreadsheet
2. Name it: `TCM Accountability Tracker`
3. Copy the **Sheet ID** from the URL bar:
   ```
   https://docs.google.com/spreadsheets/d/ ► COPY THIS PART ◄ /edit
   ```
4. Keep this ID — you'll need it in the next step

---

## STEP 2 — Set up the Google Apps Script

1. Go to **script.google.com** → click **New project**
2. Delete everything in the editor
3. Open `GoogleAppsScript.gs` from this folder → copy all the code → paste it in
4. Find this line near the top:
   ```javascript
   var SPREADSHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";
   ```
   Replace `PASTE_YOUR_SHEET_ID_HERE` with the Sheet ID from Step 1
5. Click the **floppy disk icon** to save. Name the project: `TCM Tracker`
6. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
7. Click **Authorise access** → choose your Google account → click **Allow**
8. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   Save this URL — you'll need it in Step 4.

---

## STEP 3 — Deploy to Netlify

**Option A — Drag and drop (easiest)**
1. Go to **netlify.com** → log in → click **Add new site → Deploy manually**
2. You'll be asked to drag a folder. First, build the project:
   - Open Terminal in this folder
   - Run: `npm install`
   - Run: `npm run build`
   - This creates a `dist/` folder
3. Drag the `dist/` folder onto the Netlify deploy zone
4. Your site is live (ignore the Apps Script connection for now — do Step 4 next)

**Option B — GitHub (recommended for future updates)**
1. Push this folder to a GitHub repository
2. Go to **netlify.com** → **Add new site → Import an existing project → GitHub**
3. Select your repository
4. Build settings will be auto-detected from `netlify.toml`
5. Click **Deploy site**

---

## STEP 4 — Connect the Google Sheet (add the Apps Script URL)

1. In Netlify, go to your site → **Site configuration → Environment variables**
2. Click **Add a variable**
3. Enter exactly:
   - **Key:** `VITE_SCRIPT_URL`
   - **Value:** [paste the Web App URL from Step 2]
4. Click **Save**
5. Go to **Deploys** → click **Trigger deploy → Deploy site**

After the redeploy finishes, all check-in submissions will save to your Google Sheet,
and the Admin panel will load all submissions from it.

---

## Admin access

- On the check-in form, tap **Admin** at the bottom of the page
- Password: `TCMGlobal2620!`
- The dashboard shows all check-ins with filters by name and week

---

## Updating the site in future

If you ever need to make changes to the code, update the files in `/src/App.jsx`,
push to GitHub (if using Option B), and Netlify will redeploy automatically.

If using Option A (drag and drop), run `npm run build` again and re-upload the new `dist/` folder.

---

## Files in this package

| File | Purpose |
|------|---------|
| `src/App.jsx` | The full React application |
| `src/main.jsx` | React entry point |
| `index.html` | HTML shell |
| `package.json` | Project dependencies |
| `vite.config.js` | Build configuration |
| `netlify.toml` | Netlify build settings |
| `GoogleAppsScript.gs` | Google Apps Script code (paste into script.google.com) |
| `README.md` | This guide |

---

Built for The Career Multiverse · Bliss Eniobayan · March 2026
