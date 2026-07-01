# Phase 5 — QA, Bug Fixing, and Android Build

Final checklist from the orchestration guide, run against the `phase-5-qa-android-build` branch.

## Checklist

- [x] **`npm run test` — 0 failures.** 42/42 passing across 11 files (data layer, analytics/savings
      utils, Drive service, Google auth, and every view/component with interactive behavior).
- [x] **`npm run test:e2e` — 0 failures.** 12/12 passing — the 6 scenarios from the guide (add
      expense, add income, delete with undo, analytics breakdown, custom category, wealth net
      worth), each run on both a desktop and a 375×812 mobile viewport project.
- [x] **`npm run build` — 0 errors, 0 warnings.** `tsc -b && vite build` completes cleanly.
- [x] **Lighthouse mobile score ≥ 90.** Audited the production build at 375×812 (mobile
      emulation) via `scripts/lighthouse-audit.mjs`:
      - Login screen: Performance 99–100, **Accessibility 100** (started at 94 — see Fixes below).
      - Main app (post-skip-login): Performance 100, Accessibility 100.
      - Both comfortably clear the guide's ≥90 Performance / ≥95 Accessibility bar.
- [x] **App works offline.** Verified with `scripts/check-offline.mjs` (Playwright,
      `context.setOffline(true)`): added a transaction with the network fully disabled — it saved
      immediately, persisted to `localStorage`, and stayed visible after reconnecting. Sync is
      opportunistic and debounced; it never blocks a local save (`src/App.tsx`'s `runSync` fails
      quietly into an actionable "Sync failed" pill rather than throwing).
- [x] **Drive sync: `khata-transactions.csv` exists in Google Drive after sign-in.** Verified live
      with a real Google account and Client ID during this session (see the "Fix Google Sign-In"
      PR) — sign-in, Drive consent, and file sync all confirmed working end-to-end.

## What was fixed this phase

- **Mobile touch targets.** The 375×812 audit found the FAB label wrapping onto two lines, and
  most chip/pill buttons (sub-category and payment-method chips, wealth type chips, period
  toggle, color swatches, delete "×" buttons, the sync pill, and the avatar/sign-out button)
  under the 44px minimum. Fixed with `min-h-11`/`min-w-11`, keeping the original smaller visual
  size where that was intentional (avatar circle, color swatch) via an inner span.
- **Color contrast.** Lighthouse flagged 4 elements using `text-ink/40`/`text-ink/50` (muted
  secondary text) at 2.35–3.08:1 contrast against the paper/card backgrounds — under the 4.5:1
  WCAG AA minimum. Since the same utility classes are used throughout the app for hints and
  secondary text, fixed it app-wide (23 occurrences) rather than only the flagged instances,
  bumping to `text-ink/70`.
- **Missing `<main>` landmark.** Added to both `App.tsx`'s tab content and `LoginView.tsx`.

## Android (Capacitor)

- Added `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`; ran `cap init`, `cap add
  android`, `cap sync`.
- Added a `build:capacitor` script + a `vite.config.ts` mode check: the Capacitor WebView serves
  the bundle from local app files rather than GitHub Pages, so it needs root-relative asset paths
  instead of the `/My_Katha_Book/` base the regular `build` script uses.
- `AndroidManifest.xml`: `android.permission.INTERNET` was already present in Capacitor's default
  template. Added a `meta-data` entry documenting the Google OAuth Web Client ID for a future
  native Google Sign-In integration.
- Tracked the `android/` project in git (previously blanket-ignored) so these manifest edits
  survive a future `cap add` re-run — scoped to source only via Capacitor's own generated
  `android/.gitignore` (build output, copied web assets, and generated configs stay untracked).

### Not completed — needs your local machine

- **Android Studio / the Android SDK are not installed in this environment**, so `npx cap open
  android` and an actual on-device or emulator Run haven't been performed. That's the remaining
  step to produce a real, installable APK — open the `android/` folder in Android Studio and
  click Run.
- **Native Google Sign-In is not wired up.** The app currently signs in via the Google Identity
  Services *JS SDK* running inside the WebView. Google restricts OAuth flows in embedded
  WebViews for security and may surface a `disallowed_useragent` error on-device. Getting sign-in
  working inside the packaged Android app would need a native Capacitor Google Sign-In plugin
  (e.g. `@capacitor-firebase/authentication` or similar) wired to the Web Client ID already in
  `strings.xml` — that's a separate follow-up, out of scope for this phase. Everything else
  (offline transaction/wealth/category tracking, analytics, savings suggestions) works fully
  without it, since auth was designed to be skippable from Phase 4 onward.
