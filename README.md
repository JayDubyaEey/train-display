# UK Train Station Platform Display

I built this because I love the technology behind trains and couldn't find an existing solution that faithfully recreated the experience of looking at a real UK platform departure board from the comfort of my browser.

This project is a stateless, client-side web application that emulates an authentic UK train station amber dot-matrix departure board. It fetches real-time data using the National Rail Enquiries (NRE) Darwin system via the Huxley2 API.

## Features

- **Authentic visuals:** Accurately mimics the physical layout and amber LED dot-matrix glow of UK platform boards using a custom self-hosted dot-matrix typeface.
- **Multi-platform display:** Monitor up to 4 platforms simultaneously. Each platform runs as an independent board with its own live data feed, clock, and NRCC messages. Add or remove platforms at any time from the page header without re-entering settings.
- **Real-time departure data:** Live departure information including operator, destination, scheduled and estimated times, cancellations, and delay reasons.
- **Calling points marquee:** Two-phase scrolling ticker per board:
  - Phase 1 — "A [operator] service. Calling at [stops with times]. This train is formed of N carriages."
  - Phase 2 — "The train is currently between [last-called stop] and [next stop]." (derived from `previousCallingPoints`; only shown when location data is available)
  - Final destination is uppercased; all stop times flip to estimated when the train is running late.
- **Secondary trains:** Smoothly cycles between the 2nd and 3rd upcoming trains using mechanical push-up CSS animations.
- **Delay handling:** Status column shows scheduled time by default, switching to `Exp HH:MM` when a train is delayed. `Due`, `Cancelled`, and `Delayed` states are also handled.
- **NRCC service messages:** Every 2 minutes, the secondary row is replaced by a scrolling National Rail service alert. HTML is stripped from the raw API response. Multiple messages are selected randomly and displayed independently per board.
- **No Services state:** When a platform has no upcoming departures, a centred "No Services" message is shown.
- **Live clock:** Large real-time footer clock on each board, independent per panel.
- **Fullscreen mode:** One-click fullscreen toggle in the page header.
- **Station search:** Autocomplete station search by name or CRS code during setup.
- **Persistent configuration:** API token, station, and selected platforms are stored in `localStorage`. The token is masked in the settings UI with a clear button. Re-opening settings pre-populates all fields.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Data Source:** [Huxley2 API](https://huxley2.azurewebsites.net/) (proxy for the NRE Darwin API)

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. On first load you will be prompted to enter your NRE Access Token. Register for a free token at the [National Rail Open Data portal](https://opendata.nationalrail.co.uk/).
5. Search for your station, pick one or more platforms, and save.

## Available scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start local development server                |
| `npm run build`        | Type-check and build for production           |
| `npm run preview`      | Preview the production build locally          |
| `npm run lint`         | Run ESLint                                    |
| `npm run typecheck`    | Run TypeScript type checking without emitting |
| `npm run format`       | Auto-format all files with Prettier           |
| `npm run format:check` | Check formatting without writing              |

## Architecture

- **Zero backend:** Entirely client-side — fast to load and trivial to host on GitHub Pages or any static host.
- **localStorage:** The API token and display config are stored in the browser only. No server-side secret management required.
- **Independent board panels:** Each `BoardPanel` owns its own polling loop, NRCC timer, and clock. Adding a platform spawns a new panel; removing one tears it down cleanly.
- **Strict 3-row layout:** Invisible placeholder rows prevent layout shifts when data is loading or absent.
- **CSS animations:** Performant CSS keyframe animations (`marquee`, `slide-in-up`, `slide-out-up`) drive all motion — no JavaScript animation loops.
- **Polling:** A shared `useFetchWithPolling` hook handles all data fetching with configurable intervals and automatic error surfacing.

## Fonts

**MatrixType** by [GGBotNet](https://www.ggbot.net) — a dot-matrix display typeface used for all on-board text. Licensed under [Creative Commons Zero v1.0 Universal (CC0)](https://creativecommons.org/publicdomain/zero/1.0/). Source: [fontspace.com/matrixtype-font-f125326](https://www.fontspace.com/matrixtype-font-f125326)
