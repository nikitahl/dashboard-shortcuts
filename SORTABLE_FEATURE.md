# Sortable Shortcuts Feature

## Overview
The shortcuts in the settings page are now fully sortable via drag and drop.

## What Was Changed

### 1. PHP Settings Page (`admin/class-wds-settings.php`)
- Added jQuery UI Sortable as a dependency to the admin script
- Added a drag handle element to each shortcut row with a menu icon (dashicons-menu)
- The drag handle appears on the left side of each shortcut row

### 2. JavaScript (`assets/js/admin.js`)
- Added `initSortable()` function that initializes jQuery UI Sortable on the shortcuts container
- Configuration:
  - **Handle**: `.wds-drag-handle` - Only the drag handle can be used to drag rows
  - **Axis**: `y` - Restricts dragging to vertical movement only
  - **Placeholder**: Shows a dashed placeholder where the item will be dropped
  - **Opacity**: 0.7 - Makes the dragged item semi-transparent
- The `reindexRows()` function now runs after sorting to update all field names with proper indices
- New rows created dynamically also include the drag handle

### 3. CSS Styles (`assets/css/admin.css`)
- Added `.wds-drag-handle` styles with menu icon, cursor pointer, and hover effects
- Added `.wds-sorting` class for visual feedback while dragging
- Added `.wds-shortcut-placeholder` styles for the drop zone indicator
- Updated `.wds-shortcut-row` to use flexbox layout to accommodate the drag handle
- Made the interface responsive on mobile devices

## How It Works

1. **Visual Indicator**: Each shortcut row now has a drag handle (☰ icon) on the left side
2. **Drag to Reorder**: Users can click and hold the drag handle to drag rows up or down
3. **Visual Feedback**: While dragging, the row becomes semi-transparent and a placeholder shows where it will be dropped
4. **Auto-Reindex**: After dropping, all field names are automatically updated to maintain proper form submission order
5. **Save Order**: When the form is submitted, shortcuts are saved in the new order

## User Experience

- Hover over the drag handle to see it change color (blue)
- Drag handles are only active on the handle itself, not the entire row
- The cursor changes to "move" when hovering over the handle
- Smooth animations make the sorting feel natural
- Works on both desktop and mobile devices

