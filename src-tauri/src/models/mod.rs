use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SongMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    #[serde(rename = "releaseDate")]
    pub release_date: String,
    pub genre: Option<String>,
    #[serde(rename = "albumCover")]
    pub album_cover: Option<String>,
    #[serde(rename = "albumCoverPath")]
    pub album_cover_path: Option<String>,
    #[serde(rename = "filePath")]
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AudioFile {
    pub name: String,
    pub path: String,
    pub extension: String,
    pub bitrate: Option<i32>,
    #[serde(rename = "sizeMb")]
    pub size_mb: f64,
    #[serde(rename = "albumCover")]
    pub album_cover: Option<String>,
    pub metadata: Option<SongMetadata>,
}
