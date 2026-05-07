import { Music, Trash2 } from "lucide-react";

function FileList({ files, onDeleteFile }) {
  if (files.length === 0) {
    return <p className="empty-text">No audio files uploaded yet.</p>;
  }

  return (
    <div className="list">
      {files.map((file) => (
        <div className="list-item file-item" key={file.id}>
          <div className="list-icon">
            <Music size={18} />
          </div>

          <div className="file-content">
            <div className="file-header">
              <div>
                <h3>{file.name}</h3>
                <p>
                  {file.label} • {file.size} • {file.date}
                </p>
              </div>

              <button
                type="button"
                className="small-danger-button"
                onClick={() => onDeleteFile(file.id)}
                title="Delete audio file"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {file.audioUrl ? (
              <audio
                className="audio-player"
                controls
                src={`http://localhost:5000${file.audioUrl}`}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="audio-note">Audio stream unavailable.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileList;