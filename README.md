# Bitcoin Map

A streamlined, mobile-first form for adding Bitcoin-accepting merchants to [BTC Map](https://btcmap.org).

## Features

- 📱 **Mobile-first** - Optimized for on-the-go submissions
- 🗺️ **Smart autocomplete** - Google Places integration for instant merchant lookup
- ⚡ **Lightning fast** - Auto-fills details from Google Maps
- 🔐 **OAuth sign-in** - Apple and Google Sign-In for email capture
- 🎯 **3-step process** - Simplified from 15+ fields to 3 easy steps
- 📍 **Nearby merchants** - Find bitcoin-accepting businesses near you

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Maps**: Google Maps Places API
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- bun (or npm/pnpm)
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sahilc0/bitcoinmap
cd bitcoinmap
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Add your domain (e.g., `localhost:3000/*` for development)
   - API restrictions: Restrict to the 3 APIs above

### Running the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── submit-location/     # Form submission endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── add-location/            # Form components
│   │   ├── AddLocationForm.tsx  # Main form orchestrator
│   │   ├── MerchantSearch.tsx   # Step 1: Search
│   │   ├── DetailsReview.tsx    # Step 2: Review
│   │   ├── ConfirmationStep.tsx # Step 3: Submit
│   │   └── SuccessScreen.tsx    # Success state
│   └── ui/                      # shadcn components
├── hooks/
│   ├── useGoogleMaps.ts         # Google Maps loader
│   ├── useAppleSignIn.ts        # Apple OAuth
│   └── useGoogleSignIn.ts       # Google OAuth
└── types/
    └── location.ts              # TypeScript types
```

## Submission Flow

Form submissions create GitHub issues in the BTCMap data repository, where community volunteers review and add locations to OpenStreetMap.

### GitHub Integration

To enable automatic issue creation:

1. Get a GitHub Personal Access Token with `repo` scope
2. Add to `.env.local`:
```
GITHUB_TOKEN=your_github_token
```

## Deployment

### Vercel (Recommended)

```bash
bun install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_APPLE_CLIENT_ID`
- `GITHUB_TOKEN` (optional)

## Contributing

Contributions are welcome! Please:

1. Maintain mobile-first approach
2. Keep dependencies minimal
3. Write accessible components
4. Test on actual mobile devices

## License

[MIT](LICENSE)

## Acknowledgments

- [BTC Map](https://btcmap.org) for the amazing project and community
- The bitcoin community for supporting merchant adoption

---

Built with ⚡ for the bitcoin community
