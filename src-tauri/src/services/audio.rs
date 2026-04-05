use crate::models::{AudioFile, SongMetadata};
use base64::{engine::general_purpose, Engine as _};
use id3::{Tag, TagLike, Version};
use lofty::file::AudioFile as LoftyAudioFile;
use lofty::probe::Probe;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[tauri::command]
pub async fn get_audio_files(folder_path: &str) -> Result<Vec<AudioFile>, String> {
    let mut audio_files = Vec::new();

    for entry in WalkDir::new(folder_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        let path = entry.path();
        
        if let Some(file_name) = path.file_name() {
            let file_name_str = file_name.to_string_lossy();
            if file_name_str.starts_with('.') {
                continue;
            }
        }
        
        if let Some(extension) = path.extension() {
            let ext = extension.to_string_lossy().to_lowercase();
            if ext == "mp3" {
                if let Ok(audio_file) = process_mp3_file(path).await {
                    audio_files.push(audio_file);
                }
            }
        }
    }

    Ok(audio_files)
}

async fn process_mp3_file(path: &Path) -> Result<AudioFile, String> {
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();
    
    let extension = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();
    
    let metadata = fs::metadata(path).map_err(|e| format!("Failed to read file metadata: {}", e))?;
    let size_mb = metadata.len() as f64 / (1024.0 * 1024.0);
    
    let bitrate = match Probe::open(path) {
        Ok(probed) => match probed.read() {
            Ok(tagged_file) => {
                log::debug!("Successfully read audio file: {}", path.display());
                tagged_file.properties().audio_bitrate().map(|br| {
                    log::debug!("Found bitrate: {} kbps", br);
                    br as i32
                })
            }
            Err(e) => {
                log::error!("Failed to read audio file {}: {}", path.display(), e);
                None
            }
        },
        Err(e) => {
            log::error!("Failed to probe audio file {}: {}", path.display(), e);
            None
        }
    };
    
    log::debug!("Final bitrate for {}: {:?}", path.display(), bitrate);
    
    let tag = Tag::read_from_path(path).unwrap_or_else(|_| Tag::new());
    
    let title = tag.title().unwrap_or_default().to_string();
    let artist = tag.artist().unwrap_or_default().to_string();
    let album = tag.album().unwrap_or_default().to_string();
    let genre = tag.genre().map(|s: &str| s.to_string());
    let year = tag.year().map(|y: i32| y.to_string()).unwrap_or_default();
    
    let album_cover = tag.pictures().next().and_then(|pic| {
        let mime_type = &pic.mime_type;
        let data = pic.data.clone();
        let base64 = general_purpose::STANDARD.encode(&data);
        let data_url = format!("data:{};base64,{}", mime_type, base64);
        Some(data_url)
    });

    let song_metadata = SongMetadata {
        title,
        artist,
        album,
        release_date: year,
        genre,
        album_cover: album_cover.clone(),
        album_cover_path: None,
        file_path: path.to_string_lossy().into_owned(),
    };

    Ok(AudioFile {
        name,
        path: path.to_string_lossy().into_owned(),
        extension,
        bitrate,
        size_mb,
        album_cover: album_cover,
        metadata: Some(song_metadata),
    })
}

#[tauri::command]
pub async fn save_metadata(metadata: SongMetadata) -> Result<(), String> {
    let path = Path::new(&metadata.file_path);
    
    let mut tag = Tag::new();
    
    if !metadata.title.is_empty() {
        tag.set_title(&metadata.title);
    }
    
    if !metadata.artist.is_empty() {
        tag.set_artist(&metadata.artist);
    }
    
    if !metadata.album.is_empty() {
        tag.set_album(&metadata.album);
    }
    
    if !metadata.release_date.is_empty() {
        if let Ok(year) = metadata.release_date.parse::<i32>() {
            tag.set_year(year);
        }
    }
    
    if let Some(ref genre) = metadata.genre {
        if !genre.is_empty() {
            tag.set_genre(genre);
        }
    }
    
    if let Some(ref album_cover) = metadata.album_cover {
        if album_cover.starts_with("data:image/") {
            if let Some(comma_pos) = album_cover.find(',') {
                let base64_data = &album_cover[comma_pos + 1..];
                if let Ok(image_data) = general_purpose::STANDARD.decode(base64_data) {
                    let mime_type = "image/jpeg";
                    let picture = id3::frame::Picture {
                        mime_type: mime_type.to_string(),
                        picture_type: id3::frame::PictureType::CoverFront,
                        description: "Cover".to_string(),
                        data: image_data,
                    };
                    let frame = id3::Frame::with_content("APIC", id3::frame::Content::Picture(picture));
                    tag.add_frame(frame);
                }
            }
        }
    } else if let Some(ref album_cover_path) = metadata.album_cover_path {
        if let Ok(img) = fs::read(album_cover_path) {
            let picture = id3::frame::Picture {
                mime_type: "image/jpeg".to_string(),
                picture_type: id3::frame::PictureType::CoverFront,
                description: "Cover".to_string(),
                data: img,
            };
            let frame = id3::Frame::with_content("APIC", id3::frame::Content::Picture(picture));
            tag.add_frame(frame);
        }
    }
    
    tag.write_to_path(path, Version::Id3v24)
        .map_err(|e| format!("Failed to write metadata: {}", e))?;
    
    Ok(())
}