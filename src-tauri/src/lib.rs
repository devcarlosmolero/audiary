use base64::{engine::general_purpose, Engine as _};
use lofty::Accessor;
use lofty::AudioFile as LoftyAudioFile;
use lofty::Probe;
use lofty::TaggedFileExt;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri_plugin_dialog::DialogExt;

/// Convert an image file to base64 data URL
fn convert_image_to_base64_internal(image_path: &Path) -> Result<String, String> {
    use std::fs;

    if !image_path.exists() {
        return Err("Image file does not exist".to_string());
    }

    let image_data = fs::read(image_path)
        .map_err(|e| format!("Failed to read image file: {:?}", e))?;

    let base64_data = general_purpose::STANDARD.encode(&image_data);

    let mime_type = if let Some(extension) = image_path.extension() {
        match extension.to_string_lossy().to_lowercase().as_str() {
            "jpg" | "jpeg" => "image/jpeg",
            "png" => "image/png",
            "gif" => "image/gif",
            _ => "application/octet-stream",
        }
    } else {
        "application/octet-stream"
    };

    Ok(format!("data:{};base64,{}", mime_type, base64_data))
}

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
    metadata: Option<AudioMetadata>,
}

#[derive(Serialize, Deserialize)]
struct AudioMetadata {
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    genre: Option<String>,
    year: Option<String>,
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
        .invoke_handler(tauri::generate_handler![get_audio_files, save_metadata, convert_image_to_base64])
        .on_menu_event(|app, event| {
            if event.id() == "select-folder" {
                app.dialog().file().pick_folder(|folder| {
                if let Some(_path) = folder {
                    
                }
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

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

            if file_name_str.starts_with('.') {
                continue;
            }

            if let Some(extension) = entry_path.extension() {
                let extension_str = extension.to_string_lossy().to_lowercase();
                if ["mp3", "wav", "flac", "ogg", "m4a", "aac"].contains(&extension_str.as_str()) {
                     let metadata = match std::fs::metadata(&entry_path) {
                         Ok(m) => m,
                         Err(_) => {
                             continue;
                         }
                     };
                    let size_mb = metadata.len() as f64 / (1024.0 * 1024.0);

                      let (bitrate, album_cover, metadata) = match Probe::open(&entry_path) {
                         Ok(probe) => match probe.read() {
                             Ok(tagged_file) => {
                                 let bitrate =
                                     tagged_file.properties().overall_bitrate().map(|b| b as u32);

                                  let album_cover = tagged_file
                                      .primary_tag()
                                      .and_then(|tag: &lofty::Tag| {
                                          tag.pictures().first()
                                      })
                                     .and_then(|picture: &lofty::Picture| {
                                         let mime_type = picture.mime_type().map(|m| m.to_string());
                                         if let Some(mime) = &mime_type {
                                             if mime == "image/jpeg" || mime == "image/png" || mime == "image/gif" {
                                                 return Some(format!(
                                                     "data:{};base64,{}",
                                                     mime,
                                                     general_purpose::STANDARD
                                                         .encode(picture.data())
                                                 ));
                                             }
                                         }
                                         None
                                     });

                                  let metadata = tagged_file.primary_tag().map(|tag: &lofty::Tag| {
                                      AudioMetadata {
                                          title: tag.title().map(|t: std::borrow::Cow<str>| t.to_string()),
                                          artist: tag.artist().map(|a: std::borrow::Cow<str>| a.to_string()),
                                          album: tag.album().map(|a: std::borrow::Cow<str>| a.to_string()),
                                          genre: tag.genre().map(|g: std::borrow::Cow<str>| g.to_string()),
                                          year: tag.year().map(|y: u32| y.to_string()),
                                      }
                                  });

                                 (bitrate, album_cover, metadata)
                             }
                             Err(_e) => {
                                 (None, None, None)
                             }
                         },
                         Err(_e) => {
                             (None, None, None)
                         }
                     };

                      audio_files.push(AudioFile {
                          name: file_name_str.into_owned(),
                          path: entry_path.to_string_lossy().into_owned(),
                          extension: extension_str,
                          bitrate,
                          size_mb,
                          album_cover: album_cover.clone(),
                          metadata,
                      });
                }
            }
        }
    }

    Ok(audio_files)
}

#[derive(Serialize, Deserialize)]
struct SongMetadata {
    #[serde(rename = "filePath")]
    file_path: String,
    title: String,
    artist: String,
    album: String,
    #[serde(rename = "releaseDate")]
    release_date: Option<String>,
    genre: Option<String>,
    #[serde(rename = "albumCover")]
    album_cover: Option<String>,
    #[serde(rename = "albumCoverPath")]
    album_cover_path: Option<String>,
}

#[tauri::command]
async fn save_metadata(metadata: SongMetadata) -> Result<(), String> {
    use lofty::Accessor;

    let path = Path::new(&metadata.file_path);

    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    let mut tagged_file = Probe::open(path)
        .map_err(|e| {
            format!("Failed to open file: {:?}", e)
        })?
        .read()
        .map_err(|e| {
            format!("Failed to read audio file: {:?}", e)
        })?;

    let tag = if let Some(tag) = tagged_file.primary_tag_mut() {
        tag
    } else {
        let new_tag = lofty::Tag::new(lofty::TagType::Id3v2);
        tagged_file.insert_tag(new_tag);
        tagged_file
            .primary_tag_mut()
            .ok_or("Failed to create or access tag")?
    };

    tag.set_title(metadata.title);
    tag.set_artist(metadata.artist);
    tag.set_album(metadata.album);

    if let Some(date) = metadata.release_date {
        if let Ok(year) = date.parse::<u32>() {
            tag.set_year(year);
        }
    }

    if let Some(genre) = metadata.genre {
        tag.set_genre(genre);
    }

    // Handle album cover - either as base64 data or as a file path
    let album_cover_data = if let Some(album_cover) = metadata.album_cover {
        // If we already have base64 data, use it directly
        if !album_cover.is_empty() && album_cover.starts_with("data:") {
            Some(album_cover)
        } else {
            None
        }
    } else if let Some(album_cover_path) = metadata.album_cover_path {
        // If we have a file path, convert it to base64
        let image_path = Path::new(&album_cover_path);
        match convert_image_to_base64_internal(image_path) {
            Ok(base64_data) => Some(base64_data),
            Err(_) => None,
        }
    } else {
        None
    };

    if let Some(album_cover) = album_cover_data {
        if let Ok(data) = general_purpose::STANDARD.decode(album_cover.split(',').nth(1).unwrap_or("")) {
            use lofty::Picture;
            use lofty::PictureType;
            use lofty::MimeType;

            let mime_type = if album_cover.starts_with("data:image/jpeg;") {
                Some(MimeType::Jpeg)
            } else if album_cover.starts_with("data:image/png;") {
                Some(MimeType::Png)
            } else if album_cover.starts_with("data:image/gif;") {
                Some(MimeType::Gif)
            } else {
                None
            };

            tag.remove_picture_type(PictureType::CoverFront);

            let picture = Picture::new_unchecked(
                PictureType::CoverFront,
                mime_type.clone(),
                None,
                data,
            );

            tag.push_picture(picture);
        }
    }

    tagged_file
        .save_to_path(path)
        .map_err(|e| format!("Failed to save metadata: {:?}", e))?;

    Ok(())
}

#[tauri::command]
async fn convert_image_to_base64(path: String) -> Result<String, String> {
    let image_path = Path::new(&path);
    convert_image_to_base64_internal(image_path)
}


