export interface SongMetadata {
  title: string;
  artist: string;
  album: string;
  releaseDate: string;
  genre?: string;
  albumCover?: string;
  albumCoverPath?: string;
  filePath?: string;
}

export interface AudioFile {
  name: string;
  path: string;
  extension: string;
  bitrate: number | null;
  sizeMb: number;
  albumCover?: string;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
  };
}
