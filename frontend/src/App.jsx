import { useState, useEffect } from "react";
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
    content: "",
  });
  const [jobUploaded, setJobUploaded] = useState(false);
  const [jobTextUploaded, setJobTextUploaded] = useState(false);
  const [job, setJob] = useState({
    filename: "",
    content: "",
  });
  const [analysisResults, setAnalysisResults] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /*
  useEffect(() => {
    console.log(`resume: `, resume);
    console.log(`resume.filename: `, resume.filename);
    console.log(`resume.content: `, resume.content);
    console.log(`job: `, job);
    console.log(`job.filename: `, job.filename);
    console.log(`job.content: `, job.content);
  }, [job, resume]);
  */

  const uploadHandler = async (
    event,
    type,
    uploadedStateSetter,
    contentStateSetter,
  ) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    try {
      const api_response = await fetch(`${apiUrl}/upload-${type}`, {
        method: "POST",
        body: formData,
      });
      toast.dismiss();
      if (api_response.ok) {
        const uploaded_object = await api_response.json();
        if (uploaded_object?.filename && uploaded_object?.content) {
          uploadedStateSetter(true);
          contentStateSetter(uploaded_object);
          toast.success(`${capitalizedType} uploaded successfully!`);
        } else {
          toast.error(
            `${capitalizedType} upload failed: Malformed API response.`,
          );
        }
      } else {
        const error = await api_response.json();
        console.log(error);
        toast.error(`${capitalizedType} upload failed.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during analysis.");
    }
  };

  const analyzeHandler = async () => {
    try {
      const api_response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resume.content,
          job_text: job.content,
        }),
      });

      if (api_response.ok) {
        const results = await api_response.json();
        setAnalysisResults(results);
        setShowResults(true);
        toast.success("Analysis completed successfully!");
      } else {
        const error = await api_response.json();
        console.error("Analysis failed:", error);
        toast.error("Analysis failed.");
      }
    } catch (err) {
      console.error("Error during analysis:", err);
      toast.error("An error occurred during analysis.");
    }
  };

  const handleJobTextSubmit = async (text) => {
    try {
      const api_response = await fetch(`${apiUrl}/upload-job`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ job_text: text }),
      });
      if (api_response.ok) {
        const uploaded_object = await api_response.json();
        if (uploaded_object?.content) {
          setJobTextUploaded(true);
          setJob((prev) => ({
            ...prev,
            content: uploaded_object.content,
          }));
          toast.success("Job description text submitted successfully!");
        } else {
          toast.error("Job text submission failed: Malformed API response.");
        }
      } else {
        const error = await api_response.json();
        console.log(error);
        toast.error("Job text submission failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during job text submission.");
    }
  };

  return (
    <div className="app-container">
      <Toaster />
      <ResumeUpload
        uploadHandler={(e) =>
          uploadHandler(e, "resume", setResumeUploaded, setResume)
        }
        uploaded={resumeUploaded}
        filename={resume.filename}
      />
      <JobUpload
        uploadHandler={(e) => uploadHandler(e, "job", setJobUploaded, setJob)}
        uploaded={jobUploaded}
        textUploaded={jobTextUploaded}
        filename={job.filename}
        onTextSubmit={handleJobTextSubmit}
      />
      <button
        className="analyze-button"
        disabled={!(resumeUploaded && (jobUploaded || jobTextUploaded))}
        onClick={analyzeHandler}
      >
        Analyze
      </button>
      {showResults && <Analysis analysisResults={analysisResults} />}
    </div>
  );
}

export default App;
