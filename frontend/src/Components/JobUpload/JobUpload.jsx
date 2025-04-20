
function JobUpload({ uploadHandler }) {
  return (
    <div className="upload-section">
      <h2>Job Description Upload</h2>
      <input type="file" className="file-input" onChange={uploadHandler} />
      <textarea placeholder="Or paste job description here..." className="text-input" />
      <span className="upload-status">Text input detected ✅</span>
    </div>
  );
}

export default JobUpload;
