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
  const [genAIResults, setGenAIResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // Helper function for API calls
  const postJson = async (endpoint, body) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, data };
      } else {
        const error = await response.json();
        return { ok: false, error };
      }
    } catch (err) {
      return { ok: false, error: err };
    }
  };

  const analyzeHandler = async () => {
    setIsAnalyzing(true);
    try {
      const jobContent = jobFileUploaded ? job.file.content : job.text.content;

      // Call all endpoints in parallel for better performance
      const [
        analysisResult,
        summaryResult,
        recommendationsResult,
        discrepanciesResult,
      ] = await Promise.all([
        postJson("/analyze", {
          resume_text: resume.file.content,
          job_text: jobContent,
        }),
        postJson("/summarize-resume", { resume_text: resume.file.content }),
        postJson("/generate-recommendations", {
          resume_text: resume.file.content,
        }),
        postJson("/analyze-discrepancies", {
          resume_text: resume.file.content,
          job_text: jobContent,
        }),
      ]);

      // Check if all requests were successful
      if (
        analysisResult.ok &&
        summaryResult.ok &&
        recommendationsResult.ok &&
        discrepanciesResult.ok
      ) {
        setAnalysisResults(analysisResult.data);
        setGenAIResults({
          summary: summaryResult.data.summary,
          recommendations: recommendationsResult.data.recommendations,
          discrepancies: discrepanciesResult.data.discrepancies,
        });
        setShowResults(true);
        toast.success("Analysis completed successfully!");
      } else {
        // Handle partial failures
        let analysisResults = null;
        let genAIResults = {};

        if (analysisResult.ok) {
          analysisResults = analysisResult.data;
          setAnalysisResults(analysisResults);
        } else {
          console.error("Basic analysis failed:", analysisResult.error);
        }

        if (summaryResult.ok) {
          genAIResults.summary = summaryResult.data.summary;
        } else {
          console.error("Resume summary failed:", summaryResult.error);
        }

        if (recommendationsResult.ok) {
          genAIResults.recommendations =
            recommendationsResult.data.recommendations;
        } else {
          console.error("Recommendations failed:", recommendationsResult.error);
        }

        if (discrepanciesResult.ok) {
          genAIResults.discrepancies = discrepanciesResult.data.discrepancies;
        } else {
          console.error(
            "Discrepancies analysis failed:",
            discrepanciesResult.error,
          );
        }

        if (Object.keys(genAIResults).length > 0) {
          setGenAIResults(genAIResults);
        }

        if (analysisResults || Object.keys(genAIResults).length > 0) {
          setShowResults(true);
          toast.success(
            "Analysis completed with some warnings. Check console for details.",
          );
        } else {
          toast.error("All analysis services failed.");
        }
      }
    } catch (err) {
      console.error("Error during analysis:", err);
      toast.error("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
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
          (jobFileUploaded && jobTextUploaded) ||
          isAnalyzing
        }
        onClick={analyzeHandler}
      >
        {isAnalyzing ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          "Analyze"
        )}
      </button>
      {showResults && (
        <Analysis
          analysisResults={analysisResults}
          genAIResults={genAIResults}
        />
      )}
    </div>
  );
}

export default App;
