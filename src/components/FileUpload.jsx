import { Upload } from "lucide-react";

function FileUpload({ onUpload }) {
  function handleFileChange(event) {
    const file = event.target.files[0];

    if (file) {
      onUpload(file);
    }

    event.target.value = "";
  }

  return (
    <label className="upload-button">
      <Upload size={16} />
      Upload
      <input
        type="file"
        accept=".mp3,.wav,.flac"
        onChange={handleFileChange}
      />
    </label>
  );
}

export default FileUpload;