# Hosting Guide - Vercel (Free)

The easiest way to host this app for free is **Vercel**.

## Method 1: Deploy using Vercel CLI (Recommended if you don't have GitHub)
1.  **Install Vercel CLI**:
    Open your terminal and run:
    ```bash
    npm i -g vercel
    ```
2.  **Login**:
    Run:
    ```bash
    vercel login
    ```
    (Follow instructions to log in via Email or GitHub)
3.  **Deploy**:
    Run this command in your project folder:
    ```bash
    vercel
    ```
    *   Set up and deploy? **Yes**
    *   Which scope? **(Select your account)**
    *   Link to existing project? **No**
    *   Project name? **budget-tracker** (or whatever you like)
    *   Directory? **./**
    *   Auto-detect settings? **Yes**

4.  **Add Environment Variables**:
    *   Go to the Vercel Dashboard in your browser.
    *   Select your project `budget-tracker`.
    *   Go to **Settings > Environment Variables**.
    *   Add:
        *   `VITE_SUPABASE_URL` : (Your URL from Supabase)
        *   `VITE_SUPABASE_ANON_KEY` : (Your Key from Supabase)
    *   **Redeploy** (Go to Deployments > Redeploy) for keys to take effect.

## Method 2: Deploy using GitHub (Easiest for updates)
1.  Push this code to a new GitHub repository.
2.  Go to [Vercel.com](https://vercel.com/) -> **Add New Project**.
3.  Import your repository.
4.  Paste your Environment Variables (`VITE_SUPABASE_URL`, etc).
5.  Click **Deploy**.

Your app will be online at `https://your-project-name.vercel.app`!
