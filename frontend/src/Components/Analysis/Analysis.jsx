function Analysis({ analysisResults }) {
  if (!analysisResults) {
    return (
      <div className="analysis-section">
        <h2>Analysis Results</h2>
        <p>No results to display yet.</p>
      </div>
    );
  }

  const { resumeSkills, jobSkills, similarity } = analysisResults;

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
      <div>
        <h3>Résumé Skills Extracted:</h3>
        <ul>{mapSkills(resumeSkills)}</ul>
      </div>
      <div>
        <h3>Job Skills Extracted:</h3>
        <ul>{mapSkills(jobSkills)}</ul>
      </div>
      <div>
        <h3>Similarity Score:</h3>
        <p>{(similarity * 100).toFixed(2)}%</p>
      </div>
    </div>
  );
}

export default Analysis;
