# ClipMaster

A modern clipboard manager built with React + TypeScript + Vite and Electron.

## ⚠️ CRITICAL: Layout Guidelines

### DO NOT MODIFY These Width Settings

The following layout settings are crucial for the application's proper functioning and **MUST NOT BE MODIFIED**:

```tsx
// Root container
<Box 
  w="100vw"
  maxW="100vw"
  overflowX="hidden"
>

// Main HStack container
<HStack 
  w="100%"
  maxW="100%"
  mx="0"
>

// Left Section
<Box 
  flex={{ base: '1 1 100%', md: '2 0 0' }}
  minW="0"
  w="100%"
>

// Right Section
<Box
  flex={{ base: '1 1 100%', md: '1 0 0' }}
  minW="0"
  w="100%"
>
```

These settings ensure that:
- The application always fills exactly the screen width
- The left and right sections maintain a perfect 2:1 ratio on desktop
- No horizontal scrollbars appear
- Content is properly contained within each section

⚠️ **WARNING**: Modifying these width settings may break the layout and cause unwanted horizontal scrollbars. If you need to make layout changes, work around these core width settings.

## Development Guidelines

When making changes to the application:

1. **DO NOT MODIFY**:
   - The width settings of the main containers
   - The flex settings that maintain the 2:1 ratio
   - The overflow and minWidth settings

2. **SAFE TO MODIFY**:
   - Internal content layout
   - Padding and margins (except `mx="0"` on the main HStack)
   - Colors, typography, and other visual styles
   - Component functionality

Remember: The layout is designed to be exactly screen-width with proper section ratios. Any changes should preserve this behavior.

## Technical Details

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
