import { invoke } from "@tauri-apps/api/core";
import cn from "classnames";
import { Ellipsis, ListChecks } from "lucide-react";
import { useState } from "react";

import Button from "./components/atoms/Button";
import Dropzone from "./components/organisms/Dropzone";
import List from "./components/organisms/List";
import SongForm from "./components/organisms/SongForm";
import { SongMetadata, AudioFile } from "./types";

function App() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongMetadata | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [previousAlbumCover, setPreviousAlbumCover] = useState<string | undefined>(undefined);

  const handleSongSelect = (file: AudioFile, index: number) => {
    const metadata = file.metadata || {};

    const title = metadata.title || "";
    const artist = metadata.artist || "";
    const album = metadata.album || "";
    const genre = metadata.genre || undefined;
    const releaseDate = metadata.year || "";

    setSelectedSong({
      title,
      artist,
      album,
      releaseDate,
      genre,
      albumCover: file.albumCover,
      filePath: file.path,
    });
    setSelectedFileIndex(index);
    setPreviousAlbumCover(file.albumCover);
  };

  const handleFilesSelected = (files: AudioFile[]) => {
    setAudioFiles(files);

    if (files.length > 0) {
      handleSongSelect(files[0], 0);
    }
  };

  const handleClearAlbumCover = () => {
    if (selectedFileIndex === null || !selectedSong) return;

    setSelectedSong({
      ...selectedSong,
      albumCover: undefined,
    });

    setAudioFiles((prevFiles) => {
      return prevFiles.map((file, index) => {
        if (index === selectedFileIndex) {
          return {
            ...file,
            albumCover: undefined,
          };
        }
        return file;
      });
    });

    const updatedMetadata: SongMetadata = {
      ...selectedSong,
      albumCover: undefined,
      filePath: selectedSong.filePath,
    };

    setPreviousAlbumCover(undefined);
    invoke("save_metadata", { metadata: updatedMetadata }).catch((error) => {
      console.error("Failed to clear album cover:", error);
    });
  };

  const handleFieldChange = (field: keyof SongMetadata) => (value: string) => {
    if (selectedSong) {
      setSelectedSong({
        ...selectedSong,
        [field]: value,
      });
    }
  };

  const handleFieldBlur = (field: keyof SongMetadata) => () => {
    if (!selectedSong || selectedFileIndex === null) return;

    const updatedMetadata: SongMetadata = {
      ...selectedSong,
      [field]: selectedSong[field] || "",
    };

    invoke("save_metadata", { metadata: updatedMetadata })
      .then(() => {
        setAudioFiles((prevFiles) => {
          return prevFiles.map((file, index) => {
            if (index === selectedFileIndex) {
              return {
                ...file,
                metadata: {
                  ...file.metadata,
                  [field]: updatedMetadata[field],
                },
              };
            }
            return file;
          });
        });
      })
      .catch((error) => {
        console.error("Failed to save metadata:", error);
      });
  };

  const handleImageUpload = (imageData: string, imagePath?: string) => {
    if (!selectedSong || selectedFileIndex === null) return;

    if (imageData === previousAlbumCover) {
      return;
    }

    setSelectedSong({
      ...selectedSong,
      albumCover: imageData,
    });

    setAudioFiles((prevFiles) => {
      return prevFiles.map((file, index) => {
        if (index === selectedFileIndex) {
          return {
            ...file,
            albumCover: imageData,
          };
        }
        return file;
      });
    });

    const updatedMetadata: SongMetadata = {
      ...selectedSong,
      albumCover: imageData,
      albumCoverPath: imagePath,
      filePath: selectedSong.filePath,
    };

    setPreviousAlbumCover(imageData);
    invoke("save_metadata", { metadata: updatedMetadata }).catch((error) => {
      console.error("Failed to save album cover:", error);
    });
  };

  const handlePropagate = () => {
    if (!selectedSong || selectedFileIndex === null) return;

    const { artist, album, releaseDate, genre, albumCover } = selectedSong;

    setAudioFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file, index) => {
        if (index === selectedFileIndex) return file;

        return {
          ...file,
          albumCover: albumCover,
          metadata: {
            ...file.metadata,
            artist: artist,
            album: album,
            year: releaseDate,
            genre: genre,
          },
        };
      });

      updatedFiles.forEach((file, index) => {
        if (index === selectedFileIndex) return;

        const updatedMetadata: SongMetadata = {
          title: file.metadata?.title || "",
          artist: artist,
          album: album,
          releaseDate: releaseDate,
          genre: genre,
          albumCover: albumCover,
          filePath: file.path,
        };

        invoke("save_metadata", { metadata: updatedMetadata }).catch((error) => {
          console.error(`Failed to propagate metadata to file ${file.path}:`, error);
        });
      });

      return updatedFiles;
    });
  };

  return (
    <div className="h-screen py-4 overflow-x-hidden">
      <div className="flex items-start gap-4 w-full h-full">
        <div className="w-[75%] h-full pl-4 flex flex-col gap-4">
          {audioFiles.length === 0 && (
            <Dropzone label="Select a folder to start" onFilesSelected={handleFilesSelected} />
          )}
          <List
            className={`${cn("transition-opacity duration-700", audioFiles.length > 0 ? "opacity-100" : "opacity-0")}`}
          >
            <List.Body>
              {audioFiles.map((file, index) => (
                <List.Row
                  key={index}
                  rowId={`row${index}`}
                  onClick={() => handleSongSelect(file, index)}
                >
                  <List.Cell isFirst>
                    <div className="flex items-center gap-2">
                      {file.albumCover && (
                        <img
                          src={file.albumCover}
                          alt="Album cover"
                          className="w-3.5 h-3.5 object-cover"
                        />
                      )}
                      {file.name}
                    </div>
                  </List.Cell>
                  <List.Cell>{`${file.extension.toUpperCase()} File`}</List.Cell>
                  <List.Cell>{file.bitrate ? `${file.bitrate} Kbps` : "Unknown"}</List.Cell>
                  <List.Cell>{file.sizeMb.toFixed(2)} MB</List.Cell>
                  <List.Cell>
                    {selectedFileIndex === index && (
                      <span
                        role="button"
                        tabIndex={0}
                        onKeyDown={() => {}}
                        onClick={handlePropagate}
                        className="bg-black text-black cursor-pointer rounded-md"
                      >
                        <ListChecks className="w-3 h-3" />
                      </span>
                    )}
                  </List.Cell>
                </List.Row>
              ))}
            </List.Body>
          </List>
        </div>
        <div
          className={`${cn("w-[25%] relative p-4 mr-4 transition-all duration-500 shadow-xl rounded-2xl h-full bg-white/90", audioFiles.length > 0 ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0")}`}
        >
          <div className="absolute right-4">
            <Ellipsis className="w-4 h-4" />
          </div>
          <SongForm
            song={selectedSong}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onClear={handleClearAlbumCover}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
