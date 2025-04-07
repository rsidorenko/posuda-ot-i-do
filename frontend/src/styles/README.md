# Responsive Styles Structure

This directory contains the styles for the application, organized in a responsive way with separate desktop and mobile styles.

## Directory Structure

```
styles/
├── desktop/              # Desktop-specific styles
│   ├── components/      # Desktop component styles
│   └── pages/          # Desktop page styles
├── mobile/              # Mobile-specific styles
│   ├── components/     # Mobile component styles
│   └── pages/         # Mobile page styles
├── _variables.scss     # Shared variables
└── main.scss          # Main styles file with imports
```

## How It Works

1. The `main.scss` file imports both desktop and mobile styles
2. Desktop styles are loaded by default
3. Mobile styles are loaded through a media query for screens smaller than 768px
4. Each component and page has its own style file in both desktop and mobile directories

## Adding New Styles

1. Create your style file in both `desktop/components/` and `mobile/components/` for components
2. Create your style file in both `desktop/pages/` and `mobile/pages/` for pages
3. Import the new files in the respective `desktop.scss` and `mobile.scss` files

## Best Practices

1. Keep shared variables in `_variables.scss`
2. Use relative units (rem, em) for better scaling
3. Test both desktop and mobile versions
4. Keep mobile styles optimized for touch interactions
5. Use flexbox and grid for responsive layouts

## Media Queries

The breakpoint for mobile devices is set at 768px. This can be adjusted in `main.scss` if needed.

## Usage Example

```scss
// In your component
import styles from './styles/desktop/components/YourComponent.scss';
// The mobile styles will be automatically applied when the screen width is below 768px
``` 