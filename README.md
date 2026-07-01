# Khata — Personal Finance Tracker

A single-page personal finance app for tracking transactions and net worth, with data synced to your own Google Drive.

## Features

- Log expenses/income by category (groceries, transport, medical, EMIs, etc.)
- Track wealth accounts: bank, FD, PPF, EPF, mutual funds, stocks, gold, property, loans, credit cards, and more
- Net worth overview (assets vs. debts)
- Sign in with Google; data is stored in your own Drive, not on any third-party server

## How it works

`khata-v5.html` is a self-contained static app — no backend, no build step. It uses:

- **Google Identity Services** for sign-in
- **Google Drive API** (`drive.file` scope) to read/write two files in your Drive:
  - `khata-transactions.csv` — transaction history
  - `khata-wealth.json` — account/net worth data

Because it only requests the `drive.file` scope, the app can only see files it creates itself — it has no access to the rest of your Drive.

## Running locally

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/khata-v5.html`.

### Google Cloud setup (required for login/sync)

1. Create/select a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google Drive API**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add your local URL (e.g. `http://localhost:8000`) under **Authorized JavaScript origins**
5. On the **OAuth consent screen**, add the `.../auth/drive.file` scope, and add your Google account under **Test users** if the app is in Testing mode
6. Paste the Client ID into the app's login screen
