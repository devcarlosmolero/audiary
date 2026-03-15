import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

import Button from "../atoms/Button";

interface AudioFile {
  name: string;
  path: string;
  extension: string;
  bitrate: number | null;
  size_mb: number;
}

export default function Dropzone({
  label,
  onFilesSelected,
}: {
  label: string;
  onFilesSelected?: (files: AudioFile[]) => void;
}) {
  const [folderPath, setFolderPath] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Select a folder",
      });
      if (selectedPath) {
        setFolderPath(selectedPath);
        const audioFiles = await invoke<AudioFile[]>("get_audio_files", {
          folderPath: selectedPath,
        });
        if (onFilesSelected) {
          onFilesSelected(audioFiles);
        }
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  return (
    <div className=" bg-quaternary-fill/3 p-3 w-full rounded-xl">
      <div className="flex items-start justify-center">
        <div className="mr-auto gap-y-1 flex flex-col text-primary-vibrant-label text-sm">
          <p>{label}</p>
          <p className="text-primary-vibrant-label/50">
            {folderPath?.replace(/\//g, " • ").replace(/^ • /, "")}
          </p>
        </div>
        <Button variant="neutral" onClick={handleSelectFolder}>
          Select folder...
        </Button>
      </div>
    </div>
  );
}
