# Setup Guide

Detailed setup instructions for the Bitcoin Map location submission form.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Google Maps Configuration](#google-maps-configuration)
4. [Submission Integration](#submission-integration)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js**: Version 18 or higher
  ```bash
  node --version  # Should show v18.0.0 or higher
  ```

- **Package Manager**: npm (comes with Node.js) or pnpm
  ```bash
  npm --version
  ```

- **Google Cloud Account**: For Maps API (free tier available)

### Optional

- **GitHub Account**: For direct issue creation (Strategy 2)
- **Vercel Account**: For easy deployment

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd bitcoinmap

# Install dependencies
npm install

# or with pnpm
pnpm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local
```

## Google Maps Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project name: "Bitcoin Map" (or your choice)
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable each of these APIs:

   **Places API**
   - Search "Places API"
   - Click the result
   - Click "Enable"

   **Maps JavaScript API**
   - Search "Maps JavaScript API"
   - Click the result
   - Click "Enable"

   **Geocoding API** (optional, for enhanced features)
   - Search "Geocoding API"
   - Click the result
   - Click "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Edit API Key" to restrict it (recommended)

### Step 4: Restrict API Key (Recommended)

**Application Restrictions:**
1. Select "HTTP referrers (web sites)"
2. Add referrers:
   - For development: `http://localhost:3000/*`
   - For production: `https://yourdomain.com/*`

**API Restrictions:**
1. Select "Restrict key"
2. Check these APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API

3. Click "Save"

### Step 5: Add to Environment

Edit `.env.local` and add your key:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your-key-here
```

### Billing Setup (Required for Production)

Google Maps requires a billing account even on the free tier:

1. Go to "Billing" in Cloud Console
2. Click "Link a billing account"
3. Add payment method
4. Enable billing

**Don't worry**: The free tier includes:
- $200 monthly credit
- Enough for ~28,000 map loads or ~100,000 autocomplete requests
- You won't be charged unless you exceed this

## Submission Integration

### Option 1: Simple Logging (MVP - Default)

No additional setup required. Submissions are logged to console and returned as successful.

**Use case**: Development, testing, or manual processing

### Option 2: GitHub Issue Creation (Recommended for Production)

Automatically creates issues in the btcmap-data repository.

#### Setup:

1. **Get GitHub Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Name: "Bitcoin Map Submissions"
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - Copy the token (starts with `ghp_`)

2. **Add to Environment**:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Uncomment Integration Code**:
   Edit `src/app/api/submit-location/route.ts`:
   ```typescript
   // Find this section and uncomment:
   const githubToken = process.env.GITHUB_TOKEN;
   if (githubToken) {
     await createGitHubIssue(submission, githubToken);
   }
   ```

4. **Contact btcmap.org Team**:
   - Email or create an issue asking for approval to use this method
   - Explain your use case
   - Wait for approval before deploying to production

### Option 3: Email Webhook (Alternative)

Forward submissions to an email or webhook endpoint.

#### Setup:

1. Use a service like:
   - [SendGrid](https://sendgrid.com)
   - [Formspree](https://formspree.io)
   - [Webhook.site](https://webhook.site) (testing)

2. Add endpoint to `.env.local`:
   ```
   WEBHOOK_URL=https://your-webhook-endpoint.com
   ```

3. Implement in `route.ts`:
   ```typescript
   const webhookUrl = process.env.WEBHOOK_URL;
   if (webhookUrl) {
     await fetch(webhookUrl, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(submission),
     });
   }
   ```

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Google Maps Not Loading

**Error**: "Failed to load Google Maps"

**Solutions**:
1. Check API key is correct in `.env.local`
2. Verify all 3 APIs are enabled in Google Cloud
3. Check API key restrictions allow your domain
4. Check browser console for specific error
5. Ensure billing is enabled (even for free tier)

**Test your API key**:
```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=test&key=YOUR_API_KEY"
```

### Autocomplete Not Working

**Problem**: Search input doesn't show suggestions

**Solutions**:
1. Check browser console for errors
2. Verify Places API is enabled
3. Try disabling API key restrictions temporarily
4. Check your API quota in Google Cloud Console

### Form Submission Fails

**Error**: "Failed to submit location"

**Solutions**:
1. Check browser console and server logs
2. Verify API route is working: `curl -X POST http://localhost:3000/api/submit-location -d '{}'`
3. If using GitHub strategy, verify token has correct permissions
4. Check GitHub rate limits

### Build Errors

**Error**: TypeScript errors during build

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Not Working

**Problem**: API key not being read

**Solutions**:
1. Ensure file is named exactly `.env.local` (not `.env.local.txt`)
2. Restart development server after changing env vars
3. Check there are no quotes around the value (unless the value itself contains spaces)
4. Verify the variable starts with `NEXT_PUBLIC_` for client-side access

## Production Checklist

Before deploying to production:

- [ ] Google Maps API key restricted to production domain
- [ ] Billing enabled in Google Cloud
- [ ] Environment variables set in deployment platform
- [ ] Submission strategy configured (GitHub or webhook)
- [ ] Tested on real mobile devices
- [ ] Analytics configured (optional)
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

## Getting Help

If you encounter issues not covered here:

1. Check the [main README](README.md)
2. Search [GitHub Issues](https://github.com/your-repo/issues)
3. Ask in the btcmap.org community
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [BTC Map](https://btcmap.org)
