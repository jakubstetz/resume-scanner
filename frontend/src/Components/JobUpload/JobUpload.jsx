import { motion } from "motion/react";

function JobUpload({ uploadHandler, uploaded, filename }) {
  return (
    <div className="upload-section">
      <h2>Job Description Upload</h2>
      <input type="file" className="file-input" onChange={uploadHandler} />
      <textarea
        placeholder="Or paste job description here..."
        className="text-input"
      />
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
