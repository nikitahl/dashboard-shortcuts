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
		add_action( 'admin_bar_menu', array( $this, 'add_shortcuts_to_admin_bar' ), 100 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Add shortcuts to admin bar.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Admin_Bar $wp_admin_bar Admin bar instance.
	 */
	public function add_shortcuts_to_admin_bar( $wp_admin_bar ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$shortcuts = $this->get_shortcuts();

		if ( empty( $shortcuts ) ) {
			return;
		}

		// Add parent menu item.
		$wp_admin_bar->add_node(
			array(
				'id'    => 'wds-shortcuts',
				'title' => '<span class="ab-icon dashicons dashicons-star-filled"></span><span class="ab-label">' . esc_html__( 'Shortcuts', 'wp-dashboard-shortcuts' ) . '</span>',
				'href'  => false,
				'meta'  => array(
					'class' => 'wds-shortcuts-menu',
				),
			)
		);

		// Add each shortcut as a menu item.
		foreach ( $shortcuts as $index => $shortcut ) {
			if ( empty( $shortcut['title'] ) || empty( $shortcut['url'] ) ) {
				continue;
			}

			$wp_admin_bar->add_node(
				array(
					'id'     => 'wds-shortcut-' . $index,
					'parent' => 'wds-shortcuts',
					'title'  => esc_html( $shortcut['title'] ),
					'href'   => esc_url( $shortcut['url'] ),
					'meta'   => array(
						'target' => ! empty( $shortcut['new_tab'] ) ? '_blank' : '_self',
						'class'  => 'wds-shortcut-item',
					),
				)
			);
		}
	}

	/**
	 * Get shortcuts from options.
	 *
	 * @since 1.0.0
	 *
	 * @return array Array of shortcuts.
	 */
	public function get_shortcuts() {
		$shortcuts = get_option( 'wds_shortcuts', array() );

		if ( ! is_array( $shortcuts ) ) {
			return array();
		}

		return $shortcuts;
	}

	/**
	 * Enqueue styles for the HUD menu.
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
			array(),
			WDS_VERSION
		);
	}
}

