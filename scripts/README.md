# Strapi Data Management Scripts

This directory contains scripts for managing content in your Railway Strapi instance.

## Prerequisites

1. **Strapi API Token**: You need an API token with full access permissions.

### Getting Your API Token

1. Go to your Strapi admin panel: <https://strapi-production-7ecb.up.railway.app/admin>
2. Navigate to **Settings** → **API Tokens**
3. Click **"Create new API Token"**
4. Configure the token:
   - **Name**: Data Management Script
   - **Description**: Token for data import/export
   - **Token duration**: Unlimited
   - **Token type**: Full access
5. Click **Save** and copy the token immediately

## Setup

1. Install dependencies:

```bash
cd scripts
npm install
```

2. Set your API token as an environment variable:

```bash
export STRAPI_API_TOKEN="your-token-here"
```

Or create a `.env` file in the scripts directory.

## Available Scripts

### Sync Missing Internships

```bash
node sync-missing-internships.js
```

**Note**: All 39 internships are now synced. This script is kept for reference. See `SYNC_INSTRUCTIONS.md` for detailed usage.

### Create Projects

```bash
node create-projects.js
```

### Import Blog Posts

```bash
node import-blog-posts.js
```

### Upload Images to Strapi

```bash
node upload-images-to-strapi.js
```

### Populate Homepage Sections

```bash
node populate-homepage-sections.js
```

### Populate About Page

```bash
node populate-about-page.js
```

### Set Strapi Permissions

```bash
node set-strapi-permissions.js
```

## Removed Scripts

The following scripts were used during migration and have been removed:

- `import-wordpress-to-strapi.js`
- `check-internships.js`, `compare-internships.js`, `check-projects.js`
- `clear-projects-db.js`, `delete-null-projects.js`
- `fix-homepage-flags.js`, `publish-all-projects.js`
- `set-homepage-projects.js`, `update-*.js`

These are preserved in git history if needed.
