# Deployment Guide - Personal Expense Tracker

This guide will help you host your application for free and set up the database.

## Step 1: Set up Supabase (Database)
1.  Go to [Supabase.com](https://supabase.com/) and Sign Up.
2.  Create a **New Project**.
3.  Once created, go to the **SQL Editor** (sidebar icon).
4.  Click **New Query**.
5.  Open the file `supabase_schema.sql` from this project, copy its content, paste it into the SQL Editor, and click **Run**.
    *   *This sets up your database tables and security rules.*

## Step 2: Get API Keys
1.  In your Supabase project, go to **Project Settings** (gear icon) -> **API**.
2.  Copy the `Project URL` and `anon public` key.

## Step 3: Run Locally (CRITICAL STEP)
1.  **Create a file named `.env`** in your project folder (next to `package.json`).
2.  Copy the content from `.env.example` into `.env`.
3.  Ensure your keys are pasted correctly in `.env`:
    ```env
    VITE_SUPABASE_URL=your_project_url_here
    VITE_SUPABASE_ANON_KEY=your_anon_key_here
    ```
4.  **Restart the server** (Ctrl+C in terminal, then `npm run dev`) for changes to take effect.
5.  Open the App and **Register** a new account.

## Step 4: Deploy to Vercel (Hosting)
1.  Go to [Vercel.com](https://vercel.com/) and Sign Up.
2.  Install Vercel CLI or link your GitHub repository.
    *   *Easiest way:* Push this code to GitHub.
3.  In Vercel, click **Add New** -> **Project**.
4.  Import your GitHub repository.
5.  In the **Environment Variables** section, add the same keys:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
6.  Click **Deploy**.

🎉 **Your app is now live!**
