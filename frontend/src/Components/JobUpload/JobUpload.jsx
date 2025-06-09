import { motion } from "motion/react";
import { useState } from "react";

function JobUpload({
  uploadHandler,
  uploaded,
  filename,
  onTextSubmit,
  textUploaded,
}) {
  const [text, setText] = useState("");

  const handleTextChange = (e) => setText(e.target.value);
  const handleTextSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <div className="upload-section">
      <h2>Job Description Upload</h2>
      <input type="file" className="file-input" onChange={uploadHandler} />
      <textarea
        placeholder="Or paste job description here..."
        className="text-input"
        value={text}
        onChange={handleTextChange}
      />
      <button
        type="button"
        className="text-submit-button"
        style={{ marginTop: 8, marginBottom: 0 }}
        onClick={handleTextSubmit}
        disabled={!text.trim()}
      >
        Submit Text
      </button>
      <div style={{ minHeight: 24, display: "flex", alignItems: "center" }}>
        {uploaded ? (
          <motion.span
            className="upload-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            ✅ Uploaded: {filename}
          </motion.span>
        ) : textUploaded ? (
          <motion.span
            className="upload-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            ✅ Text input received
          </motion.span>
        ) : (
          <span style={{ opacity: 0 }} className="upload-status">
            placeholder
          </span>
        )}
      </div>
    </div>
  );
}

export default JobUpload;
