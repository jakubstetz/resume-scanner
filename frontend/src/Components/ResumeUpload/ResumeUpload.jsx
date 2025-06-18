import { motion } from "motion/react";
import { useRef, useEffect } from "react";

function ResumeUpload({ uploadHandler, uploaded, filename, clearTrigger }) {
  return (
    <div className="upload-section">
      <h2>Resume Upload</h2>
      <input
        type="file"
        className="file-input"
        onChange={uploadHandler}
        key={`resume-${clearTrigger ? "version-1" : "version-2"}`}
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

export default ResumeUpload;
