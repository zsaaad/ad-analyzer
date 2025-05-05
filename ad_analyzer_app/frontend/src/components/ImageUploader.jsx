import React, { useState, useEffect } from 'react';
import './ImageUploader.css';
import config from '../config';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingEmoji, setLoadingEmoji] = useState('👶');

  // Array of emojis representing life stages
  const lifeStages = ['👶', '👦', '👨', '👴', '💀'];

  useEffect(() => {
    let emojiInterval;
    if (isLoading) {
      let index = 0;
      emojiInterval = setInterval(() => {
        index = (index + 1) % lifeStages.length;
        setLoadingEmoji(lifeStages[index]);
      }, 1000);
    }
    return () => {
      if (emojiInterval) clearInterval(emojiInterval);
    };
  }, [isLoading]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setAnalysisData(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      console.log('Starting upload...');
      const response = await fetch(`${config.apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);

      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to analyze image');
      }

      if (!result.data) {
        throw new Error('No analysis data received');
      }

      setAnalysisData(result.data);
    } catch (err) {
      console.error('Upload error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Failed to connect to the server. Please make sure the backend is running.');
      } else {
        setError(err.message || 'Failed to upload and analyze image');
      }
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
          className="file-input"
        />
        
        {previewUrl && (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isLoading}
          className="upload-button"
        >
          {isLoading ? (
            <div className="loading-state">
              Analyzing... <span className="loading-emoji">{loadingEmoji}</span>
            </div>
          ) : (
            'Analyze Image'
          )}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {analysisData && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <table>
            <tbody>
              <tr>
                <td>Visual Style:</td>
                <td>{analysisData.style_description}</td>
              </tr>
              <tr>
                <td>Mood:</td>
                <td>{analysisData.mood_description}</td>
              </tr>
              <tr>
                <td>Composition:</td>
                <td>{analysisData.composition_analysis}</td>
              </tr>
              <tr>
                <td>Color Palette:</td>
                <td>{analysisData.color_palette_description}</td>
              </tr>
              <tr>
                <td>Dimensions:</td>
                <td>{analysisData.technical_analysis.dimensions}</td>
              </tr>
              <tr>
                <td>StoreHub Logo:</td>
                <td>
                  {analysisData.technical_analysis.storehub_logo_present ? (
                    <>
                      Present ({analysisData.technical_analysis.storehub_logo_format}) - 
                      Color: {analysisData.technical_analysis.storehub_logo_color}, 
                      Position: {analysisData.technical_analysis.storehub_logo_position}
                    </>
                  ) : (
                    'Not Present'
                  )}
                </td>
              </tr>
              <tr>
                <td>Call to Action:</td>
                <td>{analysisData.technical_analysis.cta_button_present ? 'Present' : 'Not Present'}</td>
              </tr>
              <tr>
                <td>Background Color:</td>
                <td>{analysisData.technical_analysis.background_color}</td>
              </tr>
              <tr>
                <td>Identified Elements:</td>
                <td>
                  <ul>
                    {analysisData.identified_elements.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 