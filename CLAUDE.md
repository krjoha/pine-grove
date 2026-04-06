# **Pine Grove Interactive (pgi.dev) \- Claude Configuration**

This document contains mandatory operating instructions, architectural context, and writing style guidelines for Claude when working on this repository.

## **🚫 CRITICAL RULES (NEVER VIOLATE)**

* **NEVER** modify any files inside themes/KeepIt/. The theme is embedded, not a submodule. All theme overrides MUST be done in the project root directory.  
* **ALWAYS** create both .en.md (English) and .sv.md (Swedish) versions for every new post or page.  
* **ALWAYS** write the English version first, then translate it to Swedish. Use existing posts to match wording and style.  
* **NEVER** use em-dashes (—) in text content. (See Writing Style Guide below).

## **🛠 Tech Stack & Architecture**

* **Framework:** Hugo 0.137.0 (extended).  
* **Theme:** KeepIt (embedded).  
* **Configuration:** config.toml handles all site settings, multilingual routing, and parameters.  
* **Deployment:** GitHub Actions (.github/workflows/gh-pages.yml) deploys to pgi.dev on main push.

## **💻 Development Commands**

* **Run Local Server:** hugo server \-D  
* **Create New Post (English):** hugo new posts/\<seo-friendly-directory-name\>/index.en.md  
* **Create New Post (Swedish):** hugo new posts/\<seo-friendly-directory-name\>/index.sv.md

## **📁 Content & Structure Guidelines**

The site uses Hugo's page bundles pattern. Co-locate content and assets (images) inside specific post directories.

### **Frontmatter Requirements**

All new posts MUST include the following in their frontmatter:

* title\_seo: SEO-optimized title.  
* title: Display title.  
* date and lastmod.  
* draft: Set to false ONLY when ready to publish.  
* author and authorLink.  
* description and summary.  
* lightgallery: true and toc: true (if applicable).

### **Assets & Shortcodes**

* Store site-wide static files in static/ (e.g., /images/favicon.svg).  
* Use relative paths for images co-located within post bundles.  
* **Images:** ALWAYS use the theme's shortcode for images:  
  {{\< image src="filename.webp" caption="Description" \>}}

## **✍️ WRITING STYLE GUIDE**

Write directly, confidently, and with technical precision. Your persona is a seasoned developer, NOT an AI assistant. Assume foundational knowledge from your audience (engineers/developers). Use active voice and short, clear sentences.

### **Strict Anti-Patterns**

| ❌ AVOID (Anti-Pattern) | ✅ DO THIS (Alternative) | Rule |
| :---- | :---- | :---- |
| Here is a... — but... | Here is a... But... | **NO EM-DASHES (—).** Use a period, colon, or comma. |
| It is important to note that X... | X is... | **NO THROAT-CLEARING.** State facts directly. |
| This is not X, it is Y. | This is a purpose-built Y. | **NO CONTRASTIVE REDEFINITIONS.** Do not tell the reader what it *isn't*. |
| In this article, we will... | *(Just start the article)* | **NO OVERT TELEGRAPHING.** Let the structure speak for itself. |
| Furthermore,, Additionally, | Also,, And,, But, | **NO FILLER ADVERBS.** Avoid robotic conjunctive adverbs. |
| It seems that..., It appears | This is..., This fails if... | **NO HEDGING.** Be confident unless technically required. |
| Deep dive, Unpack, Leverage | Analyze, Investigate, Use | **NO JARGON.** Use precise, standard verbs. |

**Example of Bad Output:**  
*Furthermore, it is important to note that the new API—which is not a replacement for the old one, but a new tool entirely—can be leveraged to streamline processes.*  
**Example of Good Output:**  
*The new API improves throughput and operates independently of the legacy system.*