function Analysis({ analysisResults }) {
  if (!analysisResults) {
    return (
      <div className="analysis-section">
        <h2>Analysis Results</h2>
        <p>No results to display yet.</p>
      </div>
    );
  }

  const { skills, similarity } = analysisResults;

  return (
    <div className="analysis-section">
      <h2>Analysis Results</h2>
      <div>
        <h3>Skills Extracted:</h3>
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>
              {skill.word} (Confidence: {(skill.score * 100).toFixed(2)}%)
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Similarity Score:</h3>
        <p>{(similarity * 100).toFixed(2)}%</p>
      </div>
    </div>
  );
}

export default Analysis;