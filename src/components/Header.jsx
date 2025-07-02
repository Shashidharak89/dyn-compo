import React from 'react';
import { Settings, Eye, EyeOff, Download } from 'lucide-react';
import './styles/Header.css';

const Header = ({
  liveUpdate,
  setLiveUpdate,
  layout,
  setLayout,
  showPreview,
  setShowPreview,
  downloadCode
}) => {
  return (
    <div className="renderer-header">
      <div className="header-left">
        <h1 className="renderer-title">
          <span className="title-icon">⚛️</span>
          Dynamic Component Renderer
        </h1>
        <div className="supported-imports">
          <span className="imports-label">Supported:</span>
          <code className="imports-list">
            react, lodash, axios, moment, dayjs, uuid, lucide-react, react-router-dom
          </code>
        </div>
      </div>
      
      <div className="header-controls">
        <div className="control-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={liveUpdate}
              onChange={(e) => setLiveUpdate(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            Live Update
          </label>
        </div>
        
        <div className="control-group">
          <button
            className={`control-btn ${layout}`}
            onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
            title="Toggle layout"
          >
            <Settings size={18} />
          </button>
        </div>
        
        <div className="control-group">
          <button
            className="control-btn"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle preview"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <div className="control-group">
          <button
            className="control-btn"
            onClick={downloadCode}
            title="Download code"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;