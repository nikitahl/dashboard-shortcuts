<?php
/**
 * DS Settings page.
 *
 * @package Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class DS_Settings
 *
 * Handles the settings page for managing shortcuts.
 *
 * @since 1.0.0
 */
class DS_Settings {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
	}

	/**
	 * Add settings page to admin menu.
	 *
	 * @since 1.0.0
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Dashboard Shortcuts', 'dashboard-shortcuts' ),
			__( 'Dashboard Shortcuts', 'dashboard-shortcuts' ),
			'manage_options',
			'ds-settings',
			[ $this, 'render_settings_page' ]
		);
	}

	/**
	 * Register plugin settings.
	 *
	 * @since 1.0.0
	 */
	public function register_settings() {
		register_setting(
			'ds_settings_group',
			'ds_shortcuts',
			[
				'type'              => 'array',
				'sanitize_callback' => [ $this, 'sanitize_shortcuts' ],
				'default'           => [],
			]
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
			return [];
		}

		$sanitized = [];

		foreach ( $input as $shortcut ) {
			$sanitized_item = $this->sanitize_single_shortcut( $shortcut );

			if ( null !== $sanitized_item ) {
				$sanitized[] = $sanitized_item;
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize a single shortcut item.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed $shortcut Raw shortcut data.
	 * @return array|null Sanitized shortcut or null if invalid.
	 */
	private function sanitize_single_shortcut( $shortcut ) {
		if ( ! is_array( $shortcut ) ) {
			return null;
		}

		$sanitized_item = [
			'title'   => isset( $shortcut['title'] ) ? sanitize_text_field( $shortcut['title'] ) : '',
			'url'     => isset( $shortcut['url'] ) ? esc_url_raw( $shortcut['url'] ) : '',
			'new_tab' => isset( $shortcut['new_tab'] ) && 'on' === $shortcut['new_tab'],
		];

		// Only return shortcuts that have both title and URL.
		if ( empty( $sanitized_item['title'] ) || empty( $sanitized_item['url'] ) ) {
			return null;
		}

		return $sanitized_item;
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

		$shortcuts = get_option( 'ds_shortcuts', [] );

		// Ensure we have at least one empty row for new entries.
		if ( empty( $shortcuts ) ) {
			$shortcuts = [
				[
					'title'   => '',
					'url'     => '',
					'new_tab' => false,
				],
			];
		}
		?>
		<div class="wrap ds-settings-wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<p><?php esc_html_e( 'Add custom shortcut links that will appear under the admin bar menu.', 'dashboard-shortcuts' ); ?></p>

			<form method="post" action="options.php" class="ds-settings-form">
				<?php settings_fields( 'ds_settings_group' ); ?>

				<div id="ds-shortcuts-container">
					<?php foreach ( $shortcuts as $index => $shortcut ) : ?>
						<div class="ds-shortcut-row" data-index="<?php echo esc_attr( $index ); ?>">
							<div class="ds-drag-handle" title="<?php esc_attr_e( 'Drag to reorder', 'dashboard-shortcuts' ); ?>">
								<span class="dashicons dashicons-menu" aria-hidden="true"></span>
							</div>
							<div class="ds-shortcut-fields">
								<div class="ds-field">
									<label>
										<?php esc_html_e( 'Title', 'dashboard-shortcuts' ); ?>
										<input
											type="text"
											name="ds_shortcuts[<?php echo esc_attr( $index ); ?>][title]"
											value="<?php echo esc_attr( $shortcut['title'] ); ?>"
											placeholder="<?php esc_attr_e( 'e.g., My Site', 'dashboard-shortcuts' ); ?>"
											class="regular-text"
										/>
									</label>
								</div>
								<div class="ds-field ds-field-url">
									<label>
										<?php esc_html_e( 'URL', 'dashboard-shortcuts' ); ?>
										<div class="ds-url-input-wrapper">
											<input
												type="text"
												name="ds_shortcuts[<?php echo esc_attr( $index ); ?>][url]"
												value="<?php echo esc_attr( $shortcut['url'] ); ?>"
												placeholder="<?php esc_attr_e( 'https://example.com', 'dashboard-shortcuts' ); ?>"
												class="regular-text ds-url-input"
											/>
											<button
													type="button"
													class="button ds-select-url"
													title="<?php esc_attr_e( 'Select from WordPress', 'dashboard-shortcuts' ); ?>"
													aria-label="<?php esc_attr_e( 'Select from WordPress', 'dashboard-shortcuts' ); ?>"
											>
												<span class="dashicons dashicons-admin-links" aria-hidden="true"></span>
											</button>
										</div>
									</label>
								</div>
								<div class="ds-field ds-field-checkbox">
									<label>
										<input
											type="checkbox"
											name="ds_shortcuts[<?php echo esc_attr( $index ); ?>][new_tab]"
											<?php checked( ! empty( $shortcut['new_tab'] ), true ); ?>
										/>
										<?php esc_html_e( 'Open in new tab', 'dashboard-shortcuts' ); ?>
									</label>
								</div>
								<div class="ds-field ds-field-actions">
									<button
											type="button"
											class="button ds-remove-shortcut"
											title="<?php esc_attr_e( 'Remove shortcut', 'dashboard-shortcuts' ); ?>"
											aria-label="<?php esc_attr_e( 'Remove shortcut', 'dashboard-shortcuts' ); ?>"
									>
										<span class="dashicons dashicons-trash" aria-hidden="true"></span>
									</button>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>

				<div class="ds-actions">
					<button type="button" id="ds-add-shortcut" class="button button-secondary">
						<span class="dashicons dashicons-plus-alt2" aria-hidden="true"></span>
						<?php esc_html_e( 'Add Shortcut', 'dashboard-shortcuts' ); ?>
					</button>
				</div>

				<?php submit_button( __( 'Save Shortcuts', 'dashboard-shortcuts' ) ); ?>
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
		if ( 'settings_page_ds-settings' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'ds-admin-style',
			DS_PLUGIN_URL . 'assets/dist/css/admin.min.css',
			[],
			DS_VERSION
		);

		wp_enqueue_script(
			'ds-admin-script',
			DS_PLUGIN_URL . 'assets/dist/js/admin.min.js',
			[ 'jquery', 'jquery-ui-sortable' ],
			DS_VERSION,
			true
		);

		// Add REST API settings for JavaScript.
		wp_localize_script(
			'ds-admin-script',
			'wpApiSettings',
			[
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			]
		);

		wp_localize_script(
			'ds-admin-script',
			'dsSettings',
			[
				'confirmDelete'    => __( 'Are you sure you want to remove this shortcut?', 'dashboard-shortcuts' ),
				'titleLabel'       => __( 'Title', 'dashboard-shortcuts' ),
				'titlePlaceholder' => __( 'e.g., My Site', 'dashboard-shortcuts' ),
				'urlLabel'         => __( 'URL', 'dashboard-shortcuts' ),
				'urlPlaceholder'   => __( 'https://example.com', 'dashboard-shortcuts' ),
				'newTabLabel'      => __( 'Open in new tab', 'dashboard-shortcuts' ),
				'removeLabel'      => __( 'Remove shortcut', 'dashboard-shortcuts' ),
				'selectFromWp'     => __( 'Select from WordPress', 'dashboard-shortcuts' ),
				'dragToReorder'    => __( 'Drag to reorder', 'dashboard-shortcuts' ),
				'close'            => __( 'Close', 'dashboard-shortcuts' ),
			]
		);
	}
}
