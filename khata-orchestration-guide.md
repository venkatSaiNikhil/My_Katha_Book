# Khata — End-to-End Agent Orchestration Guide

> Build the complete Khata personal finance app using Claude Code.
> Zero manual coding. Each phase is a self-contained prompt — copy, paste, done.

---

## How to use this guide

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Create your project folder, run `claude` inside it
3. Paste Phase 0 commands, create `CLAUDE.md`
4. Work through each phase in order — **never skip**
5. Each phase ends when `npm run test` passes with zero failures

**Token strategy:** Each phase is isolated. The agent never holds the full codebase in context at once. This keeps each session under ~12k tokens instead of 60k+.

**Total estimated tokens across all phases:** ~40k

---

## Phase 0 — Setup

**One time only. Run these terminal commands yourself.**

### Terminal commands

```bash
npm install -g @anthropic-ai/claude-code
mkdir KhathaBook && cd KhathaBook
git init
claude
```

### Create CLAUDE.md — paste this as your first file

```markdown
# Khata — personal finance app

## Project rules (agent must follow always)
- App name: Khata. Target users: Indian households.
- Stack: React (Vite) + TypeScript + TailwindCSS for web.
  Capacitor for Android packaging.
- Storage: localStorage (offline-first) + Google Drive sync via REST API.
- Auth: Google OAuth 2.0 (user supplies their own Client ID).
- Currency: always Indian Rupee (INR). Format: ₹1,23,456 (en-IN locale).
- All amounts stored as integers (paise) to avoid float drift.
- Categories/sub-categories are user-editable. Ship 13 defaults.
- Every feature must work offline. Sync is opportunistic.
- No external backend. No database. No paid APIs.
- Write tests for every utility function and data transformer.
- After every phase: run tests, fix all failures before moving on.
- Commit after every phase with a clear message.
```

**Estimated tokens:** ~500

---

## Phase 1 — Data Layer

**Builds:** TypeScript types, 13 default categories, localStorage helpers, CSV/JSON serialisers, unit tests.

**Token tip:** This phase has no UI. The agent works only on `.ts` files — very low token cost since no HTML/CSS is generated.

**Estimated tokens:** ~6k

### Agent prompt

```
Read CLAUDE.md first.

## Task
Create src/data/ with these files:

### types.ts
Export these TypeScript interfaces:
- Transaction: { id, date (ISO string), type ('expense'|'income'), categoryId, subcategory, method ('UPI'|'Cash'|'Credit card'|'Debit card'|'Net banking'|'Cheque'), amountPaise (integer), note, createdAt }
- Category: { id, label, icon (emoji string), color ('rust'|'teal'|'amber'|'plum'|'slate'), subcategories: string[], isCustom? }
- WealthEntry: { id, type (one of 18 wealth types), name, valuePaise, bank?, interestRate?, emi?, maturityDate?, dueDate?, creditLimit?, grams?, uanNumber?, createdAt }
- User: { name, email, picture?, clientId }
- AppState: { transactions: Transaction[], categories: Category[], wealth: WealthEntry[], user: User|null, driveFileIds: { txn: string|null, wealth: string|null } }

### categories.ts
Export DEFAULT_CATEGORIES: Category[] with these 13 entries and all sub-categories:

Home & Living (🏠 rust): Rent/EMI, Electricity, Water/Gas, Internet/Cable, Household supplies, Domestic help, Maintenance & Repairs, Furniture & Appliances, Other household

Groceries (🛒 teal): Vegetables & Fruits, Groceries dry, Milk & Dairy, Cooking oil & Spices, Eggs & Meat, Packaged foods, Other groceries

Food & Dining (🍽️ amber): Breakfast/Tiffin, Lunch, Dinner, Tea/Coffee/Snacks, Zomato/Swiggy, Restaurant dining, Dhaba/Street food, Other food

Medical & Health (💊 teal): Pharmacy/Tablets, General OP, Specialist consultation, Lab tests, Scan/X-ray/MRI, Hospital admission, Health insurance premium, Glasses/Contacts, Gym/Fitness, Vitamins & Supplements, Other medical

Transport (🚌 slate): TSRTC/City bus, Metro/MMTS, Auto rickshaw, Rapido/Namma Yatri, Ola/Uber, Bike fuel/Petrol, Car fuel/CNG, Parking & Toll, Other transport

Travel (✈️ plum): Train ticket, Flight ticket, Hotel/Accommodation, Cab rental, Vacation expenses, Weekend trip, Other travel

Entertainment (🎬 plum): Movie tickets, OTT subscriptions, Gaming, Events & Concerts, Amusement park, Books & Magazines, Other entertainment

Shopping (🛍️ amber): Clothing & Footwear, Accessories, Electronics & Gadgets, Personal care, Salon/Parlour, Cosmetics & Skincare, Gifts & Flowers, Kids items, Pet care, Other shopping

Education (📚 teal): School/College fees, Tuition/Coaching, Books & Stationery, Online courses, Exam fees, Software/Tools, Other education

Finance & EMIs (💳 slate): Credit card payment, Home loan EMI, Vehicle loan EMI, Personal loan EMI, Life insurance premium, Vehicle insurance premium, SIP/Mutual fund, Stocks/Investment, FD deposit, Other finance

Utilities & Bills (📱 rust): Mobile recharge, DTH/Cable TV, Broadband, Newspaper, Puja/Religious, Charity/Donation, Other utilities

Cash & ATM (💵 amber): ATM withdrawal, Cash to family, Cash gift, Miscellaneous cash, Unknown spend

Other (🪙 slate): Miscellaneous, Uncategorized

### storage.ts
- useStorage() hook: load(), save(state), clear()
- Schema version = 1. On load, if version mismatch, run migration function.
- Store keys: 'khata_v1_txns', 'khata_v1_cats', 'khata_v1_wealth', 'khata_v1_user', 'khata_v1_drive'

### formatters.ts
- formatRupee(paise: number): string  → '₹1,23,456' using en-IN locale
- formatRupeeCompact(paise: number): string → '₹1.2L' for lakhs, '₹45K' for thousands
- paiToRupee(paise: number): number
- rupeeToPaise(rupees: number): number (round to integer)
- formatDate(iso: string): string → '12 Jun 2025'
- relativeDate(iso: string): string → 'Today', 'Yesterday', '3 days ago'

### csv.ts
- transactionsToCSV(txns: Transaction[], cats: Category[]): string
- csvToTransactions(csv: string): Transaction[]
- Round-trip safe. Header: ID,Date,Type,Category,Subcategory,Method,Amount,Note

## Tests
Write src/data/__tests__/ with Vitest tests for:
- formatRupee: test 0, 100 (₹1), 100000 (₹1,000), 10000000 (₹1,00,000)
- rupeeToPaise: test float inputs round correctly
- csvToTransactions(transactionsToCSV(txns)) deep-equals txns (round-trip)
- storage load/save cycle using localStorage mock

## Done when
`npm run test` passes all tests with zero failures.
```

---

## Phase 2 — Core UI Shell

**Builds:** App shell, tab navigation, monthly summary strip, transaction list, add transaction bottom sheet, FAB.

**Token tip:** Give the agent design tokens explicitly (colors, font sizes). This prevents it from inventing its own palette and needing correction rounds.

**Estimated tokens:** ~12k

### Agent prompt

```
Read CLAUDE.md. Phase 1 is complete — src/data/ exists with all types and utilities.

## Task: build the core UI shell

Tech: React + Vite + TypeScript + TailwindCSS. Use the data layer from Phase 1.

### App shell (src/App.tsx)
- Sticky topbar: "Khata." brand (rust accent on dot), sync status pill (dot + label), user avatar
- Tab bar below topbar: Today | Analytics | Wealth | Save | Categories (5 tabs)
- Active tab content renders below, body has padding-bottom 80px for FAB
- FAB fixed bottom-center: "＋ Add transaction", ink background, pill shape
- Bottom sheet modal: slides up, backdrop closes it, handle bar at top

### Today view (src/views/HomeView.tsx)
- Monthly summary strip: 3 cells — Income (teal) / Spent (rust) / Net (green or red)
- Transaction list: sorted by date desc, grouped with date headers ("Today", "Yesterday", "12 Jun")
- Each row: category icon (colored circle), sub-category name, category · method · note, amount (+ green / − rust)
- Swipe left or tap × to delete (with undo toast for 3 seconds)
- Empty state: friendly illustration + "Tap ＋ to log your first transaction"

### Add transaction sheet (src/components/AddTransactionSheet.tsx)
- Expense / Income toggle (two full-width buttons)
- Amount input: large (24px), numeric keyboard on mobile, ₹ prefix
- EXPENSE mode shows:
  - Category grid: 3 columns, each tile has emoji + label, selected = rust highlight
  - Sub-category chips: horizontal scroll, selected = amber highlight
  - Payment method chips: UPI / Cash / Credit card / Debit card / Net banking / Cheque
- INCOME mode shows: source text input (Salary, Freelance…)
- Date picker (defaults today)
- Note input (optional)
- "Save & sync" primary button
- On save: add to state, persist to localStorage, show success toast, close sheet

### Design tokens to use
Paper bg: #F7F2E9, card bg: #FFFDF8, ink: #2B2520
Rust: #8A3A28, Teal: #0F6E56, Amber: #8A5E0A

### Responsiveness
Max-width 560px centered. Works on 375px iPhone SE width.

## Tests
Write Vitest + React Testing Library tests:
- HomeView renders summary strip with correct totals
- AddTransactionSheet: selecting category updates sub-categories
- AddTransactionSheet: submit calls onSave with correct Transaction object
- Delete transaction: item removed from list, undo toast appears

## Done when
`npm run dev` shows the working app. `npm run test` passes all.
```

---

## Phase 3 — Analytics, Wealth, Savings, Categories

**Builds:** Analytics view with bars and insights, Wealth balance sheet (assets + liabilities), Add account sheet (18 types), Savings suggestions, Categories management.

**Estimated tokens:** ~10k

### Agent prompt

```
Read CLAUDE.md. Phases 1 and 2 are complete.

## Task: build Analytics, Wealth, Savings, and Categories views

### Analytics view (src/views/AnalyticsView.tsx)

Period toggle: This week | This month | All time (pill buttons)

Category breakdown card:
- Horizontal bar per category, width = % of total spend
- Label left (icon + name), amount + % right
- Bars colored per category color token
- Sorted by amount desc

Sub-category top 6 card: same bar style, amber fill

Payment method card: same bar style, ink fill

Insight banners (show only when condition is true):
- Top category: "{icon} {name} is your biggest spend — ₹X (Y%)"
- Entertainment ≥3 txns: "⚠️ {N} entertainment transactions totalling ₹X"
- Cash ≥1: "💵 ₹X in ATM/cash — log where it went for better tracking"
- Positive: "✅ No major overspend this month" (when no warnings triggered)

### Wealth view (src/views/WealthView.tsx)

Net worth hero: dark card (#2B2520 bg), "Total Net Worth" label, large rupee amount,
below: Assets (teal) and Debt (rust) side by side

Asset groups (show only if entries exist):
bank, fd, ppf, epf, mf, stocks, gold, property, crypto, cash, nsc, other_asset

Each group: group heading with total, then account cards below
Account card: icon circle (colored), name + meta (bank, rate, maturity), value right (teal=asset, rust=debt), × delete

Debt groups: home_loan, car_loan, personal_loan, edu_loan, cc, bnpl, other_debt

"＋ Add account / investment / loan" button at bottom

Add account sheet (src/components/AddWealthSheet.tsx):
- Asset types section + Debt types section (chips grouped)
- Name input with smart placeholder per type
- Value input (balance/outstanding)
- Context fields per type:
  bank: bank name, account type (Savings/Current/Salary)
  fd/ppf/nsc: bank, interest rate %, maturity date
  epf: UAN number
  mf: fund house, folio number
  stocks: broker, demat account
  gold: weight (grams), purity (22K/24K)
  *_loan: bank, EMI amount, interest rate, tenure
  cc: bank, credit limit, due date
  bnpl: provider, due date

### Savings view (src/views/SavingsView.tsx)

Show "log more data" state if: no income OR fewer than 5 expenses this month

Otherwise show:
- Same monthly summary strip as Today view
- "Discretionary spend" card: Entertainment + Shopping + Food categories
  Bar chart of top 5 sub-categories by spend, with count (×3)
  Total discretionary amount in card header
- Personalised suggestion card:
  Paragraph naming top 3 offenders with amounts
  Suggested cut = 30% of discretionary, rounded to nearest ₹100
  "Potential monthly saving" box: large figure, yearly projection
  "Redirect to FD or SIP" suggestion
- If no discretionary spend: "✅ On track" banner

### Categories view (src/views/CategoriesView.tsx)

List all categories. Each row:
- Icon + name + "Delete" (custom only)
- Sub-category tags (pill with × to remove)
- "＋ add sub" button inline

"＋ Add custom category" button at bottom opens sheet:
- Name input, emoji picker (text input), color picker (5 options as chips)
- Sub-categories textarea (one per line)
- Validation: no duplicate names

## Tests
- analyticsUtils.ts: filterByPeriod, groupByCategory, topSubcategories — unit tests
- savingsUtils.ts: calculateSuggestion returns correct rounded cut
- WealthView: net worth = assets - debts (snapshot test)
- CategoriesView: adding sub-category appends to correct category

## Done when
All 5 tabs are functional. npm run test passes.
```

---

## Phase 4 — Google Auth + Drive Sync

**Builds:** Login screen, Google Identity Services integration, manual Client ID entry, Drive REST API (find/create/upload/download), auto-sync on every save, sync status indicator.

**Token tip:** Mocking fetch in tests is critical here. Tell the agent explicitly to use `vi.spyOn(global, 'fetch')` — it saves multiple correction rounds.

**Estimated tokens:** ~8k

### Agent prompt

```
Read CLAUDE.md. Phases 1-3 are complete. The app has full UI but no auth or Drive sync.

## Task: add Google Sign-In and Google Drive sync

### Login screen (src/views/LoginView.tsx)

Show when user is null. Full-screen centered layout:
- App logo (📒) + "Khata." brand
- Tagline: "Your personal finance ledger. Private, offline-first."
- White card with:
  - h2: "Sign in to continue"
  - p: "Your data lives in your own Google Drive — not our servers."
  - Google sign-in button (rendered by GIS library into #gsi-btn div)
  - Divider "or enter Client ID manually"
  - Client ID input (placeholder: xxxx.apps.googleusercontent.com)
  - "Continue" button
  - Collapsible "5-minute setup guide" with numbered steps

### Google auth (src/lib/googleAuth.ts)

Load script: https://accounts.google.com/gsi/client (append to head, return promise
that resolves when window.google exists — poll every 200ms max 50 tries)

initAuth(clientId: string):
- google.accounts.id.initialize({ client_id, callback: handleIdToken })
- tokenClient = google.accounts.oauth2.initTokenClient({ client_id, scope: DRIVE_SCOPE, callback: handleToken })
- google.accounts.id.renderButton(document.getElementById('gsi-btn'), { theme:'outline', size:'large', width:300 })
- google.accounts.id.prompt() for one-tap

handleIdToken(response): decode JWT payload (base64 split on '.'), extract
name/email/picture, save to state, call tokenClient.requestAccessToken({ prompt: '' })

handleToken(response): save access_token to sessionStorage (not localStorage — tokens
expire), update sync status to 'idle'

DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file openid email profile'

Export: initAuth, signOut (google.accounts.id.disableAutoSelect + clear token + clear user)

### Drive service (src/lib/driveService.ts)

getToken(): string — read from sessionStorage, throw if missing

async findFile(name: string, existingId: string|null): Promise<string>
- If existingId: GET /drive/v3/files/{id}?fields=id — return if 200, else fall through
- Search: GET /drive/v3/files?q=name='{name}' and trashed=false&fields=files(id)
- If found return id; else create: POST /drive/v3/files with { name, mimeType:'text/plain' }

async uploadFile(fileId: string, content: string, mimeType: string): Promise<void>
- PATCH /upload/drive/v3/files/{id}?uploadType=media with content as body

async downloadFile(fileId: string): Promise<string>
- GET /drive/v3/files/{id}?alt=media

async syncAll(state: AppState): Promise<void>
- Sync transactions: find/create khata-transactions.csv, upload CSV
- Sync wealth: find/create khata-wealth.json, upload JSON
- Save file IDs to localStorage

async loadFromDrive(state: AppState): Promise<Partial<AppState>>
- Find txn file and wealth file
- Download both, parse, return merged state (Drive wins on conflict)

### Sync status (src/components/SyncStatus.tsx)
Pill in topbar: colored dot + label
States: idle (gray "Not synced") | syncing (amber pulse "Syncing…") | ok (teal "Drive synced") | error (rust "Sync failed")
Click to trigger manual syncAll()

### Integration
- On app load: if user exists in storage + token in session, call loadFromDrive
- On every transaction save/delete: call syncAll (debounced 1000ms)
- On every wealth save/delete: call syncAll (debounced 1000ms)
- Show error toast + set status=error on any Drive failure (never block local save)

## Tests
Mock fetch using vi.spyOn(global, 'fetch'). Test:
- findFile: returns existing ID if found, creates new if not
- uploadFile: called with correct URL and content-type
- loadFromDrive: parses CSV correctly and returns Transaction[]
- Auth token missing: syncAll rejects gracefully without crashing app

## Done when
Signing in with a real Google Client ID writes khata-transactions.csv to the user's Drive.
```

---

## Phase 5 — Testing, Bug Fixing, and Android Build

**Builds:** Full E2E test suite (Playwright), mobile responsiveness audit, Lighthouse performance pass, Capacitor Android APK, final checklist.

**Token tip:** The "fix every failure before continuing" instruction is critical — without it the agent skips broken tests and ships a half-working app.

**Estimated tokens:** ~9k

### Agent prompt

```
Read CLAUDE.md. All features are built. Run a full QA and ship pass.

## Task: test everything, fix all bugs, build Android APK

### Step 1 — run all existing tests
npm run test -- --reporter=verbose
Fix every failure before continuing. Do not skip.

### Step 2 — write E2E tests with Playwright
npm install -D @playwright/test && npx playwright install chromium

Write tests/e2e/khata.spec.ts:

test('add expense transaction'):
  Navigate to app → click FAB → select "Food & Dining" → select "Zomato/Swiggy"
  → select UPI → enter amount 25000 (₹250) → click Save
  → verify transaction appears in list with "Zomato/Swiggy", "−₹250", "UPI"
  → verify monthly summary "Spent" shows ₹250

test('add income'):
  Click FAB → toggle Income → enter source "Salary" → enter 5000000 (₹50,000) → Save
  → verify "Income" strip shows ₹50,000 and "Net" shows ₹49,750

test('delete transaction with undo'):
  Add a transaction → tap × on it → verify it disappears
  → click Undo in toast → verify it reappears

test('analytics shows correct breakdown'):
  Add 3 expense transactions across 2 categories
  → go to Analytics tab → verify category bars show correct %
  → verify total matches sum of transactions

test('custom category'):
  Go to Categories tab → click "Add custom category"
  → enter name "Pets", emoji 🐾, add sub "Vet visit", "Pet food"
  → Save → verify appears in category grid when adding transaction

test('wealth net worth'):
  Go to Wealth tab → Add bank account ₹50,000 → Add credit card debt ₹15,000
  → verify net worth shows ₹35,000

### Step 3 — fix all E2E failures
After each fix, re-run only the failing test before running the full suite.

### Step 4 — mobile audit
Set Playwright viewport to 375x812. Re-run all E2E tests.
Fix any layout issues: overflow, truncation, touch targets < 44px, bottom sheet clipping.

### Step 5 — performance
npm run build && npx vite preview
Open Chrome DevTools → Lighthouse → Mobile → Run audit
Fix any issue scoring < 90 on Performance and < 95 on Accessibility.

### Step 6 — Android build with Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Khata com.khata.app --web-dir dist
npm run build
npx cap add android
npx cap sync

Update android/app/src/main/AndroidManifest.xml:
- Add permission: android.permission.INTERNET
- Add meta-data for Google Sign-In

npx cap open android
(This opens Android Studio — click Run to install APK on your phone)

### Step 7 — final checklist
Run and confirm ALL of these:
[ ] npm run test — 0 failures
[ ] npm run test:e2e — 0 failures
[ ] npm run build — 0 errors, 0 warnings
[ ] Lighthouse mobile score ≥ 90
[ ] App works offline (disable network in DevTools, add transaction, re-enable, verify sync)
[ ] Drive sync: after sign-in, khata-transactions.csv exists in Google Drive

Output a DONE.md listing every test result and checklist item with pass/fail status.
```

---

## Bonus Phase — SMS Auto-Import (Android only)

**Run only after Phase 5 is fully complete and the Android APK is working.**

**Builds:** UPI SMS pattern parser, SMS paste UI inside the Add Transaction sheet.

**Estimated tokens:** ~4k

### Agent prompt

```
Read CLAUDE.md. All 5 phases are complete, Android APK is working.

## Task: add UPI SMS auto-import

### src/lib/smsParser.ts

Write parseUPISms(sms: string): Partial<Transaction> | null

Detect and parse these UPI SMS patterns (Indian banks):
- "Rs.X debited from A/c XX1234 on DD-MM-YY. UPI Ref: Y. Info: MERCHANT"
- "INR X.XX debited from your account XX1234. UPI transaction id: Y"
- "Your a/c XXXX1234 is debited by Rs X on DD/MM/YY. Ref No Y"
- "Sent Rs.X.XX to MERCHANT via UPI. Ref: Y"
- "Credited INR X to your a/c XX1234 from SENDER. UPI Ref: Y"

Extract: amountPaise, date, merchant/sender (→ use as note), type (credit=income, debit=expense)
Return null if pattern does not match.

Write tests for all 5 patterns with real SMS examples.

### SMS paste UI (src/components/SmsPasteSheet.tsx)

Button "Import from SMS" in Add Transaction sheet footer.
Opens a sub-sheet with:
- Textarea: "Paste your bank SMS here"
- On paste/type: call parseUPISms in real-time
- Show preview card: "Detected: ₹250 expense on 12 Jun from Zomato via UPI"
- "Use this" button pre-fills the main Add Transaction form
- "Clear" link resets

### Tests
- parseUPISms: 10 real SMS strings → correct parsed output
- SmsPasteSheet: pasting valid SMS shows preview, clicking Use this fills parent form
- Invalid SMS: shows "Could not detect a UPI transaction. Try entering manually."

## Done when
npm run test passes including SMS parser tests.
```

---

## Quick Reference

| Phase | What it builds | Tokens |
|-------|---------------|--------|
| 0 — Setup | Claude Code install, project scaffold, CLAUDE.md | ~500 |
| 1 — Data layer | Types, categories, storage, formatters, CSV, tests | ~6k |
| 2 — Core UI | Shell, tabs, transaction list, add sheet, FAB | ~12k |
| 3 — Features | Analytics, Wealth, Savings, Categories views | ~10k |
| 4 — Auth + Sync | Google login, Drive read/write, sync status | ~8k |
| 5 — QA + Ship | E2E tests, mobile audit, Lighthouse, Android APK | ~9k |
| Bonus — SMS | UPI SMS parser, paste-to-import UI | ~4k |
| **Total** | | **~50k** |

## Rules for the agent (repeat these if it goes off track)

- Never skip a failing test — fix it before moving to the next file
- Always store amounts as paise (integers), never floats
- Always format currency with `Intl.NumberFormat('en-IN')`
- Never hardcode colors — use the design tokens in CLAUDE.md
- Every Drive operation must fail gracefully — local save must never be blocked
- Commit with `git commit -m "Phase N complete — all tests passing"` after each phase
