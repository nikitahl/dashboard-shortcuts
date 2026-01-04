/**
 * Dashboard Shortcuts - Admin settings page scripts
 *
 * @package Dashboard_Shortcuts
 */

import '../css/admin.css'
(($) => {
  'use strict'
  const { dashshSettings, dashshApiSettings } = window

  /**
   * Initialize the settings page functionality.
   */
  const init = () => {
    const $container = $('#dashsh-shortcuts-container')
    const $addButton = $('#dashsh-add-shortcut')

    initSortable()
    initLinkPicker()

    // Add new shortcut row.
    $addButton.on('click', () => {
      const index = $container.find('.dashsh-shortcut-row').length
      const $newRow = createShortcutRow(index)
      $container.append($newRow)
    })

    // Remove shortcut row.
    $container.on('click', '.dashsh-remove-shortcut', function () {
      const $row = $(this).closest('.dashsh-shortcut-row')
      const $allRows = $container.find('.dashsh-shortcut-row')

      // Confirm deletion.
      if (!confirm(dashshSettings.confirmDelete || 'Are you sure you want to remove this shortcut?')) {
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
    const $container = $('#dashsh-shortcuts-container')

    $container.sortable({
      handle: '.dashsh-drag-handle',
      placeholder: 'dashsh-shortcut-placeholder',
      axis: 'y',
      cursor: 'move',
      opacity: 0.7,
      tolerance: 'pointer',
      start: (event, ui) => {
        ui.placeholder.height(ui.item.height())
        ui.item.addClass('dashsh-sorting')
      },
      stop: (event, ui) => {
        ui.item.removeClass('dashsh-sorting')
        reindexRows()
      }
    })
  }

  /**
   * Initialize WordPress link picker functionality.
   */
  const initLinkPicker = () => {
    const $container = $('#dashsh-shortcuts-container')

    // Handle click on URL selector button.
    $container.on('click', '.dashsh-select-url', function (e) {
      e.preventDefault()
      const $currentInput = $(this).siblings('.dashsh-url-input')

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
    const $modal = $('#dashsh-link-modal')

    // Create modal if it doesn't exist
    if ($modal.length === 0) {
      createLinkModal()
    }

    const $urlInput = $('#dashsh-modal-url')
    const $searchInput = $('#dashsh-modal-search')
    const $results = $('#dashsh-modal-results')

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
    $('#dashsh-modal-insert').off('click').on('click', () => {
      const url = $urlInput.val()
      if (url) {
        $input.val(url)
      }
      closeLinkModal()
    })

    // Handle cancel button
    $('#dashsh-modal-cancel').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle close button (X icon)
    $('#dashsh-modal-close-btn').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle backdrop click
    $modal.off('click').on('click', (e) => {
      if ($(e.target).hasClass('dashsh-modal-backdrop')) {
        closeLinkModal()
      }
    })
  }

  /**
   * Create link selector modal HTML.
   */
  const createLinkModal = () => {
    const modalHtml =
      '<div id="dashsh-link-modal" class="dashsh-modal-backdrop" style="display:none">' +
      '<div class="dashsh-modal">' +
      '<div class="dashsh-modal-header">' +
      '<h2>Insert/Edit Link</h2>' +
      '<button type="button" class="dashsh-modal-close" id="dashsh-modal-close-btn" aria-label="' + dashshSettings.close +'">' +
      '<span class="dashicons dashicons-no" aria-hidden="true"></span>' +
      '</button>' +
      '</div>' +
      '<div class="dashsh-modal-body">' +
      '<div class="dashsh-modal-field">' +
      '<label for="dashsh-modal-url">URL</label>' +
      '<input type="text" id="dashsh-modal-url" class="regular-text" placeholder="https://example.com" />' +
      '</div>' +
      '<div class="dashsh-modal-field">' +
      '<label for="dashsh-modal-search">Or search for existing content</label>' +
      '<input type="text" id="dashsh-modal-search" class="regular-text" placeholder="Search pages, posts..." />' +
      '</div>' +
      '<div id="dashsh-modal-results" class="dashsh-modal-results"></div>' +
      '</div>' +
      '<div class="dashsh-modal-footer">' +
      '<button type="button" class="button button-secondary" id="dashsh-modal-cancel">Cancel</button>' +
      '<button type="button" class="button button-primary" id="dashsh-modal-insert">Insert Link</button>' +
      '</div>' +
      '</div>' +
      '</div>'

    $('body').append(modalHtml)
  }

  /**
   * Close link selector modal.
   */
  const closeLinkModal = () => {
    $('#dashsh-link-modal').hide()
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
    $results.html('<div class="dashsh-modal-loading">Searching...</div>')

    // Use dashshApiSettings if available, otherwise construct URL
    const restUrl = dashshApiSettings ? dashshApiSettings.root : '/wp-json/'
    const searchUrl = `${restUrl}wp/v2/search`

    $.ajax({
      url: searchUrl,
      data: {
        search: query,
        per_page: 10,
        _wpnonce: dashshApiSettings ? dashshApiSettings.nonce : ''
      },
      success: (items) => {
        if (!items || items.length === 0) {
          $results.html('<div class="dashsh-modal-no-results">No results found</div>')
          return
        }

        let html = '<ul class="dashsh-modal-results-list">'
        $.each(items, (i, item) => {
          html += `<li class="dashsh-modal-result-item" data-url="${item.url}">` +
            `<strong>${item.title}</strong>` +
            `<span class="dashsh-modal-result-type">${item.subtype}</span>` +
            '</li>'
        })
        html += '</ul>'

        $results.html(html)

        // Handle result click
        $('.dashsh-modal-result-item').on('click', function () {
          const url = $(this).data('url')
          $urlInput.val(url)
          $('.dashsh-modal-result-item').removeClass('selected')
          $(this).addClass('selected')
        })
      },
      error: (xhr, status, error) => {
        console.error('Search error:', xhr.status, error)
        $results.html('<div class="dashsh-modal-error">Error searching content. Please check your WordPress REST API is enabled.</div>')
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
      class: 'dashsh-shortcut-row',
      'data-index': index,
      style: 'display: none'
    })

    // Drag handle.
    const $dragHandle = $('<div>', {
      class: 'dashsh-drag-handle',
      title: dashshSettings.dragToReoder || 'Drag to reorder',
      'aria-label': dashshSettings.dragToReoder || 'Drag to reorder'
    })
    const $dragIcon = $('<span>', { class: 'dashicons dashicons-menu', 'aria-hidden': true })
    $dragHandle.append($dragIcon)

    const $fields = $('<div>', { class: 'dashsh-shortcut-fields' })

    // Title field.
    const $titleField = $('<div>', { class: 'dashsh-field' })
    const $titleLabel = $('<label>').text(dashshSettings.titleLabel || 'Title')
    const $titleInput = $('<input>', {
      type: 'text',
      name: `dashsh_shortcuts[${index}][title]`,
      placeholder: dashshSettings.titlePlaceholder || 'e.g., My Site',
      class: 'regular-text'
    })
    $titleLabel.append($titleInput)
    $titleField.append($titleLabel)

    // URL field.
    const $urlField = $('<div>', { class: 'dashsh-field dashsh-field-url' })
    const $urlLabel = $('<label>').text(dashshSettings.urlLabel || 'URL')
    const $urlWrapper = $('<div>', { class: 'dashsh-url-input-wrapper' })
    const $urlInput = $('<input>', {
      type: 'text',
      name: `dashsh_shortcuts[${index}][url]`,
      placeholder: dashshSettings.urlPlaceholder || 'https://example.com',
      class: 'regular-text dashsh-url-input'
    })
    const $urlButton = $('<button>', {
      type: 'button',
      class: 'button dashsh-select-url',
      title: dashshSettings.selectFromWp || 'Select from WordPress',
      'aria-label': dashshSettings.selectFromWp || 'Select from WordPress'
    }).append($('<span>', { class: 'dashicons dashicons-admin-links', 'aria-hidden': true }))
    $urlWrapper.append($urlInput)
    $urlWrapper.append($urlButton)
    $urlLabel.append($urlWrapper)
    $urlField.append($urlLabel)

    // New tab checkbox.
    const $checkboxField = $('<div>', { class: 'dashsh-field dashsh-field-checkbox' })
    const $checkboxLabel = $('<label>')
    const $checkbox = $('<input>', {
      type: 'checkbox',
      name: `dashsh_shortcuts[${index}][new_tab]`
    })
    $checkboxLabel.append($checkbox)
    $checkboxLabel.append(dashshSettings.newTabLabel || 'Open in new tab')
    $checkboxField.append($checkboxLabel)

    // Remove button.
    const $actionsField = $('<div>', { class: 'dashsh-field dashsh-field-actions' })
    const $removeButton = $('<button>', {
      type: 'button',
      class: 'button dashsh-remove-shortcut',
      title: dashshSettings.removeLabel || 'Remove shortcut',
      'aria-label': dashshSettings.removeLabel || 'Remove shortcut'
    })
    const $removeIcon = $('<span>', { class: 'dashicons dashicons-trash', 'aria-hidden': true })
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
    const $rows = $('#dashsh-shortcuts-container .dashsh-shortcut-row')

    $rows.each(function (index) {
      const $row = $(this)
      $row.attr('data-index', index)

      // Only find input elements with type text or checkbox
      $row.find('input[type="text"], input[type="checkbox"]').each(function () {
        const $input = $(this)
        const name = $input.attr('name')

        if (name && name.indexOf('dashsh_shortcuts[') === 0) {
          // Replace the index in the name attribute.
          const newName = name.replace(/dashsh_shortcuts\[\d+\]/, `dashsh_shortcuts[${index}]`)
          $input.attr('name', newName)
        }
      })
    })
  }

  // Initialize on document ready.
  init()
})(jQuery)
