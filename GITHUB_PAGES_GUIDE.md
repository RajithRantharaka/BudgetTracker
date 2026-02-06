# Hosting on GitHub Pages (Free)

Since you have a GitHub Student account, hosting on GitHub Pages is a great option.

I have already configured your app to be compatible with GitHub Pages (switched to `HashRouter` and `relative paths`).

## Steps to Deploy

1.  **Initialize Git** (if you haven't):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a Repository on GitHub**:
    *   Go to [GitHub.com/new](https://github.com/new).
    *   Name it `budget-tracker`.
    *   Create Repository.

3.  **Link and Push**:
    *   Copy the commands shown on GitHub (under "...push an existing repository...").
    *   Run them in your terminal:
        ```bash
        git remote add origin https://github.com/<YOUR_USERNAME>/budget-tracker.git
        git branch -M main
        git push -u origin main
        ```

4.  **Deploy to Pages**:
    *   Run this special command I added for you:
        ```bash
        npm run deploy
        ```
    *   *This will build your app and push it to a `gh-pages` branch.*

5.  **View Your App**:
    *   Go to your Repository on GitHub -> **Settings** -> **Pages**.
    *   Your site should be live at: `https://<YOUR_USERNAME>.github.io/budget-tracker/`

**Note:** Since you run the build locally, your `.env` keys are safely included in the deployed app. You don't need to configure secrets on GitHub for this specific method.
