<?php
/**
 * Uninstall Dashboard Shortcuts plugin.
 *
 * @package Dashboard_Shortcuts
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
// Delete plugin options from the database.
delete_option( 'dashsh_shortcuts' );
delete_site_option( 'dashsh_shortcuts' );
