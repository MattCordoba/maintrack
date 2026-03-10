# MainTrack

Asset maintenance tracking application with web and mobile clients.

## Project Structure

```
maintrack/
├── maintrack/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native (Expo) mobile app
└── README.md
```

## Prerequisites

- Node.js 18.17+ (20+ recommended)
- pnpm (`npm install -g pnpm`)
- Supabase account (for authentication)
- Vercel account (for deployment)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Web Application Setup

### 1. Install Dependencies

```bash
cd maintrack/web
pnpm install
```

### 2. Configure Environment

Copy the environment template:
```bash
cp .env.example .env.local
```

Fill in your credentials:
- **POSTGRES_*** - Auto-populated when you add Vercel Postgres
- **BLOB_READ_WRITE_TOKEN** - Auto-populated when you add Vercel Blob
- **NEXT_PUBLIC_SUPABASE_URL** - From your Supabase project settings
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - From your Supabase project API settings
- **SUPABASE_SERVICE_ROLE_KEY** - From your Supabase project API settings

### 3. Set Up Supabase Auth

1. Create a new Supabase project at https://supabase.com
2. Go to Authentication > URL Configuration
3. Add your site URL and redirect URLs
4. Copy your project URL and anon key to `.env.local`

### 4. Set Up Database

```bash
# Generate migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed initial data (asset types and task templates)
pnpm db:seed
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

From the `maintrack/web` directory:

```bash
vercel
```

### 3. Add Integrations

In your Vercel dashboard:
1. Add **Vercel Postgres** integration
2. Add **Vercel Blob** integration
3. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your deployed URL)

### 4. Run Database Seed

After deployment, run the seed script locally with production credentials:
```bash
pnpm db:seed
```

## Mobile Application Setup

### 1. Install Dependencies

```bash
cd maintrack/mobile
pnpm install
```

### 2. Configure Environment

Copy the environment template:
```bash
cp .env.example .env.local
```

Fill in:
- **EXPO_PUBLIC_SUPABASE_URL** - Same as web app
- **EXPO_PUBLIC_SUPABASE_ANON_KEY** - Same as web app
- **EXPO_PUBLIC_API_URL** - Your deployed web app URL

### 3. Run Development

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### 4. Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Features

- **Dashboard** - Overview with task status donut chart
- **Assets** - Manage all your tracked assets with categories
- **Tasks** - Time-based, cycle-based, and one-time maintenance tasks
- **Notifications** - Get alerts for upcoming and overdue tasks
- **Search** - Find tasks, assets, and notes quickly
- **File Attachments** - Add photos and documents to assets and tasks
- **Dark Mode** - Automatic theme based on system preference

## Task Types

- **Time-based**: Recurring tasks on a schedule (e.g., "Change oil every 3 months")
- **Cycle-based**: Tasks based on usage meters (e.g., "Change oil every 5000 miles")
- **One-time**: Single tasks that don't repeat

## Asset Categories

Home, Vehicle, Marine, Trailer, Aviation, Human-Powered, Lawn & Garden, Shop Tools, Heavy Equipment, Gear & Equipment

## Tech Stack

### Web
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- Vercel Postgres
- Vercel Blob
- Supabase Auth
- Recharts

### Mobile
- React Native
- Expo SDK 52
- Expo Router
- Supabase Auth
