# Visibility Toggler - SPFx Application Customizer

A SharePoint Framework Application Customizer that provides a draggable floating action button (FAB) to toggle the visibility of SharePoint interface elements.

## Features

- **Draggable FAB**: Floating action button that can be positioned anywhere on the page
- **Persistent Position**: FAB position is saved per site in localStorage
- **Settings Persistence**: Visibility settings are saved to Site Assets/visibilityToggler.json
- **Cross-Navigation Support**: Settings persist across page navigations
- **DOM Change Resilience**: Uses MutationObserver to re-apply settings after DOM changes
- **Accessibility**: Full keyboard navigation and ARIA support
- **Responsive Design**: Works on desktop and mobile devices

## Target Elements

The extension can toggle visibility of:

1. **Site Header** - Top navigation bar
2. **Command Bar** - Action buttons bar
3. **Left Navigation** - Side navigation menu
4. **Breadcrumb** - Navigation breadcrumb
5. **Page Header** - Page title and metadata

## Installation

1. Build the solution:
   ```bash
   gulp build
   ```

2. Bundle the solution:
   ```bash
   gulp bundle --ship
   ```

3. Package the solution:
   ```bash
   gulp package-solution --ship
   ```

4. Upload the generated `.sppkg` file from the `sharepoint/solution` folder to your SharePoint App Catalog

5. Deploy the solution to your target site

## Usage

1. Navigate to any page in your SharePoint site
2. Look for the floating blue settings button (FAB) in the bottom-right area
3. Click the FAB to open the visibility settings dialog
4. Toggle elements on/off as needed
5. Click "Save Settings" to persist changes site-wide
6. Drag the FAB to reposition it - position is automatically saved

## Configuration

### Feature Flag
To disable the extension, add `VT_DISABLE` to the URL query string:
```
https://yoursite.sharepoint.com/sites/yoursite?VT_DISABLE
```

### Customization
Edit the `TARGET_SELECTORS` array in `src/models/IVisibilitySettings.ts` to add or modify target elements.

## Manual Test Checklist

### Basic Functionality
- [ ] **FAB Visibility**: FAB appears on home page, list pages, library pages, and settings pages
- [ ] **FAB Interaction**: Clicking FAB opens settings dialog
- [ ] **Dialog Functionality**: All toggles work correctly in the dialog
- [ ] **Settings Persistence**: Changes are saved and persist after page refresh

### Position Persistence
- [ ] **Drag FAB**: FAB can be dragged to different positions
- [ ] **Position Clamping**: FAB stays within viewport boundaries
- [ ] **Position Save**: FAB position persists after page refresh
- [ ] **Cross-Navigation**: FAB position persists when navigating between pages (without full reload)

### Settings Persistence
- [ ] **Site-Wide Settings**: Toggle settings apply to all users on the site
- [ ] **Cross-Browser**: Settings persist when opened in different browsers
- [ ] **Navigation Persistence**: Settings persist across page navigations within the site
- [ ] **Default State**: New sites start with all elements visible

### DOM Resilience
- [ ] **List View Changes**: Settings re-apply when switching between list views
- [ ] **Panel Operations**: Settings re-apply when opening/closing panels
- [ ] **Folder Navigation**: Settings re-apply when navigating folders
- [ ] **Dynamic Content**: Settings re-apply when SharePoint loads dynamic content

### User Permissions
- [ ] **Read-Only Users**: Read-only users can apply settings (session-only)
- [ ] **Save Graceful Failure**: Save failures are handled gracefully without breaking functionality
- [ ] **Admin Users**: Users with write permissions can save settings permanently

### Accessibility
- [ ] **Keyboard Navigation**: Dialog can be navigated entirely with keyboard
- [ ] **Focus Trap**: Focus stays within dialog when open
- [ ] **Escape Key**: ESC key closes the dialog
- [ ] **FAB Keyboard**: FAB can be activated with Enter/Space keys
- [ ] **ARIA Labels**: All controls have proper ARIA labels

### Performance
- [ ] **Fast Loading**: Extension loads quickly without impacting page performance
- [ ] **Memory Management**: No memory leaks during extended usage
- [ ] **Debounced Updates**: DOM changes are handled efficiently with debouncing

### Edge Cases
- [ ] **Missing Elements**: Graceful handling when target elements don't exist
- [ ] **Network Issues**: Extension works offline for position settings
- [ ] **Browser Compatibility**: Works in supported SharePoint browsers
- [ ] **Mobile Devices**: FAB is usable on mobile devices

## Troubleshooting

### FAB Not Appearing
1. Check browser console for errors
2. Verify extension is deployed and activated
3. Check if `VT_DISABLE` is in the URL
4. Ensure user has appropriate permissions

### Settings Not Saving
1. Verify user has write permissions to Site Assets
2. Check browser console for API errors
3. Verify Site Assets library exists and is accessible

### Elements Not Hiding/Showing
1. Check browser console for selector errors
2. Verify target elements exist on the current page
3. Check if elements have been modified by other extensions

## Development

### Project Structure
```
src/
├── extensions/visiblitySpfx/          # Main Application Customizer
├── components/                        # React components
│   ├── Fab.tsx                       # Draggable FAB component
│   ├── VisibilityDialog.tsx          # Settings dialog
│   └── VisibilityTogglerApp.tsx      # Main React app
├── models/                           # TypeScript interfaces
│   └── IVisibilitySettings.ts        # Data models and selectors
└── services/                         # Business logic
    ├── PersistenceService.ts         # Data persistence
    └── VisibilityManager.ts          # Element visibility management
```

### Key Technologies
- **SharePoint Framework 1.21.1**
- **React 18.2.0**
- **Fluent UI React 8.129.0**
- **TypeScript 5.3.3**

## License

This project is licensed under the MIT License.