mod commands;
mod db;
mod models;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");

            std::fs::create_dir_all(&app_data).expect("failed to create app data directory");
            let db_path = app_data.join("gpos.db");
            let db_str = db_path.to_string_lossy().to_string();

            let pool = tauri::async_runtime::block_on(db::init(&db_str));
            app.manage(pool);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::items::list_items,
            commands::items::create_item,
            commands::items::update_item,
            commands::items::delete_item,
            commands::items::list_categories,
            commands::items::create_category,
            commands::items::update_category,
            commands::items::delete_category,
            commands::orders::create_order,
            commands::orders::list_orders,
            commands::orders::get_order,
            commands::orders::orders_today,
            commands::reports::daily_report,
            commands::reports::reset_all_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
