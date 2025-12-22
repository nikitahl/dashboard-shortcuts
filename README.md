# WP Dashboard Shortcuts

A WordPress plugin that adds a HUD menu bar under the admin bar to display custom shortcut links configured in the settings page.

## Description

WP Dashboard Shortcuts provides a convenient way to access your frequently used links directly from the WordPress admin bar. Perfect for developers, site administrators, and content managers who need quick access to external tools, documentation, or other websites.

## Features

- **Custom Shortcut Links**: Add unlimited custom links with titles and URLs
- **Admin Bar Integration**: Shortcuts appear in a dropdown menu in the WordPress admin bar
- **New Tab Option**: Choose whether links open in the same tab or a new tab
- **Easy Management**: Simple settings interface to add, edit, and remove shortcuts
- **Clean UI**: Modern, responsive design that matches WordPress admin styling
- **WordPress Standards**: Follows WordPress coding standards and best practices

## Installation

1. Download the plugin files
2. Upload the `wp-dashboard-shortcuts` folder to `/wp-content/plugins/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Navigate to **Settings > Dashboard Shortcuts** to configure your shortcuts

## Usage

### Adding Shortcuts

1. Go to **Settings > Dashboard Shortcuts** in your WordPress admin
2. Click the **Add Shortcut** button
3. Enter a title for your shortcut (e.g., "Google Analytics")
4. Enter the URL (e.g., "https://analytics.google.com")
5. Optionally, check "Open in new tab" if you want the link to open in a new browser tab
6. Click **Save Shortcuts**

### Viewing Shortcuts

Once configured, your shortcuts will appear in the WordPress admin bar under a "Shortcuts" menu (marked with a star icon). The menu is visible to all users with the `manage_options` capability (typically administrators).

### Managing Shortcuts

- **Edit**: Simply change the values in the settings page and save
- **Remove**: Click the trash icon next to any shortcut to remove it
- **Reorder**: The shortcuts appear in the order they're listed in the settings

## Requirements

- WordPress 6.4 or higher
- PHP 7.0 or higher

## Frequently Asked Questions

### Who can see the shortcuts?

Currently, only users with the `manage_options` capability (administrators) can see and use the shortcuts.

### Can I add shortcuts to external websites?

Yes! You can add any valid URL, including external websites, documentation, tools, or internal WordPress pages.

### How many shortcuts can I add?

There's no hard limit, but we recommend keeping it reasonable (10-15 shortcuts) for the best user experience.

## Development

This plugin follows WordPress coding standards and best practices.

### File Structure

```
wp-dashboard-shortcuts/
├── wp-dashboard-shortcuts.php   # Main plugin file
├── includes/
│   └── class-wds-shortcuts.php  # Shortcuts handler class
├── admin/
│   └── class-wds-settings.php   # Settings page class
└── assets/
    ├── css/
    │   ├── shortcuts.css        # Frontend styles
    │   └── admin.css            # Admin styles
    └── js/
        └── admin.js             # Admin JavaScript
```

### Hooks and Filters

The plugin uses standard WordPress hooks:
- `admin_bar_menu` - Adds shortcuts to the admin bar
- `admin_menu` - Registers the settings page
- `admin_init` - Registers settings
- `admin_enqueue_scripts` - Loads admin assets
- `wp_enqueue_scripts` - Loads frontend assets

## License

This plugin is licensed under the GPLv3 or later.

## Author

**Nikita Hlopov**  
Website: [https://nikitahl.com](https://nikitahl.com)  
GitHub: [https://github.com/nikitahl/wp-dashboard-shortcuts](https://github.com/nikitahl/wp-dashboard-shortcuts)

## Changelog

### 1.0.0
- Initial release
- Add custom shortcuts to admin bar
- Settings page for managing shortcuts
- Open links in new tab option
