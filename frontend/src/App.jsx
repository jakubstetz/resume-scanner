import { useState } from "react";
import { Toaster } from "react-hot-toast";
import ResumeUpload from "./Components/ResumeUpload/ResumeUpload";
import JobUpload from "./Components/JobUpload/JobUpload";
import Analysis from "./Components/Analysis/Analysis";

function App() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobUploaded, setJobUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="app-container">
      <Toaster />
      <ResumeUpload uploadHandler={() => setResumeUploaded(true)} />
      <JobUpload uploadHandler={() => setJobUploaded(true)} />
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
