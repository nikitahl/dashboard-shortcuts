<?php
/**
 * WDS Settings page.
 *
 * @package WP_Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WDS_Settings
 *
 * Handles the settings page for managing shortcuts.
 *
 * @since 1.0.0
 */
class WDS_Settings {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Add settings page to admin menu.
	 *
	 * @since 1.0.0
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Dashboard Shortcuts', 'wp-dashboard-shortcuts' ),
			__( 'Dashboard Shortcuts', 'wp-dashboard-shortcuts' ),
			'manage_options',
			'wds-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register plugin settings.
	 *
	 * @since 1.0.0
	 */
	public function register_settings() {
		register_setting(
			'wds_settings_group',
			'wds_shortcuts',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_shortcuts' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize shortcuts data.
	 *
	 * @since 1.0.0
	 *
	 * @param array $input Raw input data.
	 * @return array Sanitized data.
	 */
	public function sanitize_shortcuts( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $input as $shortcut ) {
			if ( ! is_array( $shortcut ) ) {
				continue;
			}

			$sanitized_item = array(
				'title'   => isset( $shortcut['title'] ) ? sanitize_text_field( $shortcut['title'] ) : '',
				'url'     => isset( $shortcut['url'] ) ? esc_url_raw( $shortcut['url'] ) : '',
				'new_tab' => isset( $shortcut['new_tab'] ) && $shortcut['new_tab'] === 'on',
			);

			// Only add shortcuts that have both title and URL.
			if ( ! empty( $sanitized_item['title'] ) && ! empty( $sanitized_item['url'] ) ) {
				$sanitized[] = $sanitized_item;
			}
		}

		return $sanitized;
	}

	/**
	 * Render settings page.
	 *
	 * @since 1.0.0
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$shortcuts = get_option( 'wds_shortcuts', array() );

		// Ensure we have at least one empty row for new entries.
		if ( empty( $shortcuts ) ) {
			$shortcuts = array(
				array(
					'title'   => '',
					'url'     => '',
					'new_tab' => false,
				),
			);
		}
		?>
		<div class="wrap wds-settings-wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<p><?php esc_html_e( 'Add custom shortcut links that will appear in the admin bar menu.', 'wp-dashboard-shortcuts' ); ?></p>

			<form method="post" action="options.php" class="wds-settings-form">
				<?php settings_fields( 'wds_settings_group' ); ?>

				<div id="wds-shortcuts-container">
					<?php foreach ( $shortcuts as $index => $shortcut ) : ?>
						<div class="wds-shortcut-row" data-index="<?php echo esc_attr( $index ); ?>">
							<div class="wds-drag-handle" title="<?php esc_attr_e( 'Drag to reorder', 'wp-dashboard-shortcuts' ); ?>">
								<span class="dashicons dashicons-menu"></span>
							</div>
							<div class="wds-shortcut-fields">
								<div class="wds-field">
									<label>
										<?php esc_html_e( 'Title', 'wp-dashboard-shortcuts' ); ?>
										<input
											type="text"
											name="wds_shortcuts[<?php echo esc_attr( $index ); ?>][title]"
											value="<?php echo esc_attr( $shortcut['title'] ); ?>"
											placeholder="<?php esc_attr_e( 'e.g., My Site', 'wp-dashboard-shortcuts' ); ?>"
											class="regular-text"
										/>
									</label>
								</div>
								<div class="wds-field">
									<label>
										<?php esc_html_e( 'URL', 'wp-dashboard-shortcuts' ); ?>
										<input
											type="url"
											name="wds_shortcuts[<?php echo esc_attr( $index ); ?>][url]"
											value="<?php echo esc_attr( $shortcut['url'] ); ?>"
											placeholder="<?php esc_attr_e( 'https://example.com', 'wp-dashboard-shortcuts' ); ?>"
											class="regular-text"
										/>
									</label>
								</div>
								<div class="wds-field wds-field-checkbox">
									<label>
										<input
											type="checkbox"
											name="wds_shortcuts[<?php echo esc_attr( $index ); ?>][new_tab]"
											<?php checked( ! empty( $shortcut['new_tab'] ), true ); ?>
										/>
										<?php esc_html_e( 'Open in new tab', 'wp-dashboard-shortcuts' ); ?>
									</label>
								</div>
								<div class="wds-field wds-field-actions">
									<button type="button" class="button wds-remove-shortcut" aria-label="<?php esc_attr_e( 'Remove shortcut', 'wp-dashboard-shortcuts' ); ?>">
										<span class="dashicons dashicons-trash"></span>
									</button>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>

				<div class="wds-actions">
					<button type="button" id="wds-add-shortcut" class="button button-secondary">
						<span class="dashicons dashicons-plus-alt2"></span>
						<?php esc_html_e( 'Add Shortcut', 'wp-dashboard-shortcuts' ); ?>
					</button>
				</div>

				<?php submit_button( __( 'Save Shortcuts', 'wp-dashboard-shortcuts' ) ); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_assets( $hook ) {
		if ( 'settings_page_wds-settings' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'wds-admin-style',
			WDS_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			WDS_VERSION
		);

		wp_enqueue_script(
			'wds-admin-script',
			WDS_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery', 'jquery-ui-sortable' ),
			WDS_VERSION,
			true
		);

		wp_localize_script(
			'wds-admin-script',
			'wdsSettings',
			array(
				'confirmDelete'     => __( 'Are you sure you want to remove this shortcut?', 'wp-dashboard-shortcuts' ),
				'titleLabel'        => __( 'Title', 'wp-dashboard-shortcuts' ),
				'titlePlaceholder'  => __( 'e.g., My Site', 'wp-dashboard-shortcuts' ),
				'urlLabel'          => __( 'URL', 'wp-dashboard-shortcuts' ),
				'urlPlaceholder'    => __( 'https://example.com', 'wp-dashboard-shortcuts' ),
				'newTabLabel'       => __( 'Open in new tab', 'wp-dashboard-shortcuts' ),
				'removeLabel'       => __( 'Remove shortcut', 'wp-dashboard-shortcuts' ),
			)
		);
	}
}

