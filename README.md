# Octopad

A modern, tier-based dashboard application for organizing and accessing your favorite web applications and links. Built with Next.js 14, TypeScript, and NextAuth for secure Google OAuth authentication.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)

## 🎯 About

Octopad is a personalized dashboard that allows you to organize your frequently used web applications and links into customizable tiers (categories). Think of it as a visual bookmark manager with a tier-list style interface, where you can:

- Organize your favorite apps and websites into categorized tiers
- Quickly access your most-used resources with a single click
- Share your tier configurations with others using share codes
- Customize each pad (link/app) with custom names, URLs, and icons
- Drag and drop pads to reorganize them within tiers

The application uses local storage to persist your data, ensuring your dashboard is always available when you need it.

## ✨ Features

### Core Functionality

- **Tier-based Organization**: Organize your pads into multiple tiers (default: 3 tiers)
- **Pad Management**: 
  - Add, edit, and delete pads (links/applications)
  - Customize pad names, URLs, and icons
  - Each tier supports up to 8 pads
- **Drag and Drop**: Reorder pads within tiers by dragging and dropping
- **Tier Sharing**: Share your tier configurations with others using unique share codes
- **Google OAuth Authentication**: Secure login using your Google account
- **Hybrid Storage**: 
  - Private tiers: Stored locally in your browser (localStorage)
  - Shared tiers: Stored in Supabase (cloud database) for cross-device sharing

### User Interface

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Bootstrap UI**: Modern, clean interface built with React Bootstrap
- **Interactive Modals**: Easy-to-use modals for adding and editing pads and tiers
- **Visual Feedback**: Animations and visual cues for better user experience

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (React framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **UI Components**: [React Bootstrap](https://react-bootstrap.github.io/) & [Bootstrap 5](https://getbootstrap.com/)
- **Styling**: CSS Modules
- **Storage**: Browser LocalStorage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Google account for OAuth setup

### Installation

1. **Clone the repository** (or download the project):
```bash
git clone <repository-url>
cd octopad
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Set up environment variables** (see [Configuration](#configuration) below)

4. **Run the development server**:
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Connection String (Optional - for shared tiers)
# If not configured, shared tiers will use in-memory storage (development mode)
# Supabase: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
# You can find this in Supabase: Settings > Database > Connection string > URI
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

**Note**: The database configuration is optional. If not configured, the app will work in development mode with in-memory storage for shared tiers. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on setting up Supabase for production use.

### Setting up Google OAuth

To obtain Google OAuth credentials:

1. **Access Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen**:
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (for testing) or "Internal" (for Google Workspace organizations)
   - Fill in the basic information:
     - App name: "Octopad" (or your preferred name)
     - User support email: Your email address
     - Developer contact information: Your email address
   - Add your email as a test user (if you chose "External")

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Configure the authorized redirect URI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - For production, also add your production URL:
     ```
     https://yourdomain.com/api/auth/callback/google
     ```
   - Copy the generated "Client ID" and "Client secret"

4. **Generate NEXTAUTH_SECRET**:
   - You can generate a secure secret using:
   ```bash
   openssl rand -base64 32
   ```
   - Or use any online random string generator

### Production Configuration

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add your production callback URL to Google OAuth credentials
3. Ensure your `NEXTAUTH_SECRET` is a strong, random string
4. Consider using environment variables provided by your hosting platform (Vercel, Netlify, etc.)

## 📖 Usage

### First Time Setup

1. **Sign In**: Click "Sign in with Google" on the home page
2. **Authorize**: Grant permissions to Octopad to access your Google account
3. **Access Dashboard**: You'll be redirected to your dashboard

### Managing Tiers

- **View Tiers**: Your dashboard displays all your tiers (default: 3 empty tiers)
- **Name a Tier**: Click the "+ Add name" button or click on an existing tier name to edit
- **Share a Tier**: Each tier has a unique share code that can be used to share tier configurations
- **Add Tier by Code**: Use a share code to import a tier configuration from another user

### Managing Pads

- **Add a Pad**: Click on an empty slot in a tier to open the "Add Pad" modal
  - Enter the pad name
  - Enter the URL (e.g., `https://example.com`)
  - Optionally provide an icon URL (favicon or custom icon)
  - Click "Add" to create the pad

- **Edit a Pad**: Click on an existing pad to open the edit modal
  - Modify the name, URL, or icon
  - Click "Save" to apply changes

- **Delete a Pad**: 
  - Hold down the left mouse button on a pad for 3 seconds
  - A delete icon will appear
  - Click the delete icon to remove the pad

- **Reorder Pads**: Drag and drop pads within a tier to reorganize them

### Accessing Your Pads

- Simply click on any pad to open its URL in a new tab
- Pads are organized in a grid layout (8 pads per tier)
- Each pad displays its custom icon (or a default icon if none is provided)

### Data Storage

- **Private Tiers**: Stored locally in your browser's localStorage
  - Data persists across browser sessions
  - Each user's private data is isolated to their browser
  - **Note**: Clearing browser data will remove your private tiers

- **Shared Tiers**: Stored in Supabase (cloud database)
  - Accessible from any device or browser
  - Can be shared with other users using share codes
  - Requires Supabase configuration (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
  - **Note**: Without Supabase, shared tiers use in-memory storage (lost on server restart)

## 📁 Project Structure

```
octopad/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API route
│   ├── dashboard/
│   │   ├── components/               # Dashboard components
│   │   │   ├── AddTierModal.tsx     # Modal for adding tiers
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── PadCard.tsx          # Individual pad card component
│   │   │   ├── PadGrid.tsx          # Grid layout for pads
│   │   │   ├── PadModal.tsx         # Modal for adding/editing pads
│   │   │   ├── TierHeader.tsx       # Tier header component
│   │   │   └── TierModal.tsx        # Modal for tier management
│   │   ├── page.tsx                 # Dashboard page
│   │   └── page.module.css          # Dashboard styles
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home/login page
│   └── providers.tsx                # React providers (NextAuth)
├── lib/
│   ├── padStorage.ts                # Pad storage utilities
│   └── tierStorage.ts              # Tier storage utilities
├── types/
│   ├── pad.ts                      # Pad type definitions
│   ├── tier.ts                     # Tier type definitions
│   └── next-auth.d.ts              # NextAuth type definitions
├── .gitignore                      # Git ignore rules
├── next.config.js                  # Next.js configuration
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server on [http://localhost:3000](http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

### Development Guidelines

- **TypeScript**: The project uses TypeScript for type safety
- **CSS Modules**: Component styles are scoped using CSS Modules
- **Client Components**: Components using hooks or browser APIs are marked with `'use client'`
- **Server Components**: Default Next.js components are server components
- **Local Storage**: Data persistence is handled via browser localStorage

### Code Structure

- **Components**: Reusable UI components in `app/dashboard/components/`
- **Utilities**: Storage and helper functions in `lib/`
- **Types**: TypeScript type definitions in `types/`
- **API Routes**: NextAuth configuration in `app/api/auth/`

## 🔐 Security Notes

- Never commit `.env.local` or any environment files to version control
- Keep your `NEXTAUTH_SECRET` secure and use a strong random string
- Google OAuth credentials should be kept private
- LocalStorage data is browser-specific and not synced across devices

## 📝 License

This project is private and not licensed for public use.

## 🤝 Contributing

This is a personal project. Contributions are not currently being accepted.

---

**Built with ❤️ using Next.js and TypeScript**
