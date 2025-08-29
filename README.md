# Calendar Cubby - Social Media Calendar

A comprehensive social media calendar application built with React, TypeScript, and Supabase.

## Features

- 📅 **Social Media Calendar**: Visual calendar interface for managing social media posts
- 🏢 **Organization Management**: Create and manage multiple organizations/clients
- 🔗 **Sharing & Collaboration**: Share view-only or edit access links
- 📝 **Post Management**: Create, edit, and delete social media posts
- 💬 **Comments & Reviews**: Collaborative workflow with comments and approval system
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🔐 **Authentication**: Secure user authentication with Supabase Auth

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Query + React Hooks
- **Routing**: React Router DOM

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd calendar-cubby
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Start development server:
```bash
npm run dev
# or
bun run dev
```

## Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. **Build Settings** (automatically detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

2. **Environment Variables** (set in Netlify dashboard):
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Deploy**:
   - Connect your Git repository
   - Netlify will automatically build and deploy
   - Your site will be available at `https://your-site.netlify.app`

### Manual Deployment

```bash
npm run build
# Upload the `dist` folder to your hosting provider
```

## Key Features

### Organization Management
- Create unlimited organizations/clients
- Each organization has its own calendar
- Secure user isolation

### Sharing & Collaboration
- Generate view-only links for stakeholders
- Create edit access links for team members
- Secure token-based access control
- Links work seamlessly in production

### Social Media Calendar
- Monthly calendar view
- Drag & drop post scheduling
- Media upload support
- Post status tracking (draft, scheduled, posted)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/            # shadcn/ui components
│   ├── CalendarGrid.tsx
│   ├── ShareModal.tsx
│   └── OrganizationModal.tsx
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── pages/              # Page components
└── config/             # Configuration files
```

## Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Deploy the Edge Function in `supabase/functions/share/`
4. Set up Row Level Security (RLS) policies
5. Configure CORS for your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
