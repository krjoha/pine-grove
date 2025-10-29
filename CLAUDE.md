# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pine Grove Interactive (https://pgi.dev) is a static website built with Hugo and the KeepIt theme. The site focuses on AI & Data Engineering expertise and is bilingual (Swedish and English).

## Architecture

### Hugo Static Site Generator
- **Hugo version**: 0.137.0 (extended) - specified in `.github/workflows/gh-pages.yml:24`
- **Theme**: KeepIt (hard-copied into `themes/KeepIt/`, not a git submodule)
- **Configuration**: `config.toml` contains all site settings, multilingual setup, and theme parameters
- **Build output**: Generated to `public/` directory (not committed)

### Content Structure
Content is organized under `content/` with bilingual support:
- `content/posts/[post-name]/` - Each post has its own directory containing:
  - `index.en.md` - English version
  - `index.sv.md` - Swedish version
  - Associated images and assets
- `content/about/` - About page (bilingual)
- Posts use Hugo's page bundles pattern for co-locating content with images

### Multilingual Configuration
The site supports Swedish (sv) and English (en):
- English is primary language
- Swedish is secondary
- Each language has its own menu structure defined in `config.toml`
- Language-specific content must use matching suffixes (`.en.md`, `.sv.md`)

### Theme Customization
The KeepIt theme is embedded rather than referenced as a submodule:
- Theme files: `themes/KeepIt/`
- Theme has its own `package.json` for JavaScript/CSS build tools (Babel, Browserify)
- AVOID CHANGING ANYTHING IN THE THEME FOLDER, override by changing in the project instead

## Development Commands

### Running the Development Server
Hugo is not installed locally but runs via GitHub Actions. To develop locally, you would need to:
```bash
hugo server -D
```

### Creating New Posts
Use Hugo's archetype system:
```bash
hugo new posts/[post-name]/index.en.md
hugo new posts/[post-name]/index.sv.md
```

The archetype is defined in `archetypes/default.md` but posts typically use extended frontmatter including:
- `title_seo` - SEO-optimized title
- `title` - Display title
- `date` and `lastmod`
- `draft` status
- `author` and `authorLink`
- `description` and `summary`
- `lightgallery` and `toc` settings

## Deployment

The site uses GitHub Actions for deployment:
- Workflow: `.github/workflows/gh-pages.yml`
- Triggers on push to `main` branch
- Deploys to GitHub Pages with custom CNAME: `pgi.dev`
- Uses peaceiris/actions-hugo@v3 for Hugo setup
- Uses peaceiris/actions-gh-pages@v3 for deployment

## Important Notes


### Content Shortcodes
The KeepIt theme provides custom shortcodes for rich content:
- `{{< image src="file.webp" caption="..." >}}` - Enhanced images with captions
- Various other shortcodes available in `themes/KeepIt/layouts/shortcodes/`

### Configuration Highlights
- Base URL: `https://pgi.dev` (config.toml:1)
- Permalinks use `:filename` format (config.toml:537)
- Search enabled using Lunr (config.toml:153-168)
- Git info enabled for last modified dates (config.toml:30)
- Outputs: HTML, RSS, JSON for home; HTML and Markdown for pages (config.toml:561-566)

### Static Assets
- Static files: `static/` (images, favicon, etc.)
- Images referenced as `/images/[filename]` in content
- SVG favicon: `/images/favicon.svg` (config.toml:144)

## Content Guidelines

When creating or editing posts:
1. Always create both `.en.md` and `.sv.md` versions
2. Use descriptive directory names for post bundles. This naming should follow best SEO practices
3. Include both `title_seo` and `title` in frontmatter
4. Set appropriate `draft: false` when ready to publish
5. Use relative paths for images within post bundles
6. Leverage the `{{< image >}}` shortcode for proper image handling

### Writing Style Guide

1. Core Principles

Your goal is to be direct, confident, and technically precise. Write like a seasoned developer, not an AI assistant.
Audience: Developers and engineers. Assume foundational knowledge.
Voice: Use active voice. Avoid passive voice.
Clarity: Prioritize short, clear sentences.
Confidence: State facts directly. Avoid "weasel words."

2. Anti-Patterns to Strictly Avoid
This section lists common "LLM-flavored" phrasing. You must avoid these patterns.
* Typographic and Punctuation
NO EM-DASHES (—): This is a strict rule. Do not use em-dashes.
Alternative: Use a period and a new sentence. For lists or clarifications, a colon (:) or comma (,) is sufficient.
* Structural and Phrasing
NO "It is..." Prefaces: Avoid throat-clearing prefaces like "It's important to note that..." or "It is crucial to remember...". State the fact directly.
NO Contrastive Redefinitions: Do not use the "This is not X, it is Y" pattern. It is verbose.
Instead of: "The new function is not a replacement for the old API, it is a purpose-built alternative for high-throughput."
Do this: "The new function is a purpose-built alternative to the old API, designed for high-throughput."
NO Overt Telegraphing: Do not use clunky structural signposting.
Avoid: "In this article, we will...", "To summarize,...", "In conclusion,..."
Do this: Let the introduction and conclusion stand on their own.
NO Filler Adverbs: Avoid robotic conjunctive adverbs.
Avoid: Additionally,, Furthermore,, Moreover,
Avoid: However, (use But, or restructure).
Do this: Use simpler transitions like Also, And, or But,.
NO Hedging or Weasel Words: Do not hedge unless technically necessary.
Avoid: "It seems that...", "This could possibly be...", "It appears to be..."
Do this: "This is..." or "This may fail if..."
NO Overused Jargon: Avoid "business" or "LLM" jargon.
Avoid: "deep dive," "unpack," "leverage," "streamline," "utilize."
Do this: Use precise alternatives: "Analyze," "use," "improve," "investigate."

Always write new post in English first, then use that to translate it to Swedish. Use already existing post for inspiration about wording and writing style.