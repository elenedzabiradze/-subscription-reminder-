# Subscription Reminder

A tiny website: anyone signs in with Google, adds their subscriptions (name,
price, billing day), and the app creates a recurring event on **their own**
Google Calendar with a reminder email 2 days before and a popup 1 day before
each payment. No database, no email server to run — Google Calendar does the
reminding for you.

This guide assumes no coding experience. It's long because it's precise, not
because it's hard — follow it top to bottom in order.

---

## How it works (30 seconds)

- Someone visits your site and clicks "Sign in with Google."
- Google asks them to approve calendar access — this app never sees their
  password, only a permission token.
- They fill in a subscription; the app calls the Google Calendar API and
  creates a recurring monthly event **on their calendar**, with reminders
  built in.
- Nothing is stored on your server. Every time the dashboard loads, it just
  asks Google Calendar "what subscription events does this person have?"

Because there's no database, there's nothing for you to host, back up, or
secure beyond the app itself.

---

## What you'll need (all free to start)

1. A **Google account** (you already have one) — to create the OAuth credentials.
2. A **GitHub account** — [github.com/join](https://github.com/join) — to hold the code.
3. A **Vercel account** — [vercel.com/signup](https://vercel.com/signup) — sign up with GitHub, one click. This is where the site actually runs.

---

## Step 1 — Put the code on GitHub

1. Go to [github.com/new](https://github.com/new), name the repo `subscription-reminder`, keep it **Private** or **Public** (either works), click **Create repository**.
2. On the empty repo page, click **uploading an existing file**.
3. Drag in every file and folder from this `subscription-reminder` folder (drag the whole folder into the browser window — GitHub will preserve the structure). Do **not** upload the `node_modules` or `.next` folders if you see them; they're build leftovers and GitHub will rebuild what it needs.
4. Click **Commit changes**.

*(If you're comfortable with a terminal, this is just `git init`, `git add .`, `git commit`, `git push` — same result, faster.)*

---

## Step 2 — Create the Google OAuth credentials

This is the part that lets the app ask Google "can this user log in and get calendar access?"

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and sign in.
2. Top-left, click the project dropdown → **New Project**. Name it `Subscription Reminder` → **Create**. Wait a few seconds, then make sure it's selected in the dropdown.
3. In the search bar at the top, type **Google Calendar API** → open it → click **Enable**.
4. In the left sidebar go to **APIs & Services → OAuth consent screen**.
   - User type: **External** → **Create**.
   - App name: `Subscription Reminder`. User support email: your email. Developer contact: your email. Save and continue.
   - **Scopes** page: click **Add or Remove Scopes**, manually add `.../auth/calendar.events`, save, continue.
   - **Test users** page: add the Google email addresses of the people you want to try it first (you can add up to 100). Save and continue.
   - This puts the app in **Testing** mode — it works immediately for up to 100 people you list here, with no review needed. (See "Going public" below for opening it to everyone.)
5. Left sidebar → **APIs & Services → Credentials** → **Create Credentials → OAuth client ID**.
   - Application type: **Web application**. Name: `Subscription Reminder Web`.
   - **Authorized redirect URIs** → **Add URI** → for now enter: `http://localhost:3000/api/auth/callback/google` (you'll add the real one in Step 4).
   - Click **Create**. A popup shows a **Client ID** and **Client secret** — copy both somewhere safe. You'll need them in Step 3.

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new), click **Import** next to your `subscription-reminder` GitHub repo (authorize Vercel to see your GitHub repos if asked).
2. Vercel auto-detects Next.js — leave build settings as default.
3. Before clicking Deploy, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `GOOGLE_CLIENT_ID` | the Client ID from Step 2 |
   | `GOOGLE_CLIENT_SECRET` | the Client secret from Step 2 |
   | `NEXTAUTH_SECRET` | any random string — generate one at [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) |
   | `NEXTAUTH_URL` | leave blank for now, you'll set it in Step 4 |
4. Click **Deploy**. Wait ~1 minute. You'll land on a page with your live URL, something like `https://subscription-reminder-yourname.vercel.app`.

---

## Step 4 — Connect the real URL

1. Copy your Vercel URL (e.g. `https://subscription-reminder-yourname.vercel.app`).
2. Back in Vercel: **Settings → Environment Variables** → edit `NEXTAUTH_URL` → paste that URL (no trailing slash) → Save. Then go to **Deployments**, click the **⋯** menu on the latest deployment → **Redeploy**, so the new value takes effect.
3. Back in Google Cloud Console → **Credentials** → click your OAuth client → under **Authorized redirect URIs**, click **Add URI** and add:
   `https://your-vercel-url.vercel.app/api/auth/callback/google`
   Save.

Your site is now live at your Vercel URL.

---

## Step 5 — Try it

1. Open your Vercel URL, click **Sign in with Google** (use one of the test-user emails from Step 2).
2. Approve the calendar permission.
3. Go to the dashboard, add a subscription (e.g. Netflix, 15.99, day 5).
4. Check that person's Google Calendar — you should see a new recurring event on the 5th of each month with reminders attached.

If sign-in fails with a "redirect_uri_mismatch" error, the URI in Google Cloud Console (Step 4.3) doesn't exactly match your Vercel URL — check for typos or a missing/extra slash.

---

## Going public (beyond your 100 test users)

While the OAuth consent screen is in **Testing** mode, only the test users you listed can sign in — everyone else sees an "app not verified" block. To open it to the public:

1. Google Cloud Console → **OAuth consent screen** → you'll need:
   - A real **Privacy Policy** page and **homepage** (a simple page explaining what the app does and how it uses Google Calendar access is enough — you can add these as extra pages in the same Next.js app).
   - Your app **logo**.
2. Click **Publish App**, then **Prepare for verification**. Because `calendar.events` is a "sensitive" (not "restricted") scope, this goes through Google's standard review — typically a few business days, not the multi-week security assessment required for more invasive scopes like full Gmail or Drive access.
3. Once approved, anyone with a Google account can sign in — no test-user list needed.

You can share the link with your 100 test users immediately today; verification is only needed to go beyond that.

---

## Customizing

- **Colors/branding:** edit `app/globals.css`.
- **Currencies offered:** edit the `<select>` options in `app/dashboard/page.js`.
- **Reminder timing:** in `lib/calendar.js`, change the `minutes` values (`2880` = 2 days, `1440` = 1 day) in the `reminders.overrides` array.

## Limitations to know about

- Requires a Google account and Google Calendar — there's no email/password login or support for other calendar providers.
- No database means no analytics, no admin view of all users, and no way to bulk-edit — each person only ever sees their own subscriptions, pulled live from their own calendar.
- Free Vercel and Google Cloud tiers comfortably support a project like this at small-to-medium scale.
