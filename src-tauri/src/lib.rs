mod models;
mod services;
mod utils;

pub use models::*;
pub use services::*;

use tauri::generate_handler;

#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(generate_handler![
            services::audio::get_audio_files,
            services::audio::save_metadata,
            services::image::convert_image_to_base64,
            greet
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}