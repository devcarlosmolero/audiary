import { useFileUpload } from "../../hooks/useFileUpload";
import Button from "../atoms/Button";

interface PlaceholderUploadProps {
  albumCover?: string;
  onUpload?: (imageData: string, imagePath?: string) => void;
  onClear?: () => void;
}

export default function PlaceholderUpload({ albumCover, onUpload }: PlaceholderUploadProps) {
  const { openFileDialog, convertImageToBase64, error } = useFileUpload();

  const handleUploadClick = async () => {
    try {
      const selectedPath = await openFileDialog({
        multiple: false,
        filters: [
          {
            name: "Image",
            extensions: ["jpg", "jpeg", "png", "gif"],
          },
        ],
      });

      if (selectedPath) {
        const base64Data = await convertImageToBase64(selectedPath);
        if (base64Data) {
          onUpload?.(base64Data, selectedPath);
        }
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{ backgroundImage: albumCover ? `url(${albumCover})` : "none" }}
        className={`bg-center bg-cover w-30 h-30 ${albumCover ? "bg-black" : "bg-gray-200"}`}
      ></div>
      <div className="flex gap-2 items-center w-full">
        <Button onClick={handleUploadClick} className="w-full cursor-pointer" disabled={!!error}>
          Replace
        </Button>
      </div>
    </div>
  );
}
