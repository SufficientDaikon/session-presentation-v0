# Session Presentation v0

## Project Overview
Interactive HTML/CSS/JS presentation system deployed on Cloudflare Pages.
Built with reveal.js as the core engine + custom interactivity layer.

## Architecture
- **Stack:** reveal.js 5.2.1 (CDN) + vanilla CSS + vanilla JS
- **Deploy:** Cloudflare Pages via GitHub integration (CI/CD on push)
- **Repo:** `session-presentation-v0` on GitHub (SufficientDaikon)
- **URL:** Cloudflare Pages auto-assigned (will be customized later)

## Project Structure
```
session-presentation-v0/
├── index.html          # Main presentation file
├── css/
│   └── custom.css      # Custom styles, animations, interactive elements
├── js/
│   └── main.js         # Custom interactivity, button handlers, state
├── assets/             # Images, icons, media
├── wrangler.toml       # Cloudflare Pages config
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
├── CLAUDE.md           # This file
└── .gitignore
```

## Current Phase: v0 Prototyping (30-minute sprint)
- Goal: Working interactive presentation with animations, transitions, clickable elements
- Deployed and accessible via Cloudflare Pages URL
- CI/CD pipeline active: push to main = auto-deploy

## Design Principles
1. **Interactive first** — Every slide should have something clickable or animated
2. **Smooth transitions** — Use reveal.js auto-animate + custom CSS transitions
3. **Modern aesthetic** — Dark theme, clean typography, subtle gradients
4. **Fast iteration** — Single push deploys, no build step needed
5. **Progressive enhancement** — Works without JS for content, JS adds interactivity

## Conventions
- All custom CSS in `css/custom.css` (never inline except reveal.js data attributes)
- All custom JS in `js/main.js` (vanilla, no frameworks)
- reveal.js loaded via CDN (no local copy needed)
- Semantic HTML inside slides
- All interactive elements use `data-action` attributes for JS binding

## Deployment
- `git push origin main` triggers Cloudflare Pages build
- Build command: (none — static site)
- Build output directory: `.` (root)
- No build step needed

## Versioning
- v0: Initial prototype (current)
- v1: First complete version (target after 30-min sprint)
- URL slug will be updated as versions progress

## Quick Commands
```bash
# Local preview
npx serve .

# Deploy manually (backup)
wrangler pages deploy . --project-name=session-presentation-v0

# Check deployment status
wrangler pages deployment list --project-name=session-presentation-v0
```
