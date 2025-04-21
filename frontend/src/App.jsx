import { useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import ResumeUpload from "./Components/ResumeUpload/ResumeUpload";
import JobUpload from "./Components/JobUpload/JobUpload";
import Analysis from "./Components/Analysis/Analysis";

const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resume, setResume] = useState({
    filename: "",
    content: ""
  });
  const [jobUploaded, setJobUploaded] = useState(false);
  const [job, setJob] = useState({
    filename: "",
    content: ""
  });
  const [showResults, setShowResults] = useState(false);

  const uploadHandler = async (file, type, uploadedStateSetter, contentStateSetter) => {
    const formData = new FormData();
    formData.append(type, file);

    try {
      const api_response = await fetch(`${apiUrl}/upload-${type}`, {
        method: "POST",
        body: formData,
      });
      toast.dismiss();
      if (api_response.ok) {
        const uploaded_object = await api_response.json();
        uploadedStateSetter(true);
        contentStateSetter(uploaded_object);
        toast.success(`${type} uploaded successfully!`);
      } else {
        const error = await api_response.json();
        console.log(error);
        toast.error(`${type} upload failed.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Toaster />
      <ResumeUpload uploadHandler={(file) => uploadHandler(file, "resume", setResumeUploaded, setResume)} />
      <JobUpload uploadHandler={(file) => uploadHandler(file, "job", setJobUploaded, setJob)} />
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
