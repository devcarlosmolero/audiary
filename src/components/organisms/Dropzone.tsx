import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

import Button from "../atoms/Button";

export default function Dropzone({ label }: { label: string }) {
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
