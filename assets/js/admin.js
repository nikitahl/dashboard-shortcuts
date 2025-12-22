/**
 * WP Dashboard Shortcuts - Admin settings page scripts
 *
 * @package WP_Dashboard_Shortcuts
 */

(function($) {
  'use strict';

  /**
   * Initialize the settings page functionality.
   */
  function init() {
    var $container = $('#wds-shortcuts-container');
    var $addButton = $('#wds-add-shortcut');

    // Initialize sortable functionality.
    initSortable();

    // Add new shortcut row.
    $addButton.on('click', function() {
      var index = $container.find('.wds-shortcut-row').length;
      var $newRow = createShortcutRow(index);
      $container.append($newRow);
    });

    // Remove shortcut row.
    $container.on('click', '.wds-remove-shortcut', function() {
      var $row = $(this).closest('.wds-shortcut-row');
      var $allRows = $container.find('.wds-shortcut-row');

      // Confirm deletion.
      if (!confirm(wdsSettings.confirmDelete || 'Are you sure you want to remove this shortcut?')) {
        return;
      }

      // Keep at least one row.
      if ($allRows.length === 1) {
        // Clear the fields instead of removing.
        $row.find('input[type="text"], input[type="url"]').val('');
        $row.find('input[type="checkbox"]').prop('checked', false);
        return;
      }

      $row.fadeOut(300, function() {
        $(this).remove();
        reindexRows();
      });
    });
  }

  /**
   * Initialize jQuery UI Sortable.
   */
  function initSortable() {
    var $container = $('#wds-shortcuts-container');

    $container.sortable({
      handle: '.wds-drag-handle',
      placeholder: 'wds-shortcut-placeholder',
      axis: 'y',
      cursor: 'move',
      opacity: 0.7,
      tolerance: 'pointer',
      start: function(event, ui) {
        ui.placeholder.height(ui.item.height());
        ui.item.addClass('wds-sorting');
      },
      stop: function(event, ui) {
        ui.item.removeClass('wds-sorting');
        reindexRows();
      }
    });
  }

  /**
   * Create a new shortcut row.
   *
   * @param {number} index Row index.
   * @return {jQuery} New row element.
   */
  function createShortcutRow(index) {
    var $row = $('<div>', {
      class: 'wds-shortcut-row',
      'data-index': index,
      style: 'display: none;'
    });

    // Drag handle.
    var $dragHandle = $('<div>', {
      class: 'wds-drag-handle',
      title: 'Drag to reorder'
    });
    var $dragIcon = $('<span>', { class: 'dashicons dashicons-menu' });
    $dragHandle.append($dragIcon);

    var $fields = $('<div>', { class: 'wds-shortcut-fields' });

    // Title field.
    var $titleField = $('<div>', { class: 'wds-field' });
    var $titleLabel = $('<label>').text(wdsSettings.titleLabel || 'Title');
    var $titleInput = $('<input>', {
      type: 'text',
      name: 'wds_shortcuts[' + index + '][title]',
      placeholder: wdsSettings.titlePlaceholder || 'e.g., My Site',
      class: 'regular-text'
    });
    $titleLabel.append($titleInput);
    $titleField.append($titleLabel);

    // URL field.
    var $urlField = $('<div>', { class: 'wds-field' });
    var $urlLabel = $('<label>').text(wdsSettings.urlLabel || 'URL');
    var $urlInput = $('<input>', {
      type: 'url',
      name: 'wds_shortcuts[' + index + '][url]',
      placeholder: wdsSettings.urlPlaceholder || 'https://example.com',
      class: 'regular-text'
    });
    $urlLabel.append($urlInput);
    $urlField.append($urlLabel);

    // New tab checkbox.
    var $checkboxField = $('<div>', { class: 'wds-field wds-field-checkbox' });
    var $checkboxLabel = $('<label>');
    var $checkbox = $('<input>', {
      type: 'checkbox',
      name: 'wds_shortcuts[' + index + '][new_tab]'
    });
    $checkboxLabel.append($checkbox);
    $checkboxLabel.append(wdsSettings.newTabLabel || 'Open in new tab');
    $checkboxField.append($checkboxLabel);

    // Remove button.
    var $actionsField = $('<div>', { class: 'wds-field wds-field-actions' });
    var $removeButton = $('<button>', {
      type: 'button',
      class: 'button wds-remove-shortcut',
      'aria-label': wdsSettings.removeLabel || 'Remove shortcut'
    });
    var $removeIcon = $('<span>', { class: 'dashicons dashicons-trash' });
    $removeButton.append($removeIcon);
    $actionsField.append($removeButton);

    // Assemble the row.
    $fields.append($titleField);
    $fields.append($urlField);
    $fields.append($checkboxField);
    $fields.append($actionsField);
    $row.append($dragHandle);
    $row.append($fields);

    $row.fadeIn(300);

    return $row;
  }

  /**
   * Reindex all rows after deletion or sorting.
   */
  function reindexRows() {
    var $rows = $('#wds-shortcuts-container .wds-shortcut-row');

    $rows.each(function(index) {
      var $row = $(this);
      $row.attr('data-index', index);

      $row.find('input').each(function() {
        var $input = $(this);
        var name = $input.attr('name');

        if (name) {
          // Replace the index in the name attribute.
          var newName = name.replace(/\[\d+\]/, '[' + index + ']');
          $input.attr('name', newName);
        }
      });
    });
  }

  // Initialize on document ready.
  $(document).ready(function() {
    init();
  });

})(jQuery);
