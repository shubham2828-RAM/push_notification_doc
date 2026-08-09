# Push Notification to Mobile APP — Architecture Documentation

A static documentation website that visually explains an existing, production-used push
notification pipeline (iWorkBench → MongoDB → Scheduler → Kafka → CPaaS → Firebase FCM → Mobile App).

**This website does not send notifications or call any production system.** It is a documentation
and presentation layer only.

Live site: `  https://shubham2828-ram.github.io/push_notification_doc/`

---

## 1. Languages & Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and content for `index.html` and `details.html` |
| **CSS3** | All styling — layout, colors, typography, animations (`style.css`) |
| **Vanilla JavaScript (ES6)** | All interactivity — no framework, no build tool (`script.js`) |
| **SVG** (generated via JS) | The interactive notification → condition graph, drawn dynamically at runtime |
| **Google Fonts** (CDN) | `Space Grotesk`, `Inter`, `JetBrains Mono` — loaded via `@import` in `style.css` |

No backend, no database, no npm packages, and no build step are used or required. Every file in
this project is served exactly as written — what you see in the repo is what the browser runs.

---

## 2. Project Structure

```
push-notification-architecture-docs/
├── index.html      → Public architecture overview page (splash screen, pipeline diagram, flow steps)
├── details.html     → Protected deeper technical docs (login-gated, client-side only)
├── style.css        → Shared stylesheet for both pages (design system, layout, animations)
├── script.js        → Shared JavaScript (splash sequence, interactive graph, login gate)
└── README.md        → This file
```

All files must stay in the **same folder** — they reference each other with relative paths
(`href="style.css"`, `src="script.js"`, `href="details.html"`), so nothing should be moved into
subfolders unless those paths are updated too.

---

## 3. Key Features

- **Splash screen** — animated binary background and cycling status text on `index.html`.
- **Interactive pipeline diagram** — click any stage (iWorkBench, MongoDB, Scheduler, Kafka, CPaaS,
  Firebase FCM, etc.) to see what happens at that step.
- **Notification → condition graph** — click a notification type on `details.html` to see its
  mapped conditions rendered as a live SVG node graph.
- **Client-side login gate** on `details.html` — a presentation-only gate (not real security) that
  hides deeper technical content behind a username/password prompt.

---

## 4. What GitHub Pages (`github.io`) Is, and Its Role Here

**GitHub Pages** is a free static-site hosting service built into GitHub. It takes the files sitting
in a GitHub repository and serves them as a live website at a public URL — no server setup, no
backend, and no cost.

Because this project is 100% static (HTML/CSS/JS with no server-side logic), it's a perfect fit for
GitHub Pages:

- You don't need Node.js, npm, or a build step — GitHub Pages serves the files exactly as they are
  in the repo.
- Every push to the configured branch automatically updates the live site.
- The site is served at:
  ```
  https://shubham2828-ram.github.io/push_notification_doc/
  ```
- GitHub Pages automatically looks for `index.html` as the default page at the root URL — which is
  why this project's home page is named `index.html`.

In short: GitHub hosts the *code*, and GitHub Pages turns that code into a *live, publicly
accessible website* — for this project, with zero extra configuration beyond enabling it.

---

## 5. How This Was Deployed to GitHub Pages

### Step 1 — Create a GitHub repository
Go to [github.com](https://github.com) → **New repository** → give it a name
(e.g. `push-notification-architecture-docs`) → create it (public repositories work with the free
tier of GitHub Pages).

### Step 2 — Push the project files to the repository
From inside the project folder, on your local machine:

```bash
cd push-notification-architecture-docs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/shubham2828-RAM/push_notification_doc.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. In the repository on GitHub, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main` and folder to `/ (root)`.
4. Click **Save**.

### Step 4 — Visit the live site
After roughly a minute, the site becomes available at:

```
https://shubham2828-ram.github.io/push_notification_doc/
```

`index.html` loads automatically at that root URL. `details.html`, `style.css`, and `script.js` are
all reachable since they sit in the same folder and are linked with relative paths — no additional
configuration was needed.

### Updating the live site later
Any future change just needs to be committed and pushed — GitHub Pages picks it up automatically:

```bash
git add .
git commit -m "Update notification condition graph"
git push
```

The live site typically reflects the change within about a minute.

---

## 6. Running Locally (Before Deploying)

No installation is required — pick any one of the following:

**Simplest — just open the file:**
Double-click `index.html` and it opens in your default browser.

**Local server (optional, closer to how it behaves once hosted):**
```bash
cd push-notification-architecture-docs
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

**VS Code Live Server extension:**
Right-click `index.html` → **Open with Live Server**.

---

## 7. Editing Notes

- **Notification → condition data**: edit the `CONDITION_MAP` object near the top of `script.js`.
- **Login gate credentials** (`details.html`): edit `DEMO_USER` / `DEMO_PASS` inside the
  `initGate()` function in `script.js`. Remember this is a presentation gate only — credentials are
  visible to anyone who views the page source, so don't use it to protect anything sensitive.
- **Design tokens** (colors, fonts, spacing): all defined as CSS variables at the top of
  `style.css` under `:root`.

---

## 8. Disclaimer

This site is a **documentation and presentation layer** describing an existing production
architecture. It does not connect to MongoDB, Kafka, Firebase, or any production API — all "live"
elements (the scheduler countdown, the pipeline animation) are simulated for presentation purposes
only.
