# Nuxt Monorepo Development Doctrine

## Core Principles

### Incremental Verification Protocol
- **Always test builds after each significant configuration change**, not just at completion
- **Verify each workspace independently** before attempting cross-workspace operations
- **Use build failures as diagnostic tools** to identify configuration gaps early

### Module Management Strategy
- **Install only essential modules initially**, add complexity incrementally
- **Verify module compatibility** with Nuxt version before installation
- **Remove unused modules** that cause build conflicts (e.g., i18n from static sites)

### CSS and Styling Standards
- **Use standard Tailwind classes** or verify custom classes exist in configuration
- **Avoid custom CSS variables** without proper Tailwind configuration
- **Test CSS compilation** as part of build verification

### Monorepo Architecture Patterns
- **Configure TypeScript path resolution** before attempting shared package imports
- **Set up workspace dependencies** before installing application-specific modules
- **Use .npmrc with shamefully-hoist=true** for Nuxt compatibility in monorepos

### Error Resolution Protocol
- **Identify root cause** before implementing fixes
- **Fix foundational issues first** (environment, types, imports) before higher-level functionality
- **Test fixes incrementally** to ensure they don't introduce new issues

## Application-Specific Guidelines

### Web Application (SSR)
- Include full module stack: @nuxt/ui, @nuxtjs/supabase, @nuxt/image, @nuxt/icon, @nuxtjs/color-mode, @nuxtjs/i18n, @nuxt/fonts, @planship/nuxt
- Configure for server-side rendering and authentication

### Docs Application (SSG)
- Minimal module set: @nuxt/content, @nuxt/ui, @nuxt/image, @nuxt/icon, @nuxtjs/color-mode, @nuxt/fonts
- Exclude i18n and authentication modules
- Optimize for static generation

### Marketing Application (SSG/ISR)
- Essential modules only: @nuxt/ui, @nuxt/image, @nuxt/icon, @nuxtjs/color-mode, @nuxt/fonts
- Exclude i18n and authentication modules
- Optimize for static generation with ISR capabilities

## Quality Gates
- All applications must build successfully before marking tasks complete
- Shared package imports must resolve correctly across all workspaces
- Font loading must work consistently across all applications
- No unused dependencies or conflicting modules
