import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";

function JobUpload({
  uploadHandler,
  uploaded,
  filename,
  onTextSubmit,
  textUploaded,
  clearTrigger,
}) {
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      setText("");
    }
  }, [clearTrigger]);

  const handleTextChange = (e) => setText(e.target.value);
  const handleTextSubmit = () => onTextSubmit(text);

  return (
    <div className="upload-section">
      <h2>Job Description Upload</h2>
      <input
        type="file"
        className="file-input"
        onChange={uploadHandler}
        key={`job-${clearTrigger ? "version-1" : "version-2"}`}
      />
      <textarea
        ref={textAreaRef}
        placeholder="Or paste job description here..."
        className="text-input"
        value={text}
        onChange={handleTextChange}
        key={`text-${clearTrigger ? "version-1" : "version-2"}`}
      />
      <button
        type="button"
        className="text-submit-button"
        style={{ marginTop: 8, marginBottom: 0 }}
        onClick={handleTextSubmit}
      >
        Submit Text
      </button>
      <div style={{ minHeight: 24, display: "flex", alignItems: "center" }}>
        <AnimatePresence mode="wait">
          {uploaded && textUploaded ? (
            <motion.span
              key="both"
              className="upload-status-warning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              ⚠️ Both file ({filename}) and text submitted — choose only one to
              submit
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
