<?php
/**
 * DASHSH Settings page.
 *
 * @package Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class DASHSH_Settings
 *
 * Handles the settings page for managing shortcuts.
 *
 * @since 1.0.0
 */
class DASHSH_Settings {

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
			'dashsh-settings',
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
			'dashsh_settings_group',
			'dashsh_shortcuts',
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

		$shortcuts = get_option( 'dashsh_shortcuts', [] );

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
		<div class="wrap dashsh-settings-wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<p><?php esc_html_e( 'Add custom shortcut links that will appear under the admin bar menu.', 'dashboard-shortcuts' ); ?></p>

			<form method="post" action="options.php" class="dashsh-settings-form">
				<?php settings_fields( 'dashsh_settings_group' ); ?>

				<div id="dashsh-shortcuts-container">
					<?php foreach ( $shortcuts as $index => $shortcut ) : ?>
						<div class="dashsh-shortcut-row" data-index="<?php echo esc_attr( $index ); ?>">
							<div class="dashsh-drag-handle" title="<?php esc_attr_e( 'Drag to reorder', 'dashboard-shortcuts' ); ?>">
								<span class="dashicons dashicons-menu" aria-hidden="true"></span>
							</div>
							<div class="dashsh-shortcut-fields">
								<div class="dashsh-field">
									<label>
										<?php esc_html_e( 'Title', 'dashboard-shortcuts' ); ?>
										<input
											type="text"
											name="dashsh_shortcuts[<?php echo esc_attr( $index ); ?>][title]"
											value="<?php echo esc_attr( $shortcut['title'] ); ?>"
											placeholder="<?php esc_attr_e( 'e.g., My Site', 'dashboard-shortcuts' ); ?>"
											class="regular-text"
										/>
									</label>
								</div>
								<div class="dashsh-field dashsh-field-url">
									<label>
										<?php esc_html_e( 'URL', 'dashboard-shortcuts' ); ?>
										<div class="dashsh-url-input-wrapper">
											<input
												type="text"
												name="dashsh_shortcuts[<?php echo esc_attr( $index ); ?>][url]"
												value="<?php echo esc_attr( $shortcut['url'] ); ?>"
												placeholder="<?php esc_attr_e( 'https://example.com', 'dashboard-shortcuts' ); ?>"
												class="regular-text dashsh-url-input"
											/>
											<button
													type="button"
													class="button dashsh-select-url"
													title="<?php esc_attr_e( 'Select from WordPress', 'dashboard-shortcuts' ); ?>"
													aria-label="<?php esc_attr_e( 'Select from WordPress', 'dashboard-shortcuts' ); ?>"
											>
												<span class="dashicons dashicons-admin-links" aria-hidden="true"></span>
											</button>
										</div>
									</label>
								</div>
								<div class="dashsh-field dashsh-field-checkbox">
									<label>
										<input
											type="checkbox"
											name="dashsh_shortcuts[<?php echo esc_attr( $index ); ?>][new_tab]"
											<?php checked( ! empty( $shortcut['new_tab'] ), true ); ?>
										/>
										<?php esc_html_e( 'Open in new tab', 'dashboard-shortcuts' ); ?>
									</label>
								</div>
								<div class="dashsh-field dashsh-field-actions">
									<button
											type="button"
											class="button dashsh-remove-shortcut"
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

				<div class="dashsh-actions">
					<button type="button" id="dashsh-add-shortcut" class="button button-secondary">
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
		if ( 'settings_page_dashsh-settings' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'dashsh-admin-style',
			DASHSH_PLUGIN_URL . 'assets/css/admin.min.css',
			[],
			DASHSH_VERSION
		);

		wp_enqueue_script(
			'dashsh-admin-script',
			DASHSH_PLUGIN_URL . 'assets/js/admin.min.js',
			[ 'jquery', 'jquery-ui-sortable' ],
			DASHSH_VERSION,
			true
		);

		// Add REST API settings for JavaScript.
		wp_localize_script(
			'dashsh-admin-script',
			'dashshApiSettings',
			[
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			]
		);

		wp_localize_script(
			'dashsh-admin-script',
			'dashshSettings',
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
