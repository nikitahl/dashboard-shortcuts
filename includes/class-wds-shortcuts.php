<?php
/**
 * WDS Shortcuts handler.
 *
 * @package WP_Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WDS_Shortcuts
 *
 * Handles the HUD menu bar display and functionality.
 *
 * @since 1.0.0
 */
class WDS_Shortcuts {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_footer', [ $this, 'render_shortcuts_bar' ] );
		add_action( 'wp_footer', [ $this, 'render_shortcuts_bar' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		add_action( 'wp_ajax_wds_add_current_page', [ $this, 'ajax_add_current_page' ] );
		add_action( 'admin_bar_menu', [ $this, 'add_admin_bar_toggle' ], 999 );
	}

	/**
	 * Render shortcuts bar below admin bar.
	 *
	 * @since 1.0.0
	 */
	public function render_shortcuts_bar() {
		if ( ! is_admin_bar_showing() ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$shortcuts = $this->get_shortcuts();

		?>
		<div id="wds-shortcuts-bar" class="wds-shortcuts-bar">
			<div class="wds-shortcuts-container">
				<span class="wds-shortcuts-label">
					<span class="dashicons dashicons-star-filled"></span>
					<?php esc_html_e( 'Shortcuts:', 'wp-dashboard-shortcuts' ); ?>
				</span>
				<?php $this->render_shortcuts_list( $shortcuts ); ?>
				<button type="button" id="wds-add-current-page" class="wds-add-current-btn" title="<?php esc_attr_e( 'Add current page to shortcuts', 'wp-dashboard-shortcuts' ); ?>">
					<span class="dashicons dashicons-plus-alt" aria-hidden="true"></span>
					<?php esc_html_e( 'Add Current Page', 'wp-dashboard-shortcuts' ); ?>
				</button>
			</div>
		</div>
		<?php
	}

	/**
	 * Render the shortcuts list.
	 *
	 * @since 1.0.0
	 *
	 * @param array $shortcuts Array of shortcuts.
	 */
	private function render_shortcuts_list( $shortcuts ) {
		?>
		<ul class="wds-shortcuts-list">
			<?php
			if ( ! empty( $shortcuts ) ) {
				foreach ( $shortcuts as $shortcut ) {
					$this->render_shortcut_item( $shortcut );
				}
			}
			?>
		</ul>
		<?php
	}

	/**
	 * Render a single shortcut item.
	 *
	 * @since 1.0.0
	 *
	 * @param array $shortcut Shortcut data.
	 */
	private function render_shortcut_item( $shortcut ) {
		if ( empty( $shortcut['title'] ) || empty( $shortcut['url'] ) ) {
			return;
		}

		$target_attr = ! empty( $shortcut['new_tab'] ) && $shortcut['new_tab'] ? 'target="_blank" rel="noopener noreferrer"' : '';
		?>
		<li class="wds-shortcut-item">
			<a href="<?php echo esc_url( $shortcut['url'] ); ?>"
				<?php echo esc_attr( $target_attr ); ?>
				class="wds-shortcut-link"
				title="<?php echo esc_attr( $shortcut['title'] ); ?>"
			>
				<?php echo esc_html( $shortcut['title'] ); ?>
			</a>
		</li>
		<?php
	}

	/**
	 * Get shortcuts from options.
	 *
	 * @since 1.0.0
	 *
	 * @return array Array of shortcuts.
	 */
	public function get_shortcuts() {
		$shortcuts = get_option( 'wds_shortcuts', [] );

		if ( ! is_array( $shortcuts ) ) {
			return [];
		}

		return $shortcuts;
	}

	/**
	 * Enqueue styles for the shortcuts bar.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_styles() {
		if ( ! is_admin_bar_showing() ) {
			return;
		}

		wp_enqueue_style(
			'wds-shortcuts-style',
			WDS_PLUGIN_URL . 'assets/dist/css/shortcuts.min.css',
			[],
			WDS_VERSION
		);

		wp_enqueue_script(
			'wds-shortcuts-script',
			WDS_PLUGIN_URL . 'assets/dist/js/shortcuts.min.js',
			[ 'jquery' ],
			WDS_VERSION,
			true
		);

		wp_localize_script(
			'wds-shortcuts-script',
			'wdsShortcuts',
			[
				'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
				'nonce'         => wp_create_nonce( 'wds_add_current_page' ),
				'currentUrl'    => esc_url_raw( $this->get_current_url() ),
				'currentTitle'  => $this->get_current_title(),
				'addLabel'      => __( 'Add to Shortcuts', 'wp-dashboard-shortcuts' ),
				'cancelLabel'   => __( 'Cancel', 'wp-dashboard-shortcuts' ),
				'titleLabel'    => __( 'Shortcut Title:', 'wp-dashboard-shortcuts' ),
				'successMsg'    => __( 'Shortcut added successfully!', 'wp-dashboard-shortcuts' ),
				'errorMsg'      => __( 'Error adding shortcut. Please try again.', 'wp-dashboard-shortcuts' ),
				'emptyTitleMsg' => __( 'Please enter a title for the shortcut.', 'wp-dashboard-shortcuts' ),
			]
		);
	}

	/**
	 * Get current page URL.
	 *
	 * @since 1.0.0
	 *
	 * @return string Current URL.
	 */
	private function get_current_url() {
		global $pagenow;

		if ( is_admin() ) {
			$url = admin_url( $pagenow );
			if ( ! empty( $_SERVER['QUERY_STRING'] ) ) {
				$url .= '?' . sanitize_text_field( wp_unslash( $_SERVER['QUERY_STRING'] ) );
			}
			return $url;
		}

		return home_url( add_query_arg( null, null ) );
	}

	/**
	 * Get current page title.
	 *
	 * @since 1.0.0
	 *
	 * @return string Current page title.
	 */
	private function get_current_title() {
		global $pagenow, $title;

		if ( is_admin() ) {
			if ( ! empty( $title ) ) {
				return $title;
			}

			// Try to get admin page title.
			$admin_title = get_admin_page_title();
			if ( $admin_title ) {
				return $admin_title;
			}

			// Fallback to page file name.
			return ucfirst( str_replace( [ '.php', '-' ], [ '', ' ' ], $pagenow ) );
		}

		return wp_get_document_title();
	}

	/**
	 * AJAX handler to add current page to shortcuts.
	 *
	 * @since 1.0.0
	 */
	public function ajax_add_current_page() {
		check_ajax_referer( 'wds_add_current_page', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => __( 'Permission denied.', 'wp-dashboard-shortcuts' ) ] );
		}

		$title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
		$url   = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';

		if ( empty( $title ) || empty( $url ) ) {
			wp_send_json_error( [ 'message' => __( 'Title and URL are required.', 'wp-dashboard-shortcuts' ) ] );
		}

		$shortcuts = get_option( 'wds_shortcuts', [] );
		if ( ! is_array( $shortcuts ) ) {
			$shortcuts = [];
		}

		// Add new shortcut to the end.
		$shortcuts[] = [
			'title'   => $title,
			'url'     => $url,
			'new_tab' => false,
		];

		update_option( 'wds_shortcuts', $shortcuts );

		wp_send_json_success( [ 'message' => __( 'Shortcut added successfully!', 'wp-dashboard-shortcuts' ) ] );
	}

	/**
	 * Add toggle button to the WordPress admin bar.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Admin_Bar $wp_admin_bar WordPress admin bar object.
	 */
	public function add_admin_bar_toggle( $wp_admin_bar ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$wp_admin_bar->add_node([
			'id'    => 'wds-shortcuts-toggle',
			'title' => '<span class="ab-icon dashicons dashicons-visibility" aria-hidden="true"></span><span class="ab-label">' . __( 'Shortcuts', 'wp-dashboard-shortcuts' ) . '</span>',
			'href'  => '#',
			'meta'  => [
				'title' => __( 'Toggle shortcuts bar visibility', 'wp-dashboard-shortcuts' ),
				'class' => 'wds-admin-bar-toggle',
			],
		]);
	}
}
