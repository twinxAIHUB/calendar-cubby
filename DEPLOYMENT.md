# Netlify Deployment Guide

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Your project should be in a Git repository (GitHub, GitLab, etc.)
3. **Supabase Project**: Ensure your Supabase project is set up and running

## Environment Variables

Set these environment variables in your Netlify dashboard:

### Required Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional Variables
- `NODE_ENV`: Set to `production`

## Deployment Steps

### 1. Connect Repository
1. Go to your Netlify dashboard
2. Click "New site from Git"
3. Choose your Git provider and repository
4. Select the branch you want to deploy (usually `main` or `master`)

### 2. Build Settings
Netlify will automatically detect these settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3. Environment Variables
1. Go to Site settings > Environment variables
2. Add the required environment variables listed above
3. Redeploy your site after adding variables

### 4. Deploy
1. Netlify will automatically build and deploy your site
2. You'll get a unique URL (e.g., `https://your-site-name.netlify.app`)
3. You can set up a custom domain later

## Features That Work in Production

### ✅ Sharing Links
- View-only and edit access links work properly
- Links use the correct production domain
- Token validation works via Supabase Edge Functions

### ✅ Organization Management
- Users can create, edit, and delete organizations
- All CRUD operations work in production
- Proper authentication and authorization

### ✅ Social Media Calendar
- Full calendar functionality
- Post creation, editing, and deletion
- Media uploads and management

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Ensure Node.js version is 18 or higher
- Check build logs for specific error messages

### Sharing Links Not Working
- Verify Supabase Edge Functions are deployed
- Check that environment variables are correct
- Ensure CORS is properly configured in Supabase

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check that Supabase project is active
- Ensure RLS policies are properly configured

## Custom Domain Setup

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS records as instructed by Netlify
4. Wait for DNS propagation (can take up to 48 hours)

## Performance Optimization

The build is optimized with:
- Code splitting for vendor libraries
- Tree shaking for unused code
- Optimized bundle sizes
- Proper caching headers

## Security

- All sensitive operations go through Supabase Edge Functions
- Proper CORS configuration
- Environment variables for sensitive data
- No hardcoded secrets in the codebase
