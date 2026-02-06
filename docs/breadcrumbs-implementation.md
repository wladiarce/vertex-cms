# Breadcrumbs Navigation Implementation

## Overview
This document describes the implementation of automatic breadcrumb navigation in the Vertex CMS admin panel.

## Architecture

### 1. **BreadcrumbsService** (`breadcrumbs.service.ts`)
The service is the core of the breadcrumb system:

- **Router Event Listening**: Subscribes to Angular Router's `NavigationEnd` events
- **Automatic Breadcrumb Building**: Recursively traverses the activated route tree to build breadcrumb items
- **Route Data Integration**: Reads `breadcrumb` data from route configuration
- **Dynamic Label Resolution**: 
  - Supports static string labels
  - Supports function-based labels for dynamic content
  - Interpolates route parameters (e.g., `:slug`, `:id`)
  - Resolves collection slugs to proper display names using `VertexClientService`
- **Signal-Based**: Uses Angular signals for reactive updates

### 2. **Route Configuration** (`admin.routes.ts`)
Routes are configured with breadcrumb metadata in their `data` property:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  data: {
    breadcrumb: {
      label: 'Dashboard'
    }
  }
}
```

For dynamic routes with parameters:
```typescript
{
  path: 'collections/:slug',
  component: CollectionListComponent,
  data: {
    breadcrumb: {
      label: ':slug'  // Will be resolved to collection's display name
    }
  }
}
```

### 3. **VertexBreadcrumbComponent** (`vertex-breadcrumb.component.ts`)
The UI component that renders breadcrumbs:

- **Service Integration**: Injects `BreadcrumbsService` and reads its signal
- **Automatic Updates**: Uses Angular `effect()` to re-initialize Lucide icons when breadcrumbs change
- **Navigation Support**: Uses `routerLink` for clickable breadcrumb items
- **Visual Hierarchy**: Current (last) breadcrumb is styled differently and not clickable

### 4. **Admin Layout Integration** (`admin-layout.component.html`)
The breadcrumb component is placed in the header bar:

```html
<div class="h-16 border-b border-[var(--border-dim)] bg-[var(--bg-surface)] flex items-center justify-between px-6 md:px-8">
  <vertex-breadcrumb></vertex-breadcrumb>
</div>
```

## Features

### ✅ Automatic Breadcrumb Generation
- Breadcrumbs are automatically generated based on the current route
- No manual breadcrumb management required in components

### ✅ Route Parameter Interpolation
- Supports `:paramName` and `{paramName}` syntax in labels
- Parameters are automatically replaced with actual values from the route

### ✅ Collection Name Resolution
- Collection slugs (e.g., `articles`) are resolved to their proper display names
- Uses `pluralName`, `singularName`, or falls back to capitalized slug
- Example: `articles` → "Articles" or "Blog Posts" (based on configuration)

### ✅ Reactive Updates
- Uses Angular signals for efficient, reactive updates
- Icons are automatically re-initialized when breadcrumbs change

### ✅ Flexible Configuration
- Static labels: `{ label: 'Dashboard' }`
- Dynamic labels: `{ label: (snapshot) => computeLabel(snapshot) }`
- Parameter-based labels: `{ label: ':slug' }`

## Usage Examples

### Adding Breadcrumbs to a New Route
Simply add the `breadcrumb` data to your route definition:

```typescript
{
  path: 'settings',
  component: SettingsComponent,
  data: {
    breadcrumb: {
      label: 'Settings'
    }
  }
}
```

### Nested Routes with Breadcrumbs
Breadcrumbs automatically build a trail from parent to child routes:

```typescript
{
  path: 'collections/:slug',
  data: { breadcrumb: { label: ':slug' } },
  children: [
    {
      path: 'edit/:id',
      component: EditComponent,
      data: { breadcrumb: { label: 'Edit' } }
    }
  ]
}
```

Result: `Articles > Edit`

### Dynamic Breadcrumb Labels
For complex scenarios, use a function:

```typescript
data: {
  breadcrumb: {
    label: (snapshot) => {
      const id = snapshot.params['id'];
      return id === 'new' ? 'Create New' : 'Edit';
    }
  }
}
```

### Manual Breadcrumb Override
In special cases, you can manually set breadcrumbs in a component:

```typescript
constructor(private breadcrumbsService: BreadcrumbsService) {
  this.breadcrumbsService.setBreadcrumbs([
    { label: 'Home', route: '/admin' },
    { label: 'Custom Page' }
  ]);
}
```

## Current Breadcrumb Structure

### Dashboard
- `Dashboard`

### Media Library
- `Media Library`

### Collection List
- `Articles` (or configured collection name)

### Collection Create
- `Articles` > `Create New`

### Collection Edit
- `Articles` > `Edit`

## Future Enhancements

### Potential Improvements:
1. **Document Title Integration**: Show document title instead of generic "Edit"
2. **Icon Support**: Add icons to breadcrumb items from route data
3. **Breadcrumb Separator Customization**: Allow custom separators via configuration
4. **Skip Levels**: Add option to hide certain breadcrumb levels
5. **Breadcrumb Actions**: Add dropdown menus or actions to breadcrumb items
6. **SEO Integration**: Generate structured data breadcrumb markup
7. **Accessibility**: Add ARIA labels and landmarks

### Example - Document Title in Breadcrumbs:
```typescript
// In CollectionEditComponent
ngOnInit() {
  this.documentService.currentDocument$.subscribe(doc => {
    if (doc) {
      this.breadcrumbsService.addBreadcrumb({
        label: doc.title || 'Untitled'
      });
    }
  });
}
```

## Technical Notes

### Why Signals?
- **Performance**: Signals provide efficient reactivity without unnecessary change detection cycles
- **Simplicity**: No need for manual subscription management
- **Modern Angular**: Aligns with Angular's future direction

### Why Service-Based?
- **Separation of Concerns**: Logic separated from UI
- **Testability**: Service can be easily tested in isolation
- **Reusability**: Same service can power multiple breadcrumb displays
- **Centralized State**: Single source of truth for breadcrumb state

### Route Data vs Component-Based
We chose route data over component-based breadcrumbs because:
- **Declarative**: Breadcrumbs defined alongside routes
- **Automatic**: No boilerplate code in components
- **Consistent**: Enforces a standard approach
- **Lazy Loading**: Works seamlessly with lazy-loaded modules

## Conclusion

The breadcrumb system provides automatic, flexible navigation tracking throughout the admin panel. It leverages Angular's routing system and modern reactive patterns to deliver a seamless user experience with minimal configuration overhead.
