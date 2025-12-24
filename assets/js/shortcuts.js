/**
 * WP Dashboard Shortcuts - Frontend shortcuts bar scripts
 *
 * @package WP_Dashboard_Shortcuts
 */

import '../css/shortcuts.css'

(($) => {
  'use strict'
  const { wdsShortcuts } = window
  const $shortcutsBar = $('#wds-shortcuts-bar')
  const $list = $shortcutsBar.find('.wds-shortcuts-list')
  let $modal = $('#wds-add-page-modal')

  /**
   * Initialize shortcuts bar functionality
   *
   * @since 1.0.0
   */
  const init = () => {
    $('#wds-add-current-page').on('click', showAddCurrentPageModal)

    $(window).on( 'scroll', handleWindowScroll )
    handleWindowScroll()

    createMoreButton()
    resizeObserver.observe($shortcutsBar[0])

    // Close dropdown when clicking outside
    $(document).on('click', (e) => {
      if (!$(e.target).closest('.wds-more-button, .wds-more-dropdown').length) {
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
      $shortcutsBar.addClass('wds-shortcuts-bar-fixed')
    } else {
      $shortcutsBar.removeClass('wds-shortcuts-bar-fixed')
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
    const $moreButton = $('.wds-more-button')
    const $dropdown = $('.wds-more-dropdown')
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
    $items.each(function() {
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
      $shortcutsBar.addClass('wds-shortcuts-bar-narrow')
      $moreButton.show()

      // Clear and populate dropdown with hidden items
      $dropdown.empty()
      hiddenItems.forEach($item => {
        // Ensure the cloned item is visible in the dropdown
        $item.css('display', 'block')
        const $link = $item.find('.wds-shortcut-link')
        $link.on('click', () => {
          closeMoreDropdown()
        })
        $dropdown.append($item)
      })
    } else {
      $shortcutsBar.removeClass('wds-shortcuts-bar-narrow')
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
      $modal = $('#wds-add-page-modal')
    }

    const $titleInput = $('#wds-add-page-title')

    $titleInput.val(wdsShortcuts.currentTitle)

    $modal.show()
    $('body').addClass('modal-open')

    $titleInput.focus().select()

    $('#wds-add-page-submit')
      .off('click')
      .on('click', () => {
        const title = $titleInput.val().trim()

        if (!title) {
          alert(wdsShortcuts.emptyTitleMsg)
          return
        }

        addCurrentPageShortcut(title)
      })

    $('#wds-add-page-cancel, #wds-add-page-close-btn')
      .off('click')
      .on('click', closeAddPageModal)

    $modal
      .off('click')
      .on('click', (e) => {
        if ($(e.target).hasClass('wds-modal-backdrop')) {
          closeAddPageModal()
        }
      })

    $titleInput
      .off('keypress')
      .on('keypress', (e) => {
        if (e.which === 13) {
          e.preventDefault()
          $('#wds-add-page-submit').trigger('click')
        }
      })

    $(document)
      .off('keyup.wdsAddPage')
      .on('keyup.wdsAddPage', (e) => {
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
      <div id="wds-add-page-modal" class="wds-modal-backdrop" style="display:none;">
        <div class="wds-modal wds-add-page-modal">
          <div class="wds-modal-header">
            <h2>${wdsShortcuts.addLabel}</h2>
            <button type="button" class="wds-modal-close" id="wds-add-page-close-btn">
              <span class="dashicons dashicons-no"></span>
            </button>
          </div>
          <div class="wds-modal-body">
            <div class="wds-modal-field">
              <label for="wds-add-page-title">${wdsShortcuts.titleLabel}</label>
              <input
                type="text"
                id="wds-add-page-title"
                class="regular-text"
                placeholder="Enter shortcut title"
              />
            </div>
          </div>
          <div class="wds-modal-footer">
            <button type="button" class="button button-secondary" id="wds-add-page-cancel">
              ${wdsShortcuts.cancelLabel}
            </button>
            <button type="button" class="button button-primary" id="wds-add-page-submit">
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
    $('#wds-add-page-modal').hide()
    $('body').removeClass('modal-open')
    $(document).off('keyup.wdsAddPage')
  }

  /**
   * Add current page as shortcut via AJAX
   *
   * @param {string} title Shortcut title
   * @since 1.0.0
   */
  const addCurrentPageShortcut = async (title) => {
    const $submitBtn = $('#wds-add-page-submit')
    const originalText = $submitBtn.text()

    $submitBtn.prop('disabled', true).text('Adding...')

    try {
      const response = await $.ajax({
        url: wdsShortcuts.ajaxUrl,
        type: 'POST',
        data: {
          action: 'wds_add_current_page',
          nonce: wdsShortcuts.nonce,
          title,
          url: wdsShortcuts.currentUrl
        }
      })

      if (response.success) {
        showNotification(wdsShortcuts.successMsg, 'success')
        closeAddPageModal()

        setTimeout(() => location.reload(), 500)
      } else {
        console.error(response.data?.message || wdsShortcuts.errorMsg)
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
      class: `wds-notification wds-notification-${type}`,
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
      class: 'wds-more-button',
      type: 'button',
      html: '<span class="dashicons dashicons-arrow-right-alt2"></span>',
      'aria-label': 'More shortcuts',
      'title': 'More shortcuts',
      css: { display: 'none' }
    })

    const $dropdown = $('<ul>', {
      class: 'wds-more-dropdown',
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
    const $dropdown = $('.wds-more-dropdown')
    const $moreButton = $('.wds-more-button')

    if ($dropdown.is(':visible')) {
      closeMoreDropdown()
    } else {
      $dropdown.css({
        top: $moreButton.outerHeight() + 'px',
        right: '10px'
      }).show()

      $moreButton.addClass('wds-more-button-active')
    }
  }

  /**
   * Close the "More" dropdown
   *
   * @since 1.0.0
   */
  const closeMoreDropdown = () => {
    $('.wds-more-dropdown').hide()
    $('.wds-more-button').removeClass('wds-more-button-active')
  }

  init()
})(jQuery)
