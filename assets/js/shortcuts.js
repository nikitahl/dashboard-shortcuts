/**
 * Dashboard Shortcuts - Frontend shortcuts bar scripts
 *
 * @package Dashboard_Shortcuts
 */

import '../css/shortcuts.css'

(($) => {
  'use strict'
  const { dashshShortcuts } = window
  const $shortcutsBar = $('#dashsh-shortcuts-bar')
  const $list = $shortcutsBar.find('.dashsh-shortcuts-list')
  let $modal = $('#dashsh-add-page-modal')

  /**
   * Check if the admin bar is present and visible
   * Covers display, visibility, height, and width
   * @returns {boolean}
   *
   * @since 1.1.0
   */
  const isAdminBarVisible = () => {
    const adminBar = document.getElementById('wpadminbar')
    if (!adminBar) return false
    const style = getComputedStyle(adminBar)
    // Return false if any property indicates hidden
    if (
      adminBar.offsetParent === null ||
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      adminBar.offsetHeight === 0 ||
      adminBar.offsetWidth === 0
    ) {
      return false
    }
    return true
  }

  /**
   * Dynamically monitor admin bar visibility and hide shortcuts bar if needed
   *
   * @since 1.1.0
   */
  const monitorAdminBarVisibility = () => {
    console.log('monitorAdminBarVisibility')
    const adminBar = document.getElementById('wpadminbar')
    if (!adminBar) return

    const observer = new MutationObserver(() => {
      if (!isAdminBarVisible()) {
        $shortcutsBar.hide()
      } else {
        $shortcutsBar.show()
      }
    })

    observer.observe(adminBar, {
      attributes: true,
      attributeFilter: [ 'style', 'class' ]
    })

    // Also check after a short delay in case display:none is applied late
    setTimeout(() => {
      if (!isAdminBarVisible()) {
        $shortcutsBar.hide()
      } else {
        $shortcutsBar.show()
      }
    }, 1000)
  }

  /**
   * Initialize shortcuts bar functionality
   *
   * @since 1.0.0
   */
  const init = () => {
    // Use the new function for admin bar visibility check
    if (!isAdminBarVisible()) {
      // Do not initialize shortcuts bar if admin bar is missing or not visible
      return
    }

    $('#dashsh-add-current-page').on('click', showAddCurrentPageModal)

    $(window).on('scroll', handleWindowScroll)
    handleWindowScroll()

    createMoreButton()
    initToggleButton()
    resizeObserver.observe($shortcutsBar[0])

    // Close dropdown when clicking outside
    $(document).on('click', (e) => {
      if (!$(e.target).closest('.dashsh-more-button, .dashsh-more-dropdown').length) {
        closeMoreDropdown()
      }
    })

    // Start monitoring admin bar visibility
    monitorAdminBarVisibility()
  }

  /**
   * Handle window scroll for mobile fixed bar
   *
   * @since 1.0.0
   */
  const handleWindowScroll = () => {
    if (window.innerWidth < 600 && $(window).scrollTop() > 46) {
      $shortcutsBar.addClass('dashsh-shortcuts-bar-fixed')
    } else {
      $shortcutsBar.removeClass('dashsh-shortcuts-bar-fixed')
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
    const $moreButton = $('.dashsh-more-button')
    const $dropdown = $('.dashsh-more-dropdown')
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
      $shortcutsBar.addClass('dashsh-shortcuts-bar-narrow')
      $moreButton.show()

      // Clear and populate dropdown with hidden items
      $dropdown.empty()
      hiddenItems.forEach($item => {
        // Ensure the cloned item is visible in the dropdown
        $item.css('display', 'block')
        const $link = $item.find('.dashsh-shortcut-link')
        $link.on('click', () => {
          closeMoreDropdown()
        })
        $dropdown.append($item)
      })
    } else {
      $shortcutsBar.removeClass('dashsh-shortcuts-bar-narrow')
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
      $modal = $('#dashsh-add-page-modal')
    }

    const $titleInput = $('#dashsh-add-page-title')

    $titleInput.val(dashshShortcuts.currentTitle)

    $modal.show()
    $('body').addClass('modal-open')

    $titleInput.focus().select()

    $('#dashsh-add-page-submit')
      .off('click')
      .on('click', () => {
        const title = $titleInput.val().trim()

        if (!title) {
          alert(dashshShortcuts.emptyTitleMsg)
          return
        }

        addCurrentPageShortcut(title)
      })

    $('#dashsh-add-page-cancel, #dashsh-add-page-close-btn')
      .off('click')
      .on('click', closeAddPageModal)

    $modal
      .off('click')
      .on('click', (e) => {
        if ($(e.target).hasClass('dashsh-modal-backdrop')) {
          closeAddPageModal()
        }
      })

    $titleInput
      .off('keypress')
      .on('keypress', (e) => {
        if (e.which === 13) {
          e.preventDefault()
          $('#dashsh-add-page-submit').trigger('click')
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
      <div id="dashsh-add-page-modal" class="dashsh-modal-backdrop" style="display:none;">
        <div class="dashsh-modal dashsh-add-page-modal">
          <div class="dashsh-modal-header">
            <h2>${dashshShortcuts.addLabel}</h2>
            <button type="button" class="dashsh-modal-close" id="dashsh-add-page-close-btn" aria-label="${dashshShortcuts.close || 'Close'}">
              <span class="dashicons dashicons-no" aria-hidden="true"></span>
            </button>
          </div>
          <div class="dashsh-modal-body">
            <div class="dashsh-modal-field">
              <label for="dashsh-add-page-title">${dashshShortcuts.titleLabel}</label>
              <input
                type="text"
                id="dashsh-add-page-title"
                class="regular-text"
                placeholder="Enter shortcut title"
              />
            </div>
          </div>
          <div class="dashsh-modal-footer">
            <button type="button" class="button button-secondary" id="dashsh-add-page-cancel">
              ${dashshShortcuts.cancelLabel}
            </button>
            <button type="button" class="button button-primary" id="dashsh-add-page-submit">
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
    $('#dashsh-add-page-modal').hide()
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
    const $submitBtn = $('#dashsh-add-page-submit')
    const originalText = $submitBtn.text()

    $submitBtn.prop('disabled', true).text('Adding...')

    try {
      const response = await $.ajax({
        url: dashshShortcuts.ajaxUrl,
        type: 'POST',
        data: {
          action: 'dashsh_add_current_page',
          nonce: dashshShortcuts.nonce,
          title,
          url: dashshShortcuts.currentUrl
        }
      })

      if (response.success) {
        showNotification(dashshShortcuts.successMsg, 'success')
        closeAddPageModal()

        setTimeout(() => location.reload(), 500)
      } else {
        console.error(response.data?.message || dashshShortcuts.errorMsg)
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
      class: `dashsh-notification dashsh-notification-${type}`,
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
      class: 'dashsh-more-button',
      type: 'button',
      html: '<span class="dashicons dashicons-arrow-right-alt2" aria-hidden="true"></span>',
      'aria-label': 'More shortcuts',
      'title': 'More shortcuts',
      css: { display: 'none' }
    })

    const $dropdown = $('<ul>', {
      class: 'dashsh-more-dropdown',
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
    const $dropdown = $('.dashsh-more-dropdown')
    const $moreButton = $('.dashsh-more-button')

    if ($dropdown.is(':visible')) {
      closeMoreDropdown()
    } else {
      $dropdown.css({
        top: $moreButton.outerHeight() + 'px',
        right: '10px'
      }).show()

      $moreButton.addClass('dashsh-more-button-active')
    }
  }

  /**
   * Close the "More" dropdown
   *
   * @since 1.0.0
   */
  const closeMoreDropdown = () => {
    $('.dashsh-more-dropdown').hide()
    $('.dashsh-more-button').removeClass('dashsh-more-button-active')
  }

  /**
   * Initialize toggle button functionality
   * Allows users to show/hide the shortcuts bar
   *
   * @since 1.0.0
   */
  const initToggleButton = () => {
    const $toggleBtn = $('#wp-admin-bar-dashsh-shortcuts-toggle')
    const $shortcutsBarContent = $('.dashsh-shortcuts-bar')
    const $body = $('body')

    if (!$toggleBtn.length) {
      return
    }

    // Check saved state from localStorage
    const isHidden = localStorage.getItem('dashsh_shortcuts_bar_hidden') === 'true'

    if (isHidden) {
      $body.addClass('dashsh-shortcuts-bar-closed')
      $shortcutsBarContent.slideUp(0)
      $toggleBtn.find('.dashicons').removeClass('dashicons-visibility').addClass('dashicons-hidden')
    }

    // Toggle button click handler
    $toggleBtn.on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if ($shortcutsBarContent.is(':visible')) {
        // Hide the bar
        $body.addClass('dashsh-shortcuts-bar-closed')
        $shortcutsBarContent.slideUp(300)
        $toggleBtn.find('.dashicons').removeClass('dashicons-visibility').addClass('dashicons-hidden')
        localStorage.setItem('dashsh_shortcuts_bar_hidden', 'true')
        closeMoreDropdown()
      } else {
        // Show the bar
        $body.removeClass('dashsh-shortcuts-bar-closed')
        $shortcutsBarContent.slideDown(300)
        $toggleBtn.find('.dashicons').removeClass('dashicons-hidden').addClass('dashicons-visibility')
        localStorage.setItem('dashsh_shortcuts_bar_hidden', 'false')
      }
    })
  }

  init()
})(jQuery)
