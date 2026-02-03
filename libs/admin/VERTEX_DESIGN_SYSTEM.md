# Vertex CMS Design System - Installation Guide

## Prerequisites

Before you begin, make sure you have:
- Vertex CMS admin library installed
- SCSS support enabled in your Angular project
- Tailwind CSS v4 configured (for layout primitives only)

## Step 1: Install Lucide Icons

Install the lucide-angular package:

```bash
pnpm install lucide-angular
```

## Step 2: Add Lucide Script to index.html

Add the Lucide script tag to your app's `index.html` (in the `<head>` section):

```html
<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest"></script>
```

## Step 3: Import Vertex Theme

Import the Vertex theme SCSS in your global styles file or in the Angular configuration:

### Option A: Import in styles.scss

```scss
// Import Vertex CMS theme
@import '@vertex-admin/vertex-theme.scss';
```

### Option B: Add to angular.json

Add to the `styles` array in `angular.json`:

```json
{
  "styles": [
    "node_modules/vertex-admin/vertex-theme.scss",
    "apps/your-app/src/styles.scss"
  ]
}
```

## Step 4: Tailwind 

Ensure Tailwind primitives for layout are bundled into your application.

## Step 5: Theme Initialization (Optional)

To enable theme persistence and initialization on app load, add this to your root component:

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  // ...
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // Load saved theme
    const savedTheme = localStorage.getItem('vertex-theme');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    }
    
    // Initialize Lucide icons
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons({ nameAttr: 'data-lucide' });
    }
  }
}
```

## Available Components

The Vertex design system includes the following components:

- `<vertex-button>` - Button with mechanical press effect
- `<vertex-card>` - Card with optional title/icon header
- `<vertex-input>` - Form input with label
- `<vertex-badge>` - Status badges (draft/published/archived)
- `<vertex-breadcrumb>` - Breadcrumb navigation
- `<vertex-theme-toggle>` - Light/dark theme toggle
- `<vertex-logo>` - Vertex CMS logo

### Example Usage

```html
<vertex-card [title]="'User Settings'" [icon]="'settings'">
  <vertex-input [label]="'Email'" [type]="'email'" formControlName="email"></vertex-input>
  
  <div class="flex gap-2 mt-4">
    <vertex-button>Cancel</vertex-button>
    <vertex-button [variant]="'primary'" [icon]="'save'">Save</vertex-button>
  </div>
</vertex-card>
```

## CSS Classes

Global CSS classes are available for direct use:

- `.v-card` - Card wrapper
- `.v-btn` / `.v-btn.primary` - Button styles
- `.v-input` / `.v-input-group` - Input styles
- `.v-table` - Data table
- `.v-badge` - Badge/status
- `.v-nav-item` - Navigation item
- `.v-breadcrumb` - Breadcrumb container
- `.bg-grid-pattern` - Grid texture background
- `.font-mono` - Monospace font utility

## Theming

The design system supports light and dark themes via the `data-theme` attribute:

- **Light (default)**: No attribute needed
- **Dark**: Add `data-theme="dark"` to `<body>`

Theme colors are controlled by CSS custom properties defined in `_tokens.scss`.

## Typography

- **UI Text**: General Sans (400, 500, 600, 700)
- **Code/Technical**: JetBrains Mono (400, 500, 700)

Fonts are loaded via Google Fonts API in `fonts.css`.

## Support

For issues or questions, refer to the Vertex CMS documentation or create an issue in the repository.
