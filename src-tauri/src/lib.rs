use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri_plugin_dialog::DialogExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_menu = SubmenuBuilder::new(app, "App")
                .about(None)
                .separator()
                .quit()
                .build()?;

            let file_menu = SubmenuBuilder::new(app, "File")
                .item(
                    &MenuItemBuilder::new("Select folder...")
                        .id("select-folder")
                        .accelerator("CmdOrCtrl+O")
                        .build(app)?,
                )
                .build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&app_menu, &file_menu])
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            if event.id() == "select-folder" {
                app.dialog().file().pick_folder(|folder| {
                    if let Some(path) = folder {
                        println!("Carpeta seleccionada: {:?}", path);
                    }
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
