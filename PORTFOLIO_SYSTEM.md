# Portfolio Subdomain System

## Overview

Each user now has their own portfolio landing page where they can showcase all their projects. This is the professional link you share with recruiters and on your resume.

## URL Structure

### Portfolio Landing Page
**URL Format:** `/u/username`
**Example:** `http://localhost:3000/u/crystaljin` or `https://aura.com/u/crystaljin`

This page displays:
- Your username as the main heading
- Total number of projects
- Grid of all your project cards
- Each project card is clickable

### Individual Project Pages
**URL Format:** `/u/username/project-name`
**Example:** `http://localhost:3000/u/crystaljin/quorum-ai`

This is the full case study page for a specific project with:
- Video demo
- Impact metrics
- Technical journey
- Architecture diagram
- Professional assessment

## How It Works

### For Users (Dashboard)

1. **Go to Dashboard** - You'll see a "Share Portfolio Link" card at the top
2. **Copy Link** - Click the "Copy" button to copy your portfolio URL
3. **Visit Portfolio** - Click "Visit" to see your public portfolio page
4. **Share with Recruiters** - Use this link on your resume, LinkedIn, etc.

### Portfolio Landing Page

- Shows all your projects in a professional grid layout
- Each project card displays:
  - Project thumbnail/video preview
  - Project name
  - Description
  - GitHub stars and forks
  - Live site link (if available)
  - Health score

### Project Case Study Pages

- Clicking on any project takes visitors to the full case study
- Back button returns to your portfolio landing page
- Professional presentation of:
  - Video demo
  - Impact metrics
  - Technical journey
  - Architecture decisions
  - AI-generated assessments

## Technical Implementation

### Routes Created

1. `/u/[username]/page.tsx` - Portfolio landing page
2. `/u/[username]/[project]/page.tsx` - Individual project case studies

### Components Created

1. `SharePortfolioCard` - Dashboard card with portfolio URL and copy button
2. `PortfolioGrid` - Grid layout for displaying projects
3. `getUserProjects` action - Server action to fetch all user projects

### Features

- **Auto-generated URLs** - Based on your email username
- **Copy to Clipboard** - One-click copy of portfolio URL
- **Responsive Design** - Works on mobile and desktop
- **Professional Layout** - Clean, modern design for recruiters
- **SEO-Friendly** - Each project has its own dedicated URL

## Future Enhancements (Optional)

### Custom Domains (Requires Setup)
- `username.aura.com` instead of `aura.com/u/username`
- Requires wildcard DNS configuration (`*.aura.com`)
- Need Next.js middleware to detect subdomain and route accordingly

### Username Customization
- Allow users to choose a custom username (not just email prefix)
- Add username field to user profile
- Check for uniqueness

### Public/Private Toggle
- Let users make portfolio public or private
- Require authentication for private portfolios
- Share with password protection

### Analytics
- Track portfolio views
- See which projects get the most clicks
- Track where visitors come from

## Usage Examples

### On Your Resume
```
Portfolio: https://aura.com/u/crystaljin
```

### In LinkedIn About Section
```
Check out my portfolio: https://aura.com/u/crystaljin
```

### In GitHub Profile README
```markdown
📊 [View My Portfolio](https://aura.com/u/crystaljin)
```

### Sharing Specific Project
```
Check out my Quorum-AI project: https://aura.com/u/crystaljin/quorum-ai
```

## Testing

1. **Add Projects** - Add at least one project to your dashboard
2. **View Portfolio Card** - See the "Share Portfolio Link" card appear
3. **Visit Portfolio** - Click "Visit" to see your portfolio landing page
4. **Test Project Links** - Click on a project card to view the case study
5. **Test Navigation** - Use "Back to Portfolio" button to navigate back
6. **Copy URL** - Test the copy button to ensure it works

## Notes

- Username is derived from your email (part before @)
- Portfolio is only visible to authenticated users for now (MVP)
- Each project URL is based on the repository name (lowercase)
- Header navigation included on all portfolio pages
