
function ResumeUpload({ uploadHandler }) {
  return (
    <div className="upload-section">
      <h2>Resume Upload</h2>
      <input type="file" className="file-input" onChange={uploadHandler(e)} />
      <span className="upload-status">Uploaded: resume.pdf ✅</span>
    </div>
  );
}

export default ResumeUpload;
