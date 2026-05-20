# UK Train Station Platform Display 🚂

I built this because I love the technology behind trains and couldn't find an existing solution that faithfully recreated the experience of looking at a real UK platform departure board from the comfort of my browser.

This project is a stateless, client-side web application that emulates an authentic UK train station amber dot-matrix departure board. It fetches real-time data using the National Rail Enquiries (NRE) Darwin system via the Huxley2 API.

## Features

- **Authentic Visuals:** Accurately mimics the physical layout and amber LED glow of UK platform boards.
- **Real-time Data:** Live departure information, including delays, expected arrival times, and cancellations.
- **Calling Points Marquee:** Automatically pauses and scrolls calling points at realistic speeds, just like the real displays. Append carriage counts automatically if available.
- **Cycling Secondary Trains:** Smoothly cycles between the 2nd and 3rd upcoming trains using mechanical-style push-up CSS animations.
- **Live Clock:** Large, real-time footer clock.
- **Fully Stateless & Secure:** Designed to be hosted on static platforms like GitHub Pages. You bring your own free NRE API token, which is securely stored only in your browser's local storage.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Data Source:** [Huxley2 API](https://huxley2.azurewebsites.net/) (Proxy for NRE Darwin API)

## Setup

To run this application locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Upon loading the app, you will be prompted to enter your NRE Access Token via the Setup interface. You can register for a free token at the [National Rail Open Data portal](https://opendata.nationalrail.co.uk/).

## Architecture

- **Zero Backend:** The app is entirely client-side, making it fast and easy to host on GitHub Pages or similar static hosting.
- **LocalStorage:** The API token is requested from the user on first load and saved to `localStorage`, avoiding any server-side secret management.
- **Strict Layout:** Uses a strict 3-row layout even with missing data (using invisible placeholders) to prevent visual layout shifts.
- **CSS Animations:** Uses optimized CSS keyframes (`marquee`, `slide-in-up`, `slide-out-up`) for performant and accurate mechanical transitions.
