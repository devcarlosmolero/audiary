import { useState } from "react";

import { useFileUpload } from "../../hooks/useFileUpload";
import { AudioFile } from "../../types";
import Button from "../atoms/Button";

export default function Dropzone({
  label,
  onFilesSelected,
}: {
  label: string;
  onFilesSelected?: (files: AudioFile[]) => void;
}) {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const { openFileDialog, getAudioFiles, error } = useFileUpload();

  const handleSelectFolder = async () => {
    try {
      const selectedPath = await openFileDialog({
        directory: true,
        multiple: false,
        title: "Select a folder",
      });
      if (selectedPath) {
        setFolderPath(selectedPath);
        const audioFiles = await getAudioFiles(selectedPath);
        if (onFilesSelected) {
          onFilesSelected(audioFiles);
        }
      }
    } catch (err) {
      console.error("Error selecting folder:", err);
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
        <Button variant="neutral" onClick={handleSelectFolder} disabled={!!error}>
          Select folder...
        </Button>
      </div>
    </div>
  );
}
