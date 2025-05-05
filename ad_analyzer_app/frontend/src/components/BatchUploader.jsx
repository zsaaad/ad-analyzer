import React, { useState } from 'react';
import './ImageUploader.css';

const BatchUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setError(null);
      setResults(null);
      
      // Create preview URLs
      const urls = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(urls).then(setPreviewUrls);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload/batch', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'Upload failed');
      }

      if (data.status === 'success') {
        setResults(data.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          multiple
          className="file-input"
        />
        
        {previewUrls.length > 0 && (
          <div className="preview-container">
            {previewUrls.map((url, index) => (
              <div key={index} className="preview-item">
                <img src={url} alt={`Preview ${index + 1}`} className="preview-image" />
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          disabled={selectedFiles.length === 0 || isLoading}
          className="upload-button"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Images'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {results && (
        <div className="analysis-section">
          <h2>Analysis Results</h2>
          <div className="analysis-content">
            {results.map((result, index) => (
              <div key={index} className="analysis-item">
                <h3>Image {index + 1}</h3>
                <div className="analysis-details">
                  <div className="analysis-detail">
                    <h4>Visual Style</h4>
                    <p>{result.style_description}</p>
                  </div>
                  <div className="analysis-detail">
                    <h4>Overall Mood</h4>
                    <p>{result.mood_description}</p>
                  </div>
                  <div className="analysis-detail">
                    <h4>Composition</h4>
                    <p>{result.composition_analysis}</p>
                  </div>
                  <div className="analysis-detail">
                    <h4>Color Palette</h4>
                    <p>{result.color_palette_description}</p>
                  </div>
                  <div className="analysis-detail">
                    <h4>Identified Elements</h4>
                    <ul>
                      {result.identified_elements.map((element, idx) => (
                        <li key={idx}>{element}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUploader; 