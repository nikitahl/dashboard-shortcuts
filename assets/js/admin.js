/**
 * Dashboard Shortcuts - Admin settings page scripts
 *
 * @package Dashboard_Shortcuts
 */

import '../css/admin.css'
(($) => {
  'use strict'
  const { dsSettings, wpApiSettings } = window

  /**
   * Initialize the settings page functionality.
   */
  const init = () => {
    const $container = $('#ds-shortcuts-container')
    const $addButton = $('#ds-add-shortcut')

    initSortable()
    initLinkPicker()

    // Add new shortcut row.
    $addButton.on('click', () => {
      const index = $container.find('.ds-shortcut-row').length
      const $newRow = createShortcutRow(index)
      $container.append($newRow)
    })

    // Remove shortcut row.
    $container.on('click', '.ds-remove-shortcut', function () {
      const $row = $(this).closest('.ds-shortcut-row')
      const $allRows = $container.find('.ds-shortcut-row')

      // Confirm deletion.
      if (!confirm(dsSettings.confirmDelete || 'Are you sure you want to remove this shortcut?')) {
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
    const $container = $('#ds-shortcuts-container')

    $container.sortable({
      handle: '.ds-drag-handle',
      placeholder: 'ds-shortcut-placeholder',
      axis: 'y',
      cursor: 'move',
      opacity: 0.7,
      tolerance: 'pointer',
      start: (event, ui) => {
        ui.placeholder.height(ui.item.height())
        ui.item.addClass('ds-sorting')
      },
      stop: (event, ui) => {
        ui.item.removeClass('ds-sorting')
        reindexRows()
      }
    })
  }

  /**
   * Initialize WordPress link picker functionality.
   */
  const initLinkPicker = () => {
    const $container = $('#ds-shortcuts-container')

    // Handle click on URL selector button.
    $container.on('click', '.ds-select-url', function (e) {
      e.preventDefault()
      const $currentInput = $(this).siblings('.ds-url-input')

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
    const $modal = $('#ds-link-modal')

    // Create modal if it doesn't exist
    if ($modal.length === 0) {
      createLinkModal()
    }

    const $urlInput = $('#ds-modal-url')
    const $searchInput = $('#ds-modal-search')
    const $results = $('#ds-modal-results')

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
    $('#ds-modal-insert').off('click').on('click', () => {
      const url = $urlInput.val()
      if (url) {
        $input.val(url)
      }
      closeLinkModal()
    })

    // Handle cancel button
    $('#ds-modal-cancel').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle close button (X icon)
    $('#ds-modal-close-btn').off('click').on('click', () => {
      closeLinkModal()
    })

    // Handle backdrop click
    $modal.off('click').on('click', (e) => {
      if ($(e.target).hasClass('ds-modal-backdrop')) {
        closeLinkModal()
      }
    })
  }

  /**
   * Create link selector modal HTML.
   */
  const createLinkModal = () => {
    const modalHtml =
      '<div id="ds-link-modal" class="ds-modal-backdrop" style="display:none">' +
      '<div class="ds-modal">' +
      '<div class="ds-modal-header">' +
      '<h2>Insert/Edit Link</h2>' +
      '<button type="button" class="ds-modal-close" id="ds-modal-close-btn" aria-label="' + dsSettings.close +'">' +
      '<span class="dashicons dashicons-no" aria-hidden="true"></span>' +
      '</button>' +
      '</div>' +
      '<div class="ds-modal-body">' +
      '<div class="ds-modal-field">' +
      '<label for="ds-modal-url">URL</label>' +
      '<input type="text" id="ds-modal-url" class="regular-text" placeholder="https://example.com" />' +
      '</div>' +
      '<div class="ds-modal-field">' +
      '<label for="ds-modal-search">Or search for existing content</label>' +
      '<input type="text" id="ds-modal-search" class="regular-text" placeholder="Search pages, posts..." />' +
      '</div>' +
      '<div id="ds-modal-results" class="ds-modal-results"></div>' +
      '</div>' +
      '<div class="ds-modal-footer">' +
      '<button type="button" class="button button-secondary" id="ds-modal-cancel">Cancel</button>' +
      '<button type="button" class="button button-primary" id="ds-modal-insert">Insert Link</button>' +
      '</div>' +
      '</div>' +
      '</div>'

    $('body').append(modalHtml)
  }

  /**
   * Close link selector modal.
   */
  const closeLinkModal = () => {
    $('#ds-link-modal').hide()
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
    $results.html('<div class="ds-modal-loading">Searching...</div>')

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
          $results.html('<div class="ds-modal-no-results">No results found</div>')
          return
        }

        let html = '<ul class="ds-modal-results-list">'
        $.each(items, (i, item) => {
          html += `<li class="ds-modal-result-item" data-url="${item.url}">` +
            `<strong>${item.title}</strong>` +
            `<span class="ds-modal-result-type">${item.subtype}</span>` +
            '</li>'
        })
        html += '</ul>'

        $results.html(html)

        // Handle result click
        $('.ds-modal-result-item').on('click', function () {
          const url = $(this).data('url')
          $urlInput.val(url)
          $('.ds-modal-result-item').removeClass('selected')
          $(this).addClass('selected')
        })
      },
      error: (xhr, status, error) => {
        console.error('Search error:', xhr.status, error)
        $results.html('<div class="ds-modal-error">Error searching content. Please check your WordPress REST API is enabled.</div>')
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
      class: 'ds-shortcut-row',
      'data-index': index,
      style: 'display: none'
    })

    // Drag handle.
    const $dragHandle = $('<div>', {
      class: 'ds-drag-handle',
      title: dsSettings.dragToReoder || 'Drag to reorder',
      'aria-label': dsSettings.dragToReoder || 'Drag to reorder'
    })
    const $dragIcon = $('<span>', { class: 'dashicons dashicons-menu', 'aria-hidden': true })
    $dragHandle.append($dragIcon)

    const $fields = $('<div>', { class: 'ds-shortcut-fields' })

    // Title field.
    const $titleField = $('<div>', { class: 'ds-field' })
    const $titleLabel = $('<label>').text(dsSettings.titleLabel || 'Title')
    const $titleInput = $('<input>', {
      type: 'text',
      name: `ds_shortcuts[${index}][title]`,
      placeholder: dsSettings.titlePlaceholder || 'e.g., My Site',
      class: 'regular-text'
    })
    $titleLabel.append($titleInput)
    $titleField.append($titleLabel)

    // URL field.
    const $urlField = $('<div>', { class: 'ds-field ds-field-url' })
    const $urlLabel = $('<label>').text(dsSettings.urlLabel || 'URL')
    const $urlWrapper = $('<div>', { class: 'ds-url-input-wrapper' })
    const $urlInput = $('<input>', {
      type: 'text',
      name: `ds_shortcuts[${index}][url]`,
      placeholder: dsSettings.urlPlaceholder || 'https://example.com',
      class: 'regular-text ds-url-input'
    })
    const $urlButton = $('<button>', {
      type: 'button',
      class: 'button ds-select-url',
      title: dsSettings.selectFromWp || 'Select from WordPress',
      'aria-label': dsSettings.selectFromWp || 'Select from WordPress'
    }).append($('<span>', { class: 'dashicons dashicons-admin-links', 'aria-hidden': true }))
    $urlWrapper.append($urlInput)
    $urlWrapper.append($urlButton)
    $urlLabel.append($urlWrapper)
    $urlField.append($urlLabel)

    // New tab checkbox.
    const $checkboxField = $('<div>', { class: 'ds-field ds-field-checkbox' })
    const $checkboxLabel = $('<label>')
    const $checkbox = $('<input>', {
      type: 'checkbox',
      name: `ds_shortcuts[${index}][new_tab]`
    })
    $checkboxLabel.append($checkbox)
    $checkboxLabel.append(dsSettings.newTabLabel || 'Open in new tab')
    $checkboxField.append($checkboxLabel)

    // Remove button.
    const $actionsField = $('<div>', { class: 'ds-field ds-field-actions' })
    const $removeButton = $('<button>', {
      type: 'button',
      class: 'button ds-remove-shortcut',
      title: dsSettings.removeLabel || 'Remove shortcut',
      'aria-label': dsSettings.removeLabel || 'Remove shortcut'
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
    const $rows = $('#ds-shortcuts-container .ds-shortcut-row')

    $rows.each(function (index) {
      const $row = $(this)
      $row.attr('data-index', index)

      // Only find input elements with type text or checkbox
      $row.find('input[type="text"], input[type="checkbox"]').each(function () {
        const $input = $(this)
        const name = $input.attr('name')

        if (name && name.indexOf('ds_shortcuts[') === 0) {
          // Replace the index in the name attribute.
          const newName = name.replace(/ds_shortcuts\[\d+\]/, `ds_shortcuts[${index}]`)
          $input.attr('name', newName)
        }
      })
    })
  }

  // Initialize on document ready.
  init()
})(jQuery)
