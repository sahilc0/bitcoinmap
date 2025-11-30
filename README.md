# Bitcoin Map - Simplified Location Submission

A streamlined, mobile-first form for adding Bitcoin-accepting merchants to [BTC Map](https://btcmap.org). Built with Cash App-inspired design principles.

## Features

- 🎨 **Cash App Design** - Clean, modern interface inspired by Cash App's UX
- 📱 **Mobile-First** - Optimized for on-the-go submissions
- 🗺️ **Smart Autocomplete** - Google Places integration for instant merchant lookup
- ⚡ **Lightning Fast** - Auto-fills details from Google Maps
- 🔒 **OAuth Ready** - UI prepared for Apple/Google Sign-In (coming soon)
- 🎯 **3-Step Process** - Simplified from 15+ fields to 3 easy steps

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Maps**: Google Maps Places API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Google Maps API key (see setup below)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bitcoinmap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Google Maps API key to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key (optional but recommended):
   - Application restrictions: HTTP referrers
   - Add your domain (e.g., `localhost:3000/*` for development)
   - API restrictions: Restrict to the 3 APIs above

**Detailed setup instructions**: See [SETUP.md](SETUP.md)

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Submission Flow

The app follows a progressive enhancement strategy for submissions:

### Current Implementation (MVP)

Form submissions are logged and can be:
1. Manually processed by the team
2. Auto-forwarded via webhook (optional)
3. Sent to an email endpoint (optional)

### Production Strategies

#### Strategy 1: Direct API (Preferred)
If btcmap.org provides a direct API endpoint, we'll integrate it directly.

**Status**: ❌ Not available (as of research)

#### Strategy 2: GitHub Issue Creation (Recommended)
Create issues in [teambtcmap/btcmap-data](https://github.com/teambtcmap/btcmap-data) via GitHub API, mimicking BTCMap-NoobBot.

**Setup**:
1. Get a GitHub Personal Access Token with `repo` scope
2. Add to `.env.local`:
```
GITHUB_TOKEN=your_github_token
```
3. Uncomment the GitHub integration code in `src/app/api/submit-location/route.ts`

**Status**: ⚠️ Requires btcmap.org team approval

#### Strategy 3: Form Proxy (Fallback)
Submit directly to btcmap.org's form endpoint with CAPTCHA handling.

**Status**: ⚠️ Requires CAPTCHA solving (may be unreliable)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── submit-location/     # Form submission endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles + Cash App theme
├── components/
│   ├── add-location/            # Form components
│   │   ├── AddLocationForm.tsx  # Main form orchestrator
│   │   ├── MerchantSearch.tsx   # Step 1: Search
│   │   ├── DetailsReview.tsx    # Step 2: Review
│   │   ├── ConfirmationStep.tsx # Step 3: Submit
│   │   └── SuccessScreen.tsx    # Success state
│   └── ui/                      # shadcn components
├── hooks/
│   └── useGoogleMaps.ts         # Google Maps loader
└── types/
    └── location.ts              # TypeScript types
```

## Design System

The app uses Cash App's design language:

- **Primary Color**: `#00D632` (Cash App Green)
- **Typography**: System fonts (SF Pro on iOS, Roboto on Android)
- **Spacing**: Generous padding, large touch targets (min 44px)
- **Animations**: Smooth transitions, fade-ins
- **Border Radius**: 12px (0.75rem)

See `src/app/globals.css` for the complete design token system.

## Contributing

This project is intended to be contributed back to Cash App as an example implementation.

### Development Guidelines

1. Maintain mobile-first approach
2. Follow Cash App design patterns
3. Keep dependencies minimal
4. Write accessible components
5. Test on actual mobile devices

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GITHUB_TOKEN` (if using GitHub strategy)

### Other Platforms

The app can deploy to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key for Places autocomplete |
| `GITHUB_TOKEN` | No | GitHub PAT for creating issues (Strategy 2) |

## Future Enhancements

- [ ] Apple Sign-In integration
- [ ] Google Sign-In integration
- [ ] Offline support (PWA)
- [ ] Photo uploads
- [ ] Recently submitted locations
- [ ] Search history
- [ ] Dark mode toggle

## License

[MIT](LICENSE)

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email]
- BTC Map: https://btcmap.org

## Acknowledgments

- [BTC Map](https://btcmap.org) for the amazing project
- Cash App for design inspiration
- The Bitcoin community for supporting merchant adoption

---

Built with ⚡ for the Bitcoin community

