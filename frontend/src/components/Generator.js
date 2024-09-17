import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Generator = () => {
  const location = useLocation();

  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(200);  // Default to 200
  const [numParagraphs, setNumParagraphs] = useState(1);  // Default to 1
  const [generatedEssay, setGeneratedEssay] = useState(''); 
  const [essayWordCount, setEssayWordCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [essays, setEssays] = useState([]);  // Hold saved essays
  const [showEssays, setShowEssays] = useState(false);  // Toggle essays
  const [error, setError] = useState(null);  // For handling errors

  // Function to generate an essay using OpenAI
  const handleGenerate = async () => {
    if (!prompt) {
      setError('Prompt is required.');
      return;
    }
    setIsProcessing(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:5000/generate-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, numParagraphs, wordCount }),  // Ensure values are correct
      });
  
      const data = await response.json();
      if (data.result) {
        setGeneratedEssay(data.result);
        const count = data.result.trim().split(/\s+/).length;
        setEssayWordCount(count);
      } else {
        setError('Error generating essay.');
      }
    } catch (error) {
      setError('Failed to fetch the essay. Please try again.');
      console.error("Error generating essay:", error);
    } finally {
      setIsProcessing(false);
    }
  };



  // Function to fetch saved essays
  const handleFetchEssays = async () => {
    if (!showEssays) {
      try {
        const response = await fetch('http://localhost:5000/all-essays');
        const data = await response.json();
        setEssays(data.essays);
      } catch (error) {
        console.error('Error fetching saved essays:', error);
        setError('Failed to fetch saved essays.');
      }
    }
    setShowEssays(!showEssays);  // Toggle essay display
  };

  // Function to copy the essay to clipboard
  const handleCopyToClipboard = () => {
    if (generatedEssay) {
      navigator.clipboard.writeText(generatedEssay)
        .then(() => alert('Essay copied to clipboard!'))
        .catch((error) => console.error('Failed to copy text:', error));
    }
  };

  // Function to reset the form
  const handleReset = () => {
    setPrompt('');
    setWordCount(200);
    setNumParagraphs(1);
    setGeneratedEssay('');
    setEssayWordCount(0);
    setError(null);  // Reset errors on reset
  };

  // Function to save the generated essay
  const handleSaveContent = async () => {
  try {
    const response = await fetch('http://localhost:5000/save-essay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: generatedEssay,
        user: 'username@example.com'  // Ensure this is dynamically set
      }),
    });

    if (response.ok) {
      alert('Content saved successfully!');
    } else {
      console.error('Error saving content');
      setError('Failed to save content.');
    }
  } catch (error) {
    console.error('Error:', error);
    setError('Error saving content.');
  }
};

  return (
    <div style={{ margin: '50px', paddingTop: '30px' }}>
      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white', paddingTop: '20px' }}>
        <h1>Welcome to MyEssayBot</h1>
        <p>Generate high-quality essays based on your prompts, word count, and number of paragraphs.</p>
      </div>

      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Form Section */}
      <div style={{ position: 'sticky', top: '0', backgroundColor: '#333', padding: '20px', zIndex: '1', marginBottom: '20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="prompt">Essay Prompt:</label>
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              style={{ backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '5px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="wordCount">Word Count:</label>
            <select
              id="wordCount"
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              required
              style={{ backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '5px', marginLeft: '10px' }}
            >
              {[...Array(11).keys()].map(i => (
                <option key={i} value={200 + i * 100}>
                  {200 + i * 100}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="numParagraphs">Number of Paragraphs: {numParagraphs}</label>
            <input
              type="range"
              id="numParagraphs"
              min="1"
              max="10"
              value={numParagraphs}
              onChange={(e) => setNumParagraphs(e.target.value)}
              required
              style={{ width: '300px', marginLeft: '10px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ backgroundColor: isProcessing ? 'red' : '#61dafb', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Generate Essay'}
          </button>
        </form>
      </div>

      {/* Generated Essay */}
      {generatedEssay && (
        <>
          <div className="essay-output" style={{ textAlign: 'left', color: 'white', padding: '20px', backgroundColor: '#333', borderRadius: '5px', maxHeight: '300px', overflowY: 'scroll' }}>
            <h3>Your Generated Essay:</h3>
            <p>{generatedEssay}</p>

            <p><strong>Word Count:</strong> {essayWordCount}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleCopyToClipboard}
              style={{ backgroundColor: '#61dafb', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
            >
              Copy to Clipboard
            </button>

            <button 
              onClick={handleReset}
              style={{ backgroundColor: '#ff6f61', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
            >
              Re-enter Prompt
            </button>

            <button 
              onClick={handleSaveContent}
              style={{ backgroundColor: '#4CAF50', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Save Content
            </button>
          </div>
        </>
      )}

      {/* Fetch and display saved essays */}
      <div style={{ marginTop: '50px' }}>
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }}>
        <button onClick={handleFetchEssays} style={{ backgroundColor: '#61dafb', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
            {showEssays ? 'Hide Saved Essays' : 'Show Saved Essays'}
          </button>
        </div>

        {showEssays && essays.length > 0 && (
          <div style={{ marginTop: '20px', color: 'white' }}>
            <h3>Saved Essays:</h3>
            <ul>
              {essays.map((essay, index) => (
                <li key={index}>
                  <p>{essay.content}</p>
                  <p><strong>Saved by:</strong> {essay.user}</p>
                  <p><strong>Word Count:</strong> {essay.content.trim().split(/\s+/).length}</p>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;