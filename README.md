# Khata — Personal Finance Tracker

A personal finance app for tracking transactions and net worth, with data synced to your own Google Drive.

## Features

- Log expenses/income by category (groceries, transport, medical, EMIs, etc.)
- Track wealth accounts: bank, FD, PPF, EPF, mutual funds, stocks, gold, property, loans, credit cards, and more
- Net worth overview (assets vs. debts)
- Analytics (category/sub-category/payment-method breakdowns) and personalised savings suggestions
- Sign in with Google; data is stored in your own Drive, not on any third-party server

This repo has two versions of the app:

- **`src/`** — the current React + TypeScript + Tailwind rebuild (see below). This is the one under active development.
- **`khata-v5.html`** — the original self-contained single-file version (no build step, no backend). Still works standalone; see [Legacy static app](#legacy-static-app-khata-v5html) below.

## Running the React app locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

```bash
npm run test    # run the test suite
npm run build   # production build (also type-checks)
```

### Google Cloud setup (required for sign-in/sync)

Sign-in uses **Google Identity Services** and a single Google OAuth Client ID configured at build time — end users never see or enter a Client ID, they just click "Sign in with Google". You (the developer/deployer) create this once:

1. Create/select a project in [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services → Enabled APIs** → enable the **Google Drive API**
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application**
4. Under **Authorized JavaScript origins**, add every URL this app will run from, e.g.:
   - `http://localhost:5173` (dev server)
   - `http://localhost:4173` (`vite preview`)
   - your production URL (e.g. `https://<username>.github.io` for GitHub Pages)
   - *(no Authorized redirect URIs are needed — this uses the GIS JS SDK, not a redirect flow)*
5. On the **OAuth consent screen**, add the `.../auth/drive.file` scope, and add your Google account under **Test users** if the app is in Testing mode
6. Copy the generated Client ID and put it in a `.env.local` file at the repo root (gitignored):

   ```bash
   cp .env.example .env.local
   # then edit .env.local and paste your Client ID
   ```
7. Restart `npm run dev` (env vars are read at build/start time)

If `VITE_GOOGLE_CLIENT_ID` isn't set, the app still works fully offline — the login screen shows a "not configured" note and a "Skip for now" option, since sync is opportunistic and never blocks local use.

Because the app only requests the `drive.file` scope, it can only see files it creates itself (`khata-transactions.csv` and `khata-wealth.json`) — it has no access to the rest of your Drive.

### Deploying (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds and deploys `main` to GitHub Pages automatically. Two one-time steps in the GitHub UI (need repo admin access, so only you can do these):

1. **Settings → Secrets and variables → Actions → New repository secret** → name it `VITE_GOOGLE_CLIENT_ID`, value = your OAuth Client ID
2. **Settings → Pages → Build and deployment → Source** → select **GitHub Actions**

After that, every push to `main` deploys to `https://<username>.github.io/My_Katha_Book/`. Make sure that exact URL is added to the OAuth Client ID's Authorized JavaScript origins (step 4 above) — note the origin Google checks is just the scheme+host (`https://<username>.github.io`), not the `/My_Katha_Book/` path.

## Legacy static app (`khata-v5.html`)

A self-contained static app — no backend, no build step. Uses the same Google Identity Services + Drive API approach, but the Client ID is pasted directly into its own login screen (no build step to inject an env var).

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/khata-v5.html`, and follow the same Google Cloud setup steps above — in step 6, paste the Client ID directly into the app's login screen instead of a `.env.local` file.
