import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

import { AudioFile } from "../types";

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFileDialog = async (options: {
    multiple?: boolean;
    directory?: boolean;
    title?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const selectedPath = await open(options);
      return selectedPath;
    } catch (err) {
      console.error("Error opening file dialog:", err);
      setError("Failed to open file dialog");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = async (imagePath: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const base64Data = await invoke("convert_image_to_base64", {
        path: imagePath,
      });

      return base64Data as string;
    } catch (err) {
      console.error("Error converting image to base64:", err);
      setError("Failed to convert image");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAudioFiles = async (folderPath: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const audioFiles = await invoke<AudioFile[]>("get_audio_files", {
        folderPath,
      });

      return audioFiles;
    } catch (err) {
      console.error("Error getting audio files:", err);
      setError("Failed to get audio files");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    openFileDialog,
    convertImageToBase64,
    getAudioFiles,
    clearError,
  };
}
