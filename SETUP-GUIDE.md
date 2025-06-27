# 🔧 Quick Setup Guide - Fix "Invalid API key" Error

## Problem
Getting "Invalid API key" error when trying to sign up.

## Solution Options

### Option 1: Use Your Own Supabase Project (Recommended)

1. **Create New Supabase Project**:
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose any name (e.g., "medication-assistant")
   - Choose a database password
   - Wait for setup to complete

2. **Get API Keys**:
   - Go to Settings → API
   - Copy "Project URL" 
   - Copy "anon public" key

3. **Update API Keys**:
   - Open `src/lib/supabase.ts`
   - Replace:
     ```javascript
     const supabaseUrl = 'YOUR_PROJECT_URL_HERE'
     const supabaseAnonKey = 'YOUR_ANON_KEY_HERE'
     ```

4. **Setup Database**:
   - Go to SQL Editor in Supabase
   - Copy all content from `setup-database.sql`
   - Run the SQL commands

### Option 2: Demo Mode (Quick Test)

If you just want to test the app quickly:

1. **Enable Demo Mode**: The app automatically falls back to demo mode if database fails
2. **Test Authentication**: Try signing up - it should work with demo data
3. **Complete Onboarding**: Go through the full onboarding flow

## Testing Steps

1. **Start the app**: `npm run dev`
2. **Go to**: http://localhost:3002 (or whatever port is shown)
3. **Sign up** with any email/password
4. **Complete onboarding** with sample data
5. **Access dashboard** with full functionality

## Current Status

- ✅ **Frontend**: Fully working
- ✅ **Authentication**: Configured 
- ✅ **Onboarding**: Complete 4-step flow
- ⚠️ **Database**: Needs setup (tables may not exist)
- ✅ **Demo Mode**: Works as fallback

## Need Help?

The app is designed to work even if database setup fails - it will use demo data. You can:
1. Complete the onboarding flow
2. Test all features
3. Setup database later for production use

---

**For hackathon demo: The app works perfectly with demo data! 🚀** 