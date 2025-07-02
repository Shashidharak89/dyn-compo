import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Maximize2, Minimize2, Play } from 'lucide-react';
import './styles/PreviewPanel.css';

const PreviewPanel = ({
  Component,
  error,
  fullscreen,
  setFullscreen,
  liveUpdate,
  renderComponent
}) => {
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>
          <span className="preview-icon">🖥️</span>
          Live Preview
        </h3>
        <div className="preview-controls">
          {!liveUpdate && (
            <button
              className="render-btn"
              onClick={renderComponent}
              title="Render component"
            >
              <Play size={16} />
              Render
            </button>
          )}
          <button
            className="fullscreen-btn"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className={`preview-content ${fullscreen ? 'fullscreen' : ''}`}>
        {fullscreen && (
          <button
            className="exit-fullscreen-btn"
            onClick={() => setFullscreen(false)}
          >
            <Minimize2 size={16} />
            Exit Fullscreen
          </button>
        )}

        <div className="component-wrapper">
          {Component ? (
            <BrowserRouter>
              <Component />
            </BrowserRouter>
          ) : (
            <div className="placeholder">
              <p>Your rendered component will appear here</p>
            </div>
          )}
        </div>

        {error && (
          <div className="error-panel">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              Compilation Error
            </div>
            <div className="error-content">
              <code>{error}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;