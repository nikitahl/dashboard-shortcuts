/**
 * WP Dashboard Shortcuts - Frontend shortcuts bar scripts
 *
 * @package WP_Dashboard_Shortcuts
 */

(function($) {
  'use strict';

  /**
   * Initialize shortcuts bar functionality.
   */
  function init() {
    // Handle add current page button click
    $('#wds-add-current-page').on('click', function() {
      showAddCurrentPageModal();
    });
  }

  /**
   * Show add current page modal.
   */
  function showAddCurrentPageModal() {
    // Create modal if it doesn't exist
    if ($('#wds-add-page-modal').length === 0) {
      createAddPageModal();
    }

    var $modal = $('#wds-add-page-modal');
    var $titleInput = $('#wds-add-page-title');

    // Set default title from current page
    $titleInput.val(wdsShortcuts.currentTitle);

    $modal.show();
    $('body').addClass('modal-open');

    $titleInput.focus().select();

    // Handle add button
    $('#wds-add-page-submit').off('click').on('click', function() {
      var title = $titleInput.val().trim();

      if (!title) {
        alert(wdsShortcuts.emptyTitleMsg);
        return;
      }

      addCurrentPageShortcut(title);
    });

    // Handle cancel button
    $('#wds-add-page-cancel').off('click').on('click', function() {
      closeAddPageModal();
    });

    // Handle close button
    $('#wds-add-page-close-btn').off('click').on('click', function() {
      closeAddPageModal();
    });

    // Handle backdrop click
    $modal.off('click').on('click', function(e) {
      if ($(e.target).hasClass('wds-modal-backdrop')) {
        closeAddPageModal();
      }
    });

    // Handle Enter key
    $titleInput.off('keypress').on('keypress', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        $('#wds-add-page-submit').click();
      }
    });

    // Handle Escape key
    $(document).off('keyup.wdsAddPage').on('keyup.wdsAddPage', function(e) {
      if (e.key === 'Escape') {
        closeAddPageModal();
      }
    });
  }

  /**
   * Create add page modal HTML.
   */
  function createAddPageModal() {
    var modalHtml =
      '<div id="wds-add-page-modal" class="wds-modal-backdrop" style="display:none;">' +
        '<div class="wds-modal wds-add-page-modal">' +
          '<div class="wds-modal-header">' +
            '<h2>' + wdsShortcuts.addLabel + '</h2>' +
            '<button type="button" class="wds-modal-close" id="wds-add-page-close-btn">' +
              '<span class="dashicons dashicons-no"></span>' +
            '</button>' +
          '</div>' +
          '<div class="wds-modal-body">' +
            '<div class="wds-modal-field">' +
              '<label for="wds-add-page-title">' + wdsShortcuts.titleLabel + '</label>' +
              '<input type="text" id="wds-add-page-title" class="regular-text" placeholder="Enter shortcut title" />' +
            '</div>' +
          '</div>' +
          '<div class="wds-modal-footer">' +
            '<button type="button" class="button button-secondary" id="wds-add-page-cancel">' + wdsShortcuts.cancelLabel + '</button>' +
            '<button type="button" class="button button-primary" id="wds-add-page-submit">Add</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    $('body').append(modalHtml);
  }

  /**
   * Close add page modal.
   */
  function closeAddPageModal() {
    $('#wds-add-page-modal').hide();
    $('body').removeClass('modal-open');
    $(document).off('keyup.wdsAddPage');
  }

  /**
   * Add current page as shortcut via AJAX.
   *
   * @param {string} title Shortcut title.
   */
  function addCurrentPageShortcut(title) {
    var $submitBtn = $('#wds-add-page-submit');
    var originalText = $submitBtn.text();

    // Disable button and show loading
    $submitBtn.prop('disabled', true).text('Adding...');

    $.ajax({
      url: wdsShortcuts.ajaxUrl,
      type: 'POST',
      data: {
        action: 'wds_add_current_page',
        nonce: wdsShortcuts.nonce,
        title: title,
        url: wdsShortcuts.currentUrl
      },
      success: function(response) {
        if (response.success) {
          showNotification(wdsShortcuts.successMsg, 'success');

          closeAddPageModal();

          // Reload page to show new shortcut
          setTimeout(function() {
            location.reload();
          }, 500);
        } else {
          showNotification(response.data.message || wdsShortcuts.errorMsg, 'error');
          $submitBtn.prop('disabled', false).text(originalText);
        }
      },
      error: function() {
        showNotification(wdsShortcuts.errorMsg, 'error');
        $submitBtn.prop('disabled', false).text(originalText);
      }
    });
  }

  /**
   * Show notification message.
   *
   * @param {string} message Notification message.
   * @param {string} type Notification type (success|error).
   */
  function showNotification(message, type) {
    var $notification = $('<div>', {
      class: 'wds-notification wds-notification-' + type,
      text: message
    });

    $('body').append($notification);

    // Fade in
    setTimeout(function() {
      $notification.addClass('show');
    }, 10);

    // Fade out and remove
    setTimeout(function() {
      $notification.removeClass('show');
      setTimeout(function() {
        $notification.remove();
      }, 300);
    }, 3000);
  }

  $(document).ready(function() {
    init();
  });

})(jQuery);

