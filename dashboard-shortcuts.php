<?php
/**
 * Plugin Name:       Dashboard Shortcuts
 * Description:       Add custom shortcut links to your WordPress admin bar for quick access to frequently used pages and tools.
 * Version:           1.1.1
 * Author:            Nikita Hlopov
 * Author URI:        https://nikitahl.com
 * Requires PHP:      7.0
 * Requires at least: 6.4
 * License:           GPLv3
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package Dashboard_Shortcuts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin constants.
 *
 * @since 1.0.0
 */
define( 'DASHSH_VERSION', '1.1.1' );
define( 'DASHSH_PLUGIN_FILE', __FILE__ );
define( 'DASHSH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DASHSH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DASHSH_TEXTDOMAIN', 'dashboard-shortcuts' );

require_once DASHSH_PLUGIN_DIR . 'includes/class-dashsh-shortcuts.php';
require_once DASHSH_PLUGIN_DIR . 'admin/class-dashsh-settings.php';

// Add "Settings" link on the Plugins page.
add_filter( 'plugin_action_links_' . plugin_basename( DASHSH_PLUGIN_FILE ), 'dashsh_settings_link' );

/**
 * Add settings link to the Plugins page.
 *
 * @since 1.0.0
 *
 * @param array $links Existing plugin action links.
 * @return array Modified plugin action links.
 */
function dashsh_settings_link( $links ) {
	$settings_link = '<a href="' . esc_url( admin_url( 'options-general.php?page=dashsh-settings' ) ) . '">' . esc_html__( 'Settings', 'dashboard-shortcuts' ) . '</a>';
	array_unshift( $links, $settings_link );
	return $links;
}

/**
 * Initialize plugin components.
 */
new DASHSH_Shortcuts();
new DASHSH_Settings();
