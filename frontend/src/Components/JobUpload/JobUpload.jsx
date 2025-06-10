import { motion, AnimatePresence } from "motion/react";
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
        <AnimatePresence mode="wait">
          {uploaded && textUploaded ? (
            <motion.span
              key="both"
              className="upload-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              ✅ Both file ({filename}) and text submitted
            </motion.span>
          ) : uploaded ? (
            <motion.span
              key="file"
              className="upload-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              ✅ Uploaded: {filename}
            </motion.span>
          ) : textUploaded ? (
            <motion.span
              key="text"
              className="upload-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              ✅ Text input received
            </motion.span>
          ) : (
            <motion.span
              key="placeholder"
              style={{ opacity: 0 }}
              className="upload-status"
            >
              placeholder
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default JobUpload;
