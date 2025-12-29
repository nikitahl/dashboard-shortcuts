<?php
/**
 * Plugin Name:       WP Dashboard Shortcuts
 * Description:       Add custom shortcut links to your WordPress admin bar for quick access to frequently used pages and tools.
 * Version:           1.0.0
 * Author:            Nikita Hlopov
 * Author URI:        https://nikitahl.com
 * Requires PHP:      7.0
 * Requires at least: 6.4
 * License:           GPLv3
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package WP_Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin constants.
 *
 * @since 1.0.0
 */
define( 'WDS_VERSION', '1.0.0' );
define( 'WDS_PLUGIN_FILE', __FILE__ );
define( 'WDS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WDS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WDS_TEXTDOMAIN', 'wp-dashboard-shortcuts' );

require_once WDS_PLUGIN_DIR . 'includes/class-wds-shortcuts.php';
require_once WDS_PLUGIN_DIR . 'admin/class-wds-settings.php';

// Add "Settings" link on the Plugins page.
add_filter( 'plugin_action_links_' . plugin_basename( WDS_PLUGIN_FILE ), 'wds_settings_link' );

/**
 * Add settings link to the Plugins page.
 *
 * @since 1.0.0
 *
 * @param array $links Existing plugin action links.
 * @return array Modified plugin action links.
 */
function wds_settings_link( $links ) {
	$settings_link = '<a href="' . esc_url( admin_url( 'options-general.php?page=wds-settings' ) ) . '">' . esc_html__( 'Settings', 'wp-dashboard-shortcuts' ) . '</a>';
	array_unshift( $links, $settings_link );
	return $links;
}

/**
 * Initialize plugin components.
 */
new WDS_Shortcuts();
new WDS_Settings();
