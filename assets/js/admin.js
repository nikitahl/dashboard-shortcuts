/**
 * Dashboard Shortcuts - Admin settings page scripts
 *
 * @package Dashboard_Shortcuts
 */

import '../css/admin.css'
(($) => {
  'use strict'
  const { wdsSettings, wpApiSettings } = window

  /**
   * Initialize the settings page functionality.
   */
  const init = () => {
    const $container = $('#wds-shortcuts-container')
    const $addButton = $('#wds-add-shortcut')

    initSortable()
    initLinkPicker()

    // Add new shortcut row.
    $addButton.on('click', () => {
      const index = $container.find('.wds-shortcut-row').length
      const $newRow = createShortcutRow(index)
      $container.append($newRow)
    })

    // Remove shortcut row.
    $container.on('click', '.wds-remove-shortcut', function () {
      const $row = $(this).closest('.wds-shortcut-row')
      const $allRows = $container.find('.wds-shortcut-row')

      // Confirm deletion.
      if (!confirm(wdsSettings.confirmDelete || 'Are you sure you want to remove this shortcut?')) {
        return
      }

      // Keep at least one row.
      if ($allRows.length === 1) {
        // Clear the fields instead of removing.
        $row.find('input[type="text"], input[type="url"]').val('')
        $row.find('input[type="checkbox"]').prop('checked', false)
        return
      }

      $row.fadeOut(300, function () {
        $(this).remove()
        reindexRows()
      })
    })
  }

  /**
   * Initialize jQuery UI Sortable.
   */
  const initSortable = () => {
    const $container = $('#wds-shortcuts-container')

    $container.sortable({
      handle: '.wds-drag-handle',
      placeholder: 'wds-shortcut-placeholder',
      axis: 'y',
      cursor: 'move',
      opacity: 0.7,
      tolerance: 'pointer',
      start: (event, ui) => {
        ui.placeholder.height(ui.item.height())
        ui.item.addClass('wds-sorting')
      },
      stop: (event, ui) => {
        ui.item.removeClass('wds-sorting')
        reindexRows()
      }
    })
  }

  /**
   * Initialize WordPress link picker functionality.
   */
  const initLinkPicker = () => {
    const $container = $('#wds-shortcuts-container')

    // Handle click on URL selector button.
    $container.on('click', '.wds-select-url', function (e) {
      e.preventDefault()
      const $currentInput = $(this).siblings('.wds-url-input')

      // Create and show custom link selector modal
      showLinkSelectorModal($currentInput)

      return false
    })
  }

  /**
   * Show custom link selector modal.
   *
   * @param {jQuery} $input The input field to populate.
   */
  const showLinkSelectorModal = ($input) => {
    const $modal = $('#wds-link-modal')

    // Create modal if it doesn't exist
    if ($modal.length === 0) {
      createLinkModal()
    }

    const $urlInput = $('#wds-modal-url')
    const $searchInput = $('#wds-modal-search')
    const $results = $('#wds-modal-results')

    // Set current URL
    $urlInput.val($input.val())

    // Clear previous search
    $searchInput.val('')
    $results.html('')

    // Show modal
    $modal.show()
    $('body').addClass('modal-open')

    // Focus on URL input
    $urlInput.focus()

    // Handle search
    let searchTimeout
    $searchInput.off('input').on('input', function () {
      clearTimeout(searchTimeout)
      const query = $(this).val()

      if (query.length < 2) {
        $results.html('')
        return
      }

      searchTimeout = setTimeout(() => {
        searchContent(query, $results, $urlInput)
      }, 300)
    })

    // Handle insert button
    $('#wds-modal-insert').off('click').on('click', () => {
      const url = $urlInput.val()
      if (url) {
        $input.val(url)
      }
      closeLinkModal()
    })

    // Handle cancel button
    $('#wds-modal-cancel').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle close button (X icon)
    $('#wds-modal-close-btn').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle backdrop click
    $modal.off('click').on('click', (e) => {
      if ($(e.target).hasClass('wds-modal-backdrop')) {
        closeLinkModal()
      }
    })
  }

  /**
   * Create link selector modal HTML.
   */
  const createLinkModal = () => {
    const modalHtml =
      '<div id="wds-link-modal" class="wds-modal-backdrop" style="display:none">' +
      '<div class="wds-modal">' +
      '<div class="wds-modal-header">' +
      '<h2>Insert/Edit Link</h2>' +
      '<button type="button" class="wds-modal-close" id="wds-modal-close-btn">' +
      '<span class="dashicons dashicons-no"></span>' +
      '</button>' +
      '</div>' +
      '<div class="wds-modal-body">' +
      '<div class="wds-modal-field">' +
      '<label for="wds-modal-url">URL</label>' +
      '<input type="text" id="wds-modal-url" class="regular-text" placeholder="https://example.com" />' +
      '</div>' +
      '<div class="wds-modal-field">' +
      '<label for="wds-modal-search">Or search for existing content</label>' +
      '<input type="text" id="wds-modal-search" class="regular-text" placeholder="Search pages, posts..." />' +
      '</div>' +
      '<div id="wds-modal-results" class="wds-modal-results"></div>' +
      '</div>' +
      '<div class="wds-modal-footer">' +
      '<button type="button" class="button button-secondary" id="wds-modal-cancel">Cancel</button>' +
      '<button type="button" class="button button-primary" id="wds-modal-insert">Insert Link</button>' +
      '</div>' +
      '</div>' +
      '</div>'

    $('body').append(modalHtml)
  }

  /**
   * Close link selector modal.
   */
  const closeLinkModal = () => {
    $('#wds-link-modal').hide()
    $('body').removeClass('modal-open')
  }

  /**
   * Search for WordPress content.
   *
   * @param {string} query Search query.
   * @param {jQuery} $results Results container.
   * @param {jQuery} $urlInput URL input field.
   */
  const searchContent = (query, $results, $urlInput) => {
    $results.html('<div class="wds-modal-loading">Searching...</div>')

    // Use wpApiSettings if available, otherwise construct URL
    const restUrl = wpApiSettings ? wpApiSettings.root : '/wp-json/'
    const searchUrl = `${restUrl}wp/v2/search`

    $.ajax({
      url: searchUrl,
      data: {
        search: query,
        per_page: 10,
        _wpnonce: wpApiSettings ? wpApiSettings.nonce : ''
      },
      success: (items) => {
        if (!items || items.length === 0) {
          $results.html('<div class="wds-modal-no-results">No results found</div>')
          return
        }

        let html = '<ul class="wds-modal-results-list">'
        $.each(items, (i, item) => {
          html += `<li class="wds-modal-result-item" data-url="${item.url}">` +
            `<strong>${item.title}</strong>` +
            `<span class="wds-modal-result-type">${item.subtype}</span>` +
            '</li>'
        })
        html += '</ul>'

        $results.html(html)

        // Handle result click
        $('.wds-modal-result-item').on('click', function () {
          const url = $(this).data('url')
          $urlInput.val(url)
          $('.wds-modal-result-item').removeClass('selected')
          $(this).addClass('selected')
        })
      },
      error: (xhr, status, error) => {
        console.error('Search error:', xhr.status, error)
        $results.html('<div class="wds-modal-error">Error searching content. Please check your WordPress REST API is enabled.</div>')
      }
    })
  }

  /**
   * Create a new shortcut row.
   *
   * @param {number} index Row index.
   * @return {jQuery} New row element.
   */
  const createShortcutRow = (index) => {
    const $row = $('<div>', {
      class: 'wds-shortcut-row',
      'data-index': index,
      style: 'display: none'
    })

    // Drag handle.
    const $dragHandle = $('<div>', {
      class: 'wds-drag-handle',
      title: 'Drag to reorder'
    })
    const $dragIcon = $('<span>', { class: 'dashicons dashicons-menu' })
    $dragHandle.append($dragIcon)

    const $fields = $('<div>', { class: 'wds-shortcut-fields' })

    // Title field.
    const $titleField = $('<div>', { class: 'wds-field' })
    const $titleLabel = $('<label>').text(wdsSettings.titleLabel || 'Title')
    const $titleInput = $('<input>', {
      type: 'text',
      name: `wds_shortcuts[${index}][title]`,
      placeholder: wdsSettings.titlePlaceholder || 'e.g., My Site',
      class: 'regular-text'
    })
    $titleLabel.append($titleInput)
    $titleField.append($titleLabel)

    // URL field.
    const $urlField = $('<div>', { class: 'wds-field wds-field-url' })
    const $urlLabel = $('<label>').text(wdsSettings.urlLabel || 'URL')
    const $urlWrapper = $('<div>', { class: 'wds-url-input-wrapper' })
    const $urlInput = $('<input>', {
      type: 'text',
      name: `wds_shortcuts[${index}][url]`,
      placeholder: wdsSettings.urlPlaceholder || 'https://example.com',
      class: 'regular-text wds-url-input'
    })
    const $urlButton = $('<button>', {
      type: 'button',
      class: 'button wds-select-url',
      title: 'Select from WordPress'
    }).append($('<span>', { class: 'dashicons dashicons-admin-links' }))
    $urlWrapper.append($urlInput)
    $urlWrapper.append($urlButton)
    $urlLabel.append($urlWrapper)
    $urlField.append($urlLabel)

    // New tab checkbox.
    const $checkboxField = $('<div>', { class: 'wds-field wds-field-checkbox' })
    const $checkboxLabel = $('<label>')
    const $checkbox = $('<input>', {
      type: 'checkbox',
      name: `wds_shortcuts[${index}][new_tab]`
    })
    $checkboxLabel.append($checkbox)
    $checkboxLabel.append(wdsSettings.newTabLabel || 'Open in new tab')
    $checkboxField.append($checkboxLabel)

    // Remove button.
    const $actionsField = $('<div>', { class: 'wds-field wds-field-actions' })
    const $removeButton = $('<button>', {
      type: 'button',
      class: 'button wds-remove-shortcut',
      'aria-label': wdsSettings.removeLabel || 'Remove shortcut'
    })
    const $removeIcon = $('<span>', { class: 'dashicons dashicons-trash' })
    $removeButton.append($removeIcon)
    $actionsField.append($removeButton)

    // Assemble the row.
    $fields.append($titleField)
    $fields.append($urlField)
    $fields.append($checkboxField)
    $fields.append($actionsField)
    $row.append($dragHandle)
    $row.append($fields)

    $row.fadeIn(300)

    return $row
  }

  /**
   * Reindex all rows after deletion or sorting.
   */
  const reindexRows = () => {
    const $rows = $('#wds-shortcuts-container .wds-shortcut-row')

    $rows.each(function (index) {
      const $row = $(this)
      $row.attr('data-index', index)

      // Only find input elements with type text or checkbox
      $row.find('input[type="text"], input[type="checkbox"]').each(function () {
        const $input = $(this)
        const name = $input.attr('name')

        if (name && name.indexOf('wds_shortcuts[') === 0) {
          // Replace the index in the name attribute.
          const newName = name.replace(/wds_shortcuts\[\d+\]/, `wds_shortcuts[${index}]`)
          $input.attr('name', newName)
        }
      })
    })
  }

  // Initialize on document ready.
  init()
})(jQuery)
