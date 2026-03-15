import { useState } from "react";

import Dropzone from "./components/organisms/Dropzone";
import List from "./components/organisms/List";

interface AudioFile {
  name: string;
  path: string;
  extension: string;
  bitrate: number | null;
  size_mb: number;
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
                  <List.Cell isFirst>{file.name}</List.Cell>
                  <List.Cell>{`${file.extension.toUpperCase()} File`}</List.Cell>
                  <List.Cell>{file.bitrate ? `${file.bitrate} Kbps` : "Unknown"}</List.Cell>
                  <List.Cell isLast>{file.size_mb.toFixed(2)} MB</List.Cell>
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
