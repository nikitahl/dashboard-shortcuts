/**
 * WP Dashboard Shortcuts - Frontend shortcuts bar scripts
 *
 * @package WP_Dashboard_Shortcuts
 */

import '../css/shortcuts.css'

(($) => {
  'use strict'
  const { wdsShortcuts } = window

  /**
   * Initialize shortcuts bar functionality
   *
   * @since 1.0.0
   */
  const init = () => {
    $('#wds-add-current-page').on('click', showAddCurrentPageModal)
  }

  /**
   * Show add current page modal
   *
   * @since 1.0.0
   */
  const showAddCurrentPageModal = () => {
    if (!$('#wds-add-page-modal').length) {
      createAddPageModal()
    }

    const $modal = $('#wds-add-page-modal')
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
        throw new Error(response.data?.message || wdsShortcuts.errorMsg)
      }
    } catch (error) {
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

  $(init)
})(jQuery)


