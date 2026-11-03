# The Knowledge Journey — Kids Learning Hub

A parent-controlled, age-appropriate learning video hub for kids aged 3–16. It brings together hand-picked educational YouTube channels, sorts them by age group and subject, and tracks which videos a child has finished. When a channel's queue runs out, the app loads the next batch of videos on its own.

Built with **React 19 + TypeScript + Vite**. It is a client-only single-page app: there is no backend, and all state lives in the browser's `localStorage`.

---

## Features

- **Four age groups**, each with its own colour theme:
  | Age group | Range | |
  |---|---|---|
  | Early Years | 3–6 | 🌱 |
  | Primary | 7–10 | 🚀 |
  | Middle School | 11–13 | 🔭 |
  | High School | 14–16 | ⚡ |
- **Nine subject categories**: Science & Tech, Mathematics, Critical Thinking & Life Skills, History & Geography, Arts & Creativity, Financial Literacy, Logic & STEM, Media Literacy, Soft Skills.
- **Curated channels** for each age and category (e.g. SciShow Kids, Numberblocks, TED-Ed, Khan Academy, Crash Course, 3Blue1Brown, Kurzgesagt), each with a short "why this channel" note.
- **YouTube-style browsing**: a sticky top bar with search, a left rail (Home, Keep watching, Watch later, My trophies, age groups), category chips and a thumbnail grid. Thumbnails use a "sticker" look with ink outlines and hard shadows. On phones the rail becomes a drawer.
- **Watch page**: a large privacy-enhanced (`youtube-nocookie`) player, channel info, and an *Up next* list that starts with the same channel.
- **Reward loop**: the big **I watched it! +10 ⭐** button sends stars flying into the **star jar** in the top bar, then shows a result card.
  - **Stars and levels:** 10 stars per video and a new level every 100.
  - **Streak:** a daily 🔥 streak, with 5 bonus stars for the first video each day.
  - **Daily mission:** finish 1 video to keep the streak going.
- **Trophies page**: level progress, a 7-day streak row, and a badge for every channel. A channel's badge lights up once all its current videos are watched.
- **Watch tracking**: watched videos leave the feed for good, even when they also appear under another channel. There are also history ("Keep watching") and "Watch later" lists.
- **Auto-refill**: when a channel's batch of about 25 videos is all watched, the next page is fetched from YouTube.
- **Parental controls (PIN-protected)**:
  - An **age ceiling**: lower age groups can be browsed freely, and higher ones need the PIN.
  - Change the PIN (default **`1234`**).
  - Reset to the first-run age selection screen.
- **Learning tips** for parents, tailored to each age group.

---

## How it works

### First run
1. The user picks an age group on the welcome screen.
2. The app **bulk-fetches** about 25 recent uploads for every channel in that age group, in parallel, and shows a per-channel progress screen.
3. The video pools are cached in `localStorage`, so later visits load instantly with no API calls.

### Fetching from YouTube
`fetchChannelVideos()` in [src/lib/youtube.ts](src/lib/youtube.ts) uses the YouTube Data API v3:
1. `channels?part=contentDetails` finds the channel's **uploads playlist**.
2. `playlistItems?part=snippet,status&maxResults=25` fetches the videos, continuing from a stored `nextPageToken` when one exists.
3. The results are filtered to public, non-deleted, English-language videos.

That is about **2 quota units per channel fetch**.

### Fallback without an API key
If `VITE_YOUTUBE_API_KEY` isn't set, no API calls are made, and each channel falls back to the 5 hard-coded video IDs in its config.

### localStorage keys
| Key | Purpose |
|---|---|
| `kj_maxAge` | The age ceiling set by the parent |
| `kj_viewingAge` | The age group currently being viewed |
| `kj_pin` | The parental PIN |
| `kj_watched` | Array of all watched video IDs |
| `kj_history` | Recently finished videos (`{ id, at }`, newest first) |
| `kj_saved` | "Watch later" video IDs |
| `kj_stars` | Total stars earned |
| `kj_streak` | `{ count, lastDay }` for the daily streak |
| `kj_mastered` | Channel IDs whose batch was fully watched |
| `kj_bulkDone_<ageId>` | Whether the initial bulk fetch is done for an age group |
| `kj_pool_<channelId>` | The cached video-ID pool for a channel |
| `kj_nextToken_<channelId>` | The YouTube `nextPageToken` for the next batch |

To fully reset the app, clear the site's localStorage in your browser's dev tools.

---

## Getting started

### Prerequisites
- Node.js 20+ and npm
- *(Optional, but recommended)* A YouTube Data API v3 key from the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

### Install and run
```bash
git clone https://github.com/PGuru/kids-learninghub.git
cd kids-learninghub
npm install
```

Create a `.env.local` file in the project root (`*.local` files are git-ignored):
```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Start the dev server:
```bash
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173).

### Scripts
| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server with HMR |
| `npm run build` | Builds for production into `dist/` (runs `vite build` only, with no `tsc` type-check step) |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

---

## Deployment

The output is a static site, so it can go on any static host (Vercel, Netlify, GitHub Pages, StackBlitz…).

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_YOUTUBE_API_KEY`

> ⚠️ Vite **embeds `VITE_*` variables into the client bundle**, so anyone visiting the site can see your API key. In the Google Cloud Console, restrict it to the **YouTube Data API v3** and to your site's **HTTP referrers**.

---

## Project structure

```
src/
├── main.tsx                  # React root
├── App.tsx / App.css         # App shell: view routing, rail drawer, parent gate
├── index.css                 # Design tokens (colours, type, sticker shadows) + .btn / .chip
├── types.ts                  # AgeId, Video, View, FinishResult…
├── data/catalog.ts           # AGE_GROUPS, CAT_ICONS, CATALOG (curated channels), TIPS
├── lib/
│   ├── store.ts              # Safe localStorage wrapper + storage keys
│   └── youtube.ts            # YouTube Data API fetch
├── state/
│   ├── journey-context.ts    # Journey interface + useJourney() hook
│   └── JourneyProvider.tsx   # All app state: ages, pools, watched, stars, streak, refill
└── components/
    ├── TopBar, SideRail      # Search, star jar, streak, grown-ups lock / navigation
    ├── HomeFeed, ListPage    # Grid + chips + daily mission / history & watch later
    ├── VideoTile             # Shared thumbnail tile (grid and row layouts)
    ├── WatchPage             # Player, "I watched it!", Up next
    ├── FinishCelebration     # Star flight into the jar + result card
    ├── TrophiesPage, ChannelPage
    ├── Onboarding, LoadingScreen
    └── PinPad, ParentGate    # PIN entry + grown-ups settings
```

Components never touch `localStorage` or the API directly. They read and change everything through `useJourney()`.

---

## Customising the channel list

Edit the `CATALOG` object in [src/data/catalog.ts](src/data/catalog.ts). Each entry looks like this:

```ts
{
  name: 'SciShow Kids',
  channelId: 'UCRFIPG2u1DxKLNuE3y2SjHA',   // YouTube channel ID (starts with "UC")
  why: "Answers curious 'why' questions with fun experiments.",
  videos: ['g5f-8QXKjuQ', /* … */],          // fallback IDs used when no API key is set
}
```

Channels are grouped by `category` under each age key (`'3-6'`, `'7-10'`, `'11-13'`, `'14-16'`). A new category name also needs an emoji in `CAT_ICONS`.

> Pools are cached per channel. After changing a channel ID, clear the matching `kj_pool_*`, `kj_nextToken_*` and `kj_bulkDone_*` keys to make the app re-fetch.

---

## Known limitations

- **The PIN is a convenience lock, not real security.** It is stored in plain text in `localStorage` and can be read or cleared through browser dev tools.
- **Progress is per browser and per device.** Nothing syncs between devices.
- **Fallback video IDs** are reused across several channels, and many no longer exist. Tiles for dead videos hide themselves. Without an API key the feed is thin and videos show no titles, so set `VITE_YOUTUBE_API_KEY` for the full experience.
- **The YouTube API quota** is 10,000 units a day by default. The first load of a large age group uses about 2 units per channel.

---

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [ESLint](https://eslint.org/) (flat config with `typescript-eslint`, `react-hooks`, `react-refresh`)
- [YouTube Data API v3](https://developers.google.com/youtube/v3) and the YouTube embed player
