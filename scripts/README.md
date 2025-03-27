# LoadUp Deployment Scripts

This directory contains scripts to help with deploying the LoadUp application to Vercel.

## Prerequisites

- Node.js installed
- Vercel CLI installed (`npm install -g vercel`)
- GitHub CLI installed (`gh`) - [Installation Guide](https://cli.github.com/)
- Vercel account
- GitHub account with access to the LoadUp repository

## Scripts

### 1. Environment Variable Management

#### a. Create Environment Variables Template

This script creates a `.env` file template based on GitHub secrets.

```bash
node fetch-env-vars-updated.js
```

Before running this script, make sure to:
1. Install GitHub CLI (`gh`)
2. Login to GitHub CLI using `gh auth login`
3. Have access to the LoadUp repository

The script will:
- List all GitHub secrets in your repository
- Create a `.env` file with placeholders for each secret
- Provide instructions for importing the variables to Vercel

#### b. Fill Environment Variable Values

This script helps you fill in the actual values for your environment variables.

```bash
node fill-env-values.js
```

The script will:
- Prompt you for values for each placeholder in your `.env` file
- Update the `.env` file with the values you provide
- Preserve existing values if you press Enter

#### c. Upload Environment Variables to Vercel

This script uploads environment variables from your `.env` file to Vercel.

```bash
node upload-env-to-vercel.js
```

Before running this script, make sure to:
1. Fill in the actual values in your `.env` file (using `fill-env-values.js`)
2. Login to Vercel CLI using `npx vercel login`

The script will:
- Skip placeholder values
- Upload each environment variable to your Vercel project
- Pull the latest environment variables to your local `.vercel` directory

### 2. Setup Vercel Project

This script sets up a new Vercel project and connects it to your GitHub repository.

```bash
node setup-vercel-project.js
```

Before running this script, make sure to:
1. Update the `GITHUB_REPO` variable in the script with your GitHub username
2. Login to Vercel CLI using `vercel login`

### 3. Transfer GitHub Secrets to Vercel

This script transfers GitHub secrets to Vercel environment variables.

```bash
node transfer-secrets-to-vercel.js
```

Before running this script, you need to:
1. Create a `github-secrets.json` file based on the provided template
2. Fill in the actual secret values in the JSON file

You can use the template file as a starting point:
```bash
cp github-secrets-template.json github-secrets.json
```

Then edit the `github-secrets.json` file to add your actual secret values.

## Deployment Process

### Option 1: Using Web Interface (Recommended)

1. Create environment variables template:
   ```bash
   node fetch-env-vars-updated.js
   ```

2. Fill in the actual values in the `.env` file:
   ```bash
   node fill-env-values.js
   ```

3. Import the `.env` file using the Vercel web interface:
   - Go to your Vercel project settings
   - Navigate to the "Environment Variables" section
   - Click the "Import .env" button
   - Select your `.env` file
   - Click "Save" to apply the variables

4. Deploy the application through the Vercel web interface or using:
   ```bash
   npx vercel --prod
   ```

### Option 2: Using CLI

1. Set up the Vercel project:
   ```bash
   node setup-vercel-project.js
   ```

2. Create and fill in the `.env` file:
   ```bash
   node fetch-env-vars-updated.js
   node fill-env-values.js
   ```

3. Upload environment variables to Vercel:
   ```bash
   node upload-env-to-vercel.js
   ```

4. Deploy the application:
   ```bash
   npx vercel --prod
   ```

## Troubleshooting

- If you encounter any issues with the Vercel CLI, try logging out and logging back in:
  ```bash
  npx vercel logout
  npx vercel login
  ```

- If you encounter issues with GitHub CLI, try logging out and logging back in:
  ```bash
  gh auth logout
  gh auth login
  ```

- If the scripts fail, check the error messages for specific issues.

- Make sure your GitHub repository is public or that you have connected Vercel to your GitHub account with appropriate permissions.

## Notes

- These scripts are designed to be run from the root of the LoadUp project.
- The scripts will create a Vercel project named 'loadup' by default. You can change this by modifying the `PROJECT_NAME` variable in the scripts.
- The scripts assume you have the necessary permissions to create projects in Vercel and access the GitHub repository. 