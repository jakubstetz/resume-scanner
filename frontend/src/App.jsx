import { useState } from "react";
import { Toaster } from "react-hot-toast";
import ResumeUpload from "./Components/ResumeUpload/ResumeUpload";
import JobUpload from "./Components/JobUpload/JobUpload";
import Analysis from "./Components/Analysis/Analysis";

function App() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobUploaded, setJobUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleUpload = async (file, type, onSuccess) => {
    const formData = new FormData();
    formData.append(type, file);

    await fetch(`http://localhost:8000/upload-${type}`, {
      method: "POST",
      body: formData,
    });

    onSuccess();
  };

  return (
    <div className="app-container">
      <Toaster />
      <ResumeUpload uploadHandler={(file) => handleUpload(file, "resume", () => setResumeUploaded(true))} />
      <JobUpload uploadHandler={(file) => handleUpload(file, "job", () => setJobUploaded(true))} />
      <button
        className="analyze-button"
        disabled={!(resumeUploaded && jobUploaded)}
        onClick={() => setShowResults(true)}
      >
        Analyze
      </button>
      {showResults && <Analysis />}
    </div>
  );
}

export default App;
