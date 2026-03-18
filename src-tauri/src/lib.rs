use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri_plugin_dialog::DialogExt;
use lofty::AudioFile as LoftyAudioFile;
use lofty::Probe;
use lofty::TaggedFileExt;
use serde::{Serialize, Deserialize};
use base64::{Engine as _, engine::general_purpose};

#[derive(Serialize, Deserialize)]
struct AudioFile {
    name: String,
    path: String,
    extension: String,
    bitrate: Option<u32>,
    #[serde(rename = "sizeMb")]
    size_mb: f64,
    #[serde(rename = "albumCover")]
    album_cover: Option<String>,
}

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
        .invoke_handler(tauri::generate_handler![get_audio_files])
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

#[tauri::command]
async fn get_audio_files(folder_path: String) -> Result<Vec<AudioFile>, String> {
    let path = std::path::Path::new(&folder_path);
    let mut audio_files = Vec::new();

    if !path.exists() {
        return Err("Folder does not exist".to_string());
    }

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let file_name = entry.file_name();
            let file_name_str = file_name.to_string_lossy();
            
            // Skip hidden files (files starting with .)
            if file_name_str.starts_with('.') {
                continue;
            }
            
            if let Some(extension) = entry_path.extension() {
                let extension_str = extension.to_string_lossy().to_lowercase();
                if ["mp3", "wav", "flac", "ogg", "m4a", "aac"].contains(&extension_str.as_str()) {
                    let metadata = match std::fs::metadata(&entry_path) {
                        Ok(m) => m,
                        Err(e) => {
                            eprintln!("Error getting metadata for file {}: {:?}", entry_path.display(), e);
                            continue;
                        }
                    };
                    let size_mb = metadata.len() as f64 / (1024.0 * 1024.0);
                    
                     let (bitrate, album_cover) = match Probe::open(&entry_path) {
                         Ok(probe) => match probe.read() {
                             Ok(tagged_file) => {
                                 let bitrate = tagged_file.properties().overall_bitrate().map(|b| b as u32);
                                 
                                 // Extract album cover if available
                                 let album_cover = tagged_file.primary_tag()
                                     .and_then(|tag: &lofty::Tag| tag.pictures().first())
                                     .and_then(|picture: &lofty::Picture| {
                                         let mime_type = picture.mime_type().map(|m| m.to_string());
                                         if let Some(mime) = &mime_type {
                                             if mime == "image/jpeg" || mime == "image/png" {
                                                 return Some(format!("data:{};base64,{}", mime, general_purpose::STANDARD.encode(picture.data())));
                                             }
                                         }
                                         None
                                     });
                                 
                                 (bitrate, album_cover)
                             }
                             Err(e) => {
                                 eprintln!("Error reading file {}: {:?}", entry_path.display(), e);
                                 (None, None)
                             }
                         },
                         Err(e) => {
                             eprintln!("Error probing file {}: {:?}", entry_path.display(), e);
                             (None, None)
                         }
                     };

                     audio_files.push(AudioFile {
                         name: file_name_str.into_owned(),
                         path: entry_path.to_string_lossy().into_owned(),
                         extension: extension_str,
                         bitrate,
                         size_mb,
                         album_cover,
                     });
                }
            }
        }
    }

    Ok(audio_files)
}
}
