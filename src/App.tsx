import { useState } from "react";

import Dropzone from "./components/organisms/Dropzone";
import List from "./components/organisms/List";

interface AudioFile {
  name: string;
  path: string;
  extension: string;
  bitrate: number | null;
  sizeMb: number;
  albumCover?: string;
}

function App() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const handleFilesSelected = (files: AudioFile[]) => {
    setAudioFiles(files);
  };

  return (
    <div className="p-4 h-screen">
      <div className="flex items-start w-full h-full">
        <div className="w-[65%] h-full flex flex-col gap-4">
          <Dropzone label="something" onFilesSelected={handleFilesSelected} />
          <List>
            <List.Body>
              {audioFiles.map((file, index) => (
                <List.Row key={index} rowId={`row${index}`} onClick={() => {}}>
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
                  <List.Cell isLast>{file.sizeMb.toFixed(2)} MB</List.Cell>
                </List.Row>
              ))}
            </List.Body>
          </List>
        </div>
        <div className="w-[35%] h-full"></div>
      </div>
    </div>
  );
}

export default App;
