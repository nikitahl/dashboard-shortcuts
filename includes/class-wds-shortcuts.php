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

		if ( empty( $shortcuts ) ) {
			return;
		}

		?>
		<div id="wds-shortcuts-bar" class="wds-shortcuts-bar">
			<div class="wds-shortcuts-container">
				<span class="wds-shortcuts-label">
					<span class="dashicons dashicons-star-filled"></span>
					<?php esc_html_e( 'Shortcuts:', 'wp-dashboard-shortcuts' ); ?>
				</span>
				<ul class="wds-shortcuts-list">
					<?php foreach ( $shortcuts as $index => $shortcut ) : ?>
						<?php
						if ( empty( $shortcut['title'] ) || empty( $shortcut['url'] ) ) {
							continue;
						}
						?>
						<li class="wds-shortcut-item">
							<a href="<?php echo esc_url( $shortcut['url'] ); ?>"
								<?php echo ! empty( $shortcut['new_tab'] ) ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
								class="wds-shortcut-link">
								<?php echo esc_html( $shortcut['title'] ); ?>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>
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
			WDS_PLUGIN_URL . 'assets/css/shortcuts.css',
			[],
			WDS_VERSION
		);
	}
}
