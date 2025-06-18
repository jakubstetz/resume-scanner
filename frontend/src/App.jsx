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
    file: {
      filename: "",
      content: "",
    },
  });
  const [jobFileUploaded, setJobFileUploaded] = useState(false);
  const [jobTextUploaded, setJobTextUploaded] = useState(false);
  const [job, setJob] = useState({
    file: {
      filename: "",
      content: "",
    },
    text: {
      content: "",
    },
  });
  const [analysisResults, setAnalysisResults] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(false);

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
    formData.append("document", file);

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    try {
      const api_response = await fetch(`${apiUrl}/upload-document`, {
        method: "POST",
        body: formData,
      });
      toast.dismiss();
      if (api_response.ok) {
        const uploaded_object = await api_response.json();
        if (uploaded_object?.filename && uploaded_object?.content) {
          uploadedStateSetter(true);
          contentStateSetter((prev) => ({
            ...prev,
            file: {
              filename: uploaded_object.filename,
              content: uploaded_object.content,
            },
          }));
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

  const handleJobTextSubmit = (text) => {
    setJobTextUploaded(!!text.trim());
    setJob((prev) => ({
      ...prev,
      text: {
        content: text,
      },
    }));
    toast.success(
      text.trim()
        ? "Job description text submitted successfully!"
        : "Job description text cleared.",
    );
  };

  const clearSubmissions = () => {
    setResumeUploaded(false);
    setResume({
      file: {
        filename: "",
        content: "",
      },
    });
    setJobFileUploaded(false);
    setJobTextUploaded(false);
    setJob({
      file: {
        filename: "",
        content: "",
      },
      text: {
        content: "",
      },
    });
    setClearTrigger((prev) => !prev);
    toast.success("Inputs cleared successfully!");
  };

  // Effect to validate JD input
  useEffect(() => {
    if (jobFileUploaded && jobTextUploaded) {
      toast.error("Please upload either a JD file or paste text, not both.");
    }
  }, [jobFileUploaded, jobTextUploaded]);

  const analyzeHandler = async () => {
    try {
      const jobContent = jobFileUploaded ? job.file.content : job.text.content;

      const api_response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resume.file.content,
          job_text: jobContent,
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

  return (
    <div className="app-container">
      <Toaster />
      <ResumeUpload
        uploadHandler={(e) =>
          uploadHandler(e, "resume", setResumeUploaded, setResume)
        }
        uploaded={resumeUploaded}
        filename={resume.file.filename}
        clearTrigger={clearTrigger}
      />
      <JobUpload
        uploadHandler={(e) =>
          uploadHandler(e, "job", setJobFileUploaded, setJob)
        }
        uploaded={jobFileUploaded}
        textUploaded={jobTextUploaded}
        filename={job.file.filename}
        onTextSubmit={handleJobTextSubmit}
        clearTrigger={clearTrigger}
      />
      <button
        className="clear-button"
        onClick={clearSubmissions}
        disabled={!(resumeUploaded || jobFileUploaded || jobTextUploaded)}
      >
        Clear Submissions
      </button>
      <button
        className="analyze-button"
        disabled={
          !resumeUploaded ||
          !(jobFileUploaded || jobTextUploaded) ||
          (jobFileUploaded && jobTextUploaded)
        }
        onClick={analyzeHandler}
      >
        Analyze
      </button>
      {showResults && <Analysis analysisResults={analysisResults} />}
    </div>
  );
}

export default App;
