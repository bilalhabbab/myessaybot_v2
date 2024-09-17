import React, { useState } from 'react';

const Generator = () => {
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState('');
  const [numParagraphs, setNumParagraphs] = useState('');
  const [generatedEssay, setGeneratedEssay] = useState(''); // State to hold the generated essay
  const [essayWordCount, setEssayWordCount] = useState(0); // State to hold the word count of the essay
  const [isProcessing, setIsProcessing] = useState(false); // State to track if it's processing

  const handleGenerate = async () => {
    setIsProcessing(true); // Set processing state to true
    try {
      const response = await fetch('http://localhost:5000/generate-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, numParagraphs, wordCount }),
      });

      const data = await response.json();
      if (data.result) {
        const essay = data.result;
        setGeneratedEssay(essay); // Update the state with the generated essay result

        // Calculate and update the word count for the generated essay
        const wordCount = essay.trim().split(/\s+/).length;
        setEssayWordCount(wordCount);
      } else {
        console.error("Error generating essay:", data);
      }
    } catch (error) {
      console.error("Error generating essay:", error);
    } finally {
      setIsProcessing(false); // Reset the processing state
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedEssay) {
      navigator.clipboard.writeText(generatedEssay)
        .then(() => {
          alert('Essay copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy text: ', error);
        });
    }
  };

  return (
    <div className="generator-container">
      <h2>Essay Generator</h2>
      <form>
        <div>
          <label htmlFor="prompt">Essay Prompt:</label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="wordCount">Word Count:</label>
          <input
            type="number"
            id="wordCount"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="numParagraphs">Number of Paragraphs:</label>
          <input
            type="number"
            id="numParagraphs"
            value={numParagraphs}
            onChange={(e) => setNumParagraphs(e.target.value)}
            required
          />
        </div>
        <button 
          type="button" 
          onClick={handleGenerate} 
          style={{ backgroundColor: isProcessing ? 'red' : '#61dafb' }}
          disabled={isProcessing} // Disable the button while processing
        >
          {isProcessing ? 'Processing...' : 'Generate Essay'}
        </button>
      </form>

      {/* Display the generated essay */}
      {generatedEssay && (
        <div className="essay-output">
          <h3>Your Generated Essay:</h3>
          <p>{generatedEssay}</p>

          {/* Display word count of generated essay */}
          <p><strong>Word Count:</strong> {essayWordCount}</p>

          {/* Copy to clipboard button */}
          <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
        </div>
      )}
    </div>
  );
};

export default Generator;
