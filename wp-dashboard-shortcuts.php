<?php
/**
 * Plugin Name:       WP Dashboard Shortcuts
 * Plugin URI:        https://github.com/nikitahl/wp-dashboard-shortcuts
 * Description:       A HUD menu bar under the admin bar that displays custom shortcut links configured in the settings page.
 * Version:           1.0.0
 * Author:            Nikita Hlopov
 * Author URI:        https://nikitahl.com
 * Requires PHP:      7.0
 * Requires at least: 6.4
 * License:           GPLv3
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       wp-dashboard-shortcuts
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

/**
 * Initialize plugin.
 *
 * @since 1.0.0
 */
function wds_init_plugin() {
	load_plugin_textdomain( 'wp-dashboard-shortcuts', false, dirname( plugin_basename( WDS_PLUGIN_FILE ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'wds_init_plugin' );

/**
 * Initialize plugin components.
 */
new WDS_Shortcuts();
new WDS_Settings();
