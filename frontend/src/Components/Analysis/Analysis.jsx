function Analysis({ analysisResults, genAIResults }) {
  if (!analysisResults && !genAIResults) {
    return (
      <div className="analysis-section">
        <h2>Analysis Results</h2>
        <p>No results to display yet.</p>
      </div>
    );
  }

  const mapSkills = (skills) => {
    return skills.map((skill, index) => (
      <li key={index}>
        {skill.word} (Confidence: {(skill.score * 100).toFixed(2)}%)
      </li>
    ));
  };

  return (
    <div className="analysis-section">
      <h2>Analysis Results</h2>

      {/* Basic Analysis Results */}
      {analysisResults && (
        <>
          <div>
            <h3>Résumé Skills Extracted:</h3>
            <ul>{mapSkills(analysisResults.resumeSkills)}</ul>
          </div>
          <div>
            <h3>Job Skills Extracted:</h3>
            <ul>{mapSkills(analysisResults.jobSkills)}</ul>
          </div>
          <div>
            <h3>Similarity Score:</h3>
            <p>{(analysisResults.similarity * 100).toFixed(2)}%</p>
          </div>
        </>
      )}

      {/* GenAI Results */}
      {genAIResults && (
        <>
          {genAIResults.summary && (
            <div>
              <h3>Resume Summary:</h3>
              <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                {genAIResults.summary}
              </p>
            </div>
          )}

          {genAIResults.recommendations &&
            genAIResults.recommendations.length > 0 && (
              <div>
                <h3>Improvement Recommendations:</h3>
                <ul style={{ marginBottom: "20px" }}>
                  {genAIResults.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      style={{ marginBottom: "8px", lineHeight: "1.5" }}
                    >
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {genAIResults.discrepancies && (
            <div>
              <h3>Gap Analysis:</h3>
              <div
                style={{
                  marginBottom: "20px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-line",
                }}
              >
                {genAIResults.discrepancies}
              </div>
            </div>
          )}
        </>
      )}

      {/* Show message if some GenAI services failed */}
      {genAIResults &&
        (!genAIResults.summary ||
          !genAIResults.recommendations ||
          !genAIResults.discrepancies) && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 193, 7, 0.1)",
              borderLeft: "4px solid rgb(255, 193, 7)",
            }}
          >
            <p>
              <strong>Note:</strong> Some AI-powered analysis features may not
              be available. Check the console for details.
            </p>
          </div>
        )}
    </div>
  );
}

export default Analysis;
