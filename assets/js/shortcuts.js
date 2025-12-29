/**
 * Dashboard Shortcuts - Frontend shortcuts bar scripts
 *
 * @package Dashboard_Shortcuts
 */

import '../css/shortcuts.css'

(($) => {
  'use strict'
  const { dsShortcuts } = window
  const $shortcutsBar = $('#ds-shortcuts-bar')
  const $list = $shortcutsBar.find('.ds-shortcuts-list')
  let $modal = $('#ds-add-page-modal')

  /**
   * Initialize shortcuts bar functionality
   *
   * @since 1.0.0
   */
  const init = () => {
    $('#ds-add-current-page').on('click', showAddCurrentPageModal)

    $(window).on('scroll', handleWindowScroll)
    handleWindowScroll()

    createMoreButton()
    initToggleButton()
    resizeObserver.observe($shortcutsBar[0])

    // Close dropdown when clicking outside
    $(document).on('click', (e) => {
      if (!$(e.target).closest('.ds-more-button, .ds-more-dropdown').length) {
        closeMoreDropdown()
      }
    })
  }

  /**
   * Handle window scroll for mobile fixed bar
   *
   * @since 1.0.0
   */
  const handleWindowScroll = () => {
    if (window.innerWidth < 600 && $(window).scrollTop() > 46) {
      $shortcutsBar.addClass('ds-shortcuts-bar-fixed')
    } else {
      $shortcutsBar.removeClass('ds-shortcuts-bar-fixed')
    }
  }

  /**
   * Observe shortcuts bar width to toggle narrow class
   *
   * @since 1.0.0
   */
  const resizeObserver = new ResizeObserver(() => {
    const availableWidth = $list[0].getBoundingClientRect().width
    manageItemsVisibility(availableWidth)
  })

  /**
   * Manage visibility of shortcut items based on available width
   * Shows items that fit and hides items that overflow
   *
   * @param {number} availableWidth - The available width of the list container
   * @since 1.0.0
   */
  const manageItemsVisibility = (availableWidth) => {
    const $moreButton = $('.ds-more-button')
    const $dropdown = $('.ds-more-dropdown')
    const moreButtonWidth = $moreButton.outerWidth() || 0

    // Calculate available width accounting for the more button
    const effectiveWidth = availableWidth - moreButtonWidth - 10 // 10px buffer

    let accumulatedWidth = 0
    let hasOverflow = false
    const $items = $list.children()
    const hiddenItems = []

    // First pass: show all items temporarily to get their actual widths
    $items.show()

    // Second pass: determine which items fit and which don't
    $items.each(function () {
      const itemWidth = $(this)[0].getBoundingClientRect().width
      accumulatedWidth += itemWidth

      if (accumulatedWidth > effectiveWidth) {
        $(this).hide()
        hasOverflow = true
        hiddenItems.push($(this).clone())
      }
    })

    // Show/hide more button and populate dropdown
    if (hasOverflow) {
      $shortcutsBar.addClass('ds-shortcuts-bar-narrow')
      $moreButton.show()

      // Clear and populate dropdown with hidden items
      $dropdown.empty()
      hiddenItems.forEach($item => {
        // Ensure the cloned item is visible in the dropdown
        $item.css('display', 'block')
        const $link = $item.find('.ds-shortcut-link')
        $link.on('click', () => {
          closeMoreDropdown()
        })
        $dropdown.append($item)
      })
    } else {
      $shortcutsBar.removeClass('ds-shortcuts-bar-narrow')
      $moreButton.hide()
      $dropdown.empty()
      closeMoreDropdown()
    }
  }

  /**
   * Show add current page modal
   *
   * @since 1.0.0
   */
  const showAddCurrentPageModal = () => {
    if (!$modal.length) {
      createAddPageModal()
      $modal = $('#ds-add-page-modal')
    }

    const $titleInput = $('#ds-add-page-title')

    $titleInput.val(dsShortcuts.currentTitle)

    $modal.show()
    $('body').addClass('modal-open')

    $titleInput.focus().select()

    $('#ds-add-page-submit')
      .off('click')
      .on('click', () => {
        const title = $titleInput.val().trim()

        if (!title) {
          alert(dsShortcuts.emptyTitleMsg)
          return
        }

        addCurrentPageShortcut(title)
      })

    $('#ds-add-page-cancel, #ds-add-page-close-btn')
      .off('click')
      .on('click', closeAddPageModal)

    $modal
      .off('click')
      .on('click', (e) => {
        if ($(e.target).hasClass('ds-modal-backdrop')) {
          closeAddPageModal()
        }
      })

    $titleInput
      .off('keypress')
      .on('keypress', (e) => {
        if (e.which === 13) {
          e.preventDefault()
          $('#ds-add-page-submit').trigger('click')
        }
      })

    $(document)
      .off('keyup.dsAddPage')
      .on('keyup.dsAddPage', (e) => {
        if (e.key === 'Escape') {
          closeAddPageModal()
        }
      })
  }

  /**
   * Create add page modal HTML
   *
   * @since 1.0.0
   */
  const createAddPageModal = () => {
    const modalHtml = `
      <div id="ds-add-page-modal" class="ds-modal-backdrop" style="display:none;">
        <div class="ds-modal ds-add-page-modal">
          <div class="ds-modal-header">
            <h2>${dsShortcuts.addLabel}</h2>
            <button type="button" class="ds-modal-close" id="ds-add-page-close-btn" aria-label="${dsShortcuts.close || 'Close'}">
              <span class="dashicons dashicons-no" aria-hidden="true"></span>
            </button>
          </div>
          <div class="ds-modal-body">
            <div class="ds-modal-field">
              <label for="ds-add-page-title">${dsShortcuts.titleLabel}</label>
              <input
                type="text"
                id="ds-add-page-title"
                class="regular-text"
                placeholder="Enter shortcut title"
              />
            </div>
          </div>
          <div class="ds-modal-footer">
            <button type="button" class="button button-secondary" id="ds-add-page-cancel">
              ${dsShortcuts.cancelLabel}
            </button>
            <button type="button" class="button button-primary" id="ds-add-page-submit">
              Add
            </button>
          </div>
        </div>
      </div>
    `

    $('body').append(modalHtml)
  }

  /**
   * Close add page modal
   *
   * @since 1.0.0
   */
  const closeAddPageModal = () => {
    $('#ds-add-page-modal').hide()
    $('body').removeClass('modal-open')
    $(document).off('keyup.dsAddPage')
  }

  /**
   * Add current page as shortcut via AJAX
   *
   * @param {string} title Shortcut title
   * @since 1.0.0
   */
  const addCurrentPageShortcut = async (title) => {
    const $submitBtn = $('#ds-add-page-submit')
    const originalText = $submitBtn.text()

    $submitBtn.prop('disabled', true).text('Adding...')

    try {
      const response = await $.ajax({
        url: dsShortcuts.ajaxUrl,
        type: 'POST',
        data: {
          action: 'ds_add_current_page',
          nonce: dsShortcuts.nonce,
          title,
          url: dsShortcuts.currentUrl
        }
      })

      if (response.success) {
        showNotification(dsShortcuts.successMsg, 'success')
        closeAddPageModal()

        setTimeout(() => location.reload(), 500)
      } else {
        console.error(response.data?.message || dsShortcuts.errorMsg)
      }
    } catch (error) {
      console.error('Unable to add current page to shortcuts: ', error.message)
      showNotification(error.message, 'error')
      $submitBtn.prop('disabled', false).text(originalText)
    }
  }

  /**
   * Show notification message
   *
   * @param {string} message Notification message
   * @param {string} type success|error
   * @since 1.0.0
   */
  const showNotification = (message, type) => {
    const $notification = $('<div>', {
      class: `ds-notification ds-notification-${type}`,
      text: message
    })

    $('body').append($notification)

    setTimeout(() => $notification.addClass('show'), 10)

    setTimeout(() => {
      $notification.removeClass('show')
      setTimeout(() => $notification.remove(), 300)
    }, 3000)
  }

  /**
   * Create and manage "More" button with dropdown for overflow items
   *
   * @since 1.0.0
   */
  const createMoreButton = () => {
    const $moreButton = $('<button>', {
      class: 'ds-more-button',
      type: 'button',
      html: '<span class="dashicons dashicons-arrow-right-alt2" aria-hidden="true"></span>',
      'aria-label': 'More shortcuts',
      'title': 'More shortcuts',
      css: { display: 'none' }
    })

    const $dropdown = $('<ul>', {
      class: 'ds-more-dropdown',
      css: { display: 'none' }
    })

    $moreButton.on('click', (e) => {
      e.stopPropagation()
      toggleMoreDropdown()
    })

    $list.after($moreButton)
    $shortcutsBar.append($dropdown)
  }

  /**
   * Toggle visibility of the "More" dropdown
   *
   * @since 1.0.0
   */
  const toggleMoreDropdown = () => {
    const $dropdown = $('.ds-more-dropdown')
    const $moreButton = $('.ds-more-button')

    if ($dropdown.is(':visible')) {
      closeMoreDropdown()
    } else {
      $dropdown.css({
        top: $moreButton.outerHeight() + 'px',
        right: '10px'
      }).show()

      $moreButton.addClass('ds-more-button-active')
    }
  }

  /**
   * Close the "More" dropdown
   *
   * @since 1.0.0
   */
  const closeMoreDropdown = () => {
    $('.ds-more-dropdown').hide()
    $('.ds-more-button').removeClass('ds-more-button-active')
  }

  /**
   * Initialize toggle button functionality
   * Allows users to show/hide the shortcuts bar
   *
   * @since 1.0.0
   */
  const initToggleButton = () => {
    const $toggleBtn = $('#wp-admin-bar-ds-shortcuts-toggle')
    const $shortcutsBarContent = $('.ds-shortcuts-bar')
    const $body = $('body')

    if (!$toggleBtn.length) {
      return
    }

    // Check saved state from localStorage
    const isHidden = localStorage.getItem('ds_shortcuts_bar_hidden') === 'true'

    if (isHidden) {
      $body.addClass('ds-shortcuts-bar-closed')
      $shortcutsBarContent.slideUp(0)
      $toggleBtn.find('.dashicons').removeClass('dashicons-visibility').addClass('dashicons-hidden')
    }

    // Toggle button click handler
    $toggleBtn.on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if ($shortcutsBarContent.is(':visible')) {
        // Hide the bar
        $body.addClass('ds-shortcuts-bar-closed')
        $shortcutsBarContent.slideUp(300)
        $toggleBtn.find('.dashicons').removeClass('dashicons-visibility').addClass('dashicons-hidden')
        localStorage.setItem('ds_shortcuts_bar_hidden', 'true')
        closeMoreDropdown()
      } else {
        // Show the bar
        $body.removeClass('ds-shortcuts-bar-closed')
        $shortcutsBarContent.slideDown(300)
        $toggleBtn.find('.dashicons').removeClass('dashicons-hidden').addClass('dashicons-visibility')
        localStorage.setItem('ds_shortcuts_bar_hidden', 'false')
      }
    })
  }

  init()
})(jQuery)
