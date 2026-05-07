import { Music } from "lucide-react";

function FileList({ files }) {
  if (files.length === 0) {
    return <p className="empty-text">No audio files uploaded yet.</p>;
  }

  return (
    <div className="list">
      {files.map((file) => (
        <div className="list-item" key={file.id}>
          <div className="list-icon">
            <Music size={18} />
          </div>

          <div>
            <h3>{file.name}</h3>
            <p>
              {file.label} • {file.size} • {file.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileList;