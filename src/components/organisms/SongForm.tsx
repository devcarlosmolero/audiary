import { SongMetadata } from "../../types";
import { FormField } from "../molecules/FormFields";

import PlaceholderUpload from "./PlaceholderUpload";

interface SongFormProps {
  song: SongMetadata | null;
  onFieldChange: (field: keyof SongMetadata) => (value: string) => void;
  onFieldBlur: (field: keyof SongMetadata) => () => void;
  onClear: () => void;
  onImageUpload: (imageData: string) => void;
}

export const GENRES = [
  { label: "Blues", value: "blues" },
  { label: "Classical", value: "classical" },
  { label: "Country", value: "country" },
  { label: "Electronic", value: "electronic" },
  { label: "Folk", value: "folk" },
  { label: "Hip Hop", value: "hip-hop" },
  { label: "Jazz", value: "jazz" },
  { label: "Pop", value: "pop" },
  { label: "R&B", value: "r&b" },
  { label: "Rock", value: "rock" },
  { label: "Metal", value: "metal" },
  { label: "Punk", value: "punk" },
  { label: "Reggae", value: "reggae" },
  { label: "Soul", value: "soul" },
  { label: "Funk", value: "funk" },
  { label: "Disco", value: "disco" },
  { label: "House", value: "house" },
  { label: "Techno", value: "techno" },
  { label: "Trance", value: "trance" },
  { label: "Dubstep", value: "dubstep" },
  { label: "Ambient", value: "ambient" },
  { label: "Alternative", value: "alternative" },
  { label: "Indie", value: "indie" },
  { label: "Gospel", value: "gospel" },
  { label: "Latin", value: "latin" },
  { label: "World", value: "world" },
  { label: "New Age", value: "new-age" },
  { label: "Opera", value: "opera" },
  { label: "Soundtrack", value: "soundtrack" },
  { label: "Other", value: "other" },
];

export default function SongForm({
  song,
  onFieldChange,
  onFieldBlur,
  onClear,
  onImageUpload,
}: SongFormProps) {
  return (
    <div className="flex gap-2 flex-col">
      <div className="flex justify-center mb-6">
        <PlaceholderUpload
          albumCover={song?.albumCover}
          onUpload={onImageUpload}
          onClear={onClear}
        />
      </div>
      <FormField
        label="Title"
        value={song?.title || ""}
        onChange={onFieldChange("title")}
        onBlur={onFieldBlur("title")}
      />
      <FormField
        label="Artist"
        value={song?.artist || ""}
        onChange={onFieldChange("artist")}
        onBlur={onFieldBlur("artist")}
      />
      <FormField
        label="Album"
        value={song?.album || ""}
        onChange={onFieldChange("album")}
        onBlur={onFieldBlur("album")}
      />
      <FormField
        label="Release Date"
        value={song?.releaseDate || ""}
        onChange={onFieldChange("releaseDate")}
        onBlur={onFieldBlur("releaseDate")}
      />
      <FormField
        label="Genre"
        value={song?.genre || ""}
        onChange={onFieldChange("genre")}
        onBlur={onFieldBlur("genre")}
        type="select"
        options={GENRES}
      />
    </div>
  );
}
