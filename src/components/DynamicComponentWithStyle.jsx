import React, { useState, useEffect, useRef } from 'react';
import * as Babel from '@babel/standalone';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  Home, 
  Menu, 
  ArrowRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Settings,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import './DynamicComponentRenderer.css';

const DynamicComponentWithStyle = () => {
  const [jsCode, setJsCode] = useState(`import React, { useState } from 'react';
import { Menu, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

function Page() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app-container">
      <header className="header">
        <Menu color="lime" size={24} />
        <h1>Hello React!</h1>
        <Link to="/" className="nav-link">
          <Home size={20} />
          Home
        </Link>
      </header>
      
      <main className="main-content">
        <div className="counter-section">
          <h2>Counter: {count}</h2>
          <button 
            onClick={() => setCount(count + 1)}
            className="counter-btn"
          >
            Increment
          </button>
          <button 
            onClick={() => setCount(0)}
            className="reset-btn"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}

export default Page;`);

  const [cssCode, setCssCode] = useState(`.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.main-content {
  padding: 2rem;
}

.counter-section {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.counter-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.counter-btn, .reset-btn {
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.counter-btn {
  background: linear-gradient(45deg, #00c851, #00ff7f);
  color: black;
}

.counter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 200, 81, 0.4);
}

.reset-btn {
  background: linear-gradient(45deg, #ff4444, #ff6b6b);
  color: white;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
}`);

  const [Component, setComponent] = useState(null);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [layout, setLayout] = useState('horizontal'); // horizontal, vertical
  const jsTextareaRef = useRef(null);
  const cssTextareaRef = useRef(null);

  const renderComponent = () => {
    try {
      setError('');
      
      // Clean the code by removing import statements and replacing them with direct access
      let cleanedCode = jsCode
        .replace(/import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
          // Extract hooks and make them available
          const hooksList = hooks.split(',').map(h => h.trim());
          return `// React hooks: ${hooksList.join(', ')} are available globally`;
        })
        .replace(/import\s+React\s+from\s+['"]react['"];?/g, '// React is available globally')
        .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
          return `// React hooks: ${hooks} are available globally`;
        })
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

      const transformedCode = Babel.transform(cleanedCode, {
        presets: ['react', 'env'],
      }).code;

      let styleTag = document.getElementById('dynamic-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-style';
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = cssCode;

      const exports = {};
      const require = (pkg) => {
        if (pkg === 'react') return React;
        if (pkg === 'lodash') return _;
        if (pkg === 'axios') return axios;
        if (pkg === 'moment') return moment;
        if (pkg === 'dayjs') return dayjs;
        if (pkg === 'uuid') return { v4: uuidv4 };
        if (pkg === 'lucide-react') return { Home, Menu, ArrowRight };
        if (pkg === 'react-router-dom') {
          return {
            BrowserRouter,
            Routes,
            Route,
            Link,
            useNavigate,
            useParams,
            useLocation,
          };
        }
        throw new Error(`❌ Package "${pkg}" is not supported.`);
      };

      const allGlobals = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useRef: React.useRef,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        useContext: React.useContext,
        useReducer: React.useReducer,
        require,
        exports,
        _,
        axios,
        moment,
        dayjs,
        uuidv4,
        Home,
        Menu,
        ArrowRight,
        BrowserRouter,
        Routes,
        Route,
        Link,
        useNavigate,
        useParams,
        useLocation,
      };

      const argNames = Object.keys(allGlobals);
      const argValues = Object.values(allGlobals);
      const scopeFunction = new Function(...argNames, transformedCode);
      scopeFunction(...argValues);

      const ExportedComponent = exports.default || exports.Component;
      if (!ExportedComponent) throw new Error('No default/component export found');

      setComponent(() => ExportedComponent);
    } catch (err) {
      console.error('Compilation error:', err);
      setError(err.message);
      setComponent(() => () => <div className="error-message">❌ {err.message}</div>);
    }
  };

  useEffect(() => {
    if (liveUpdate) renderComponent();
  }, [jsCode, cssCode, liveUpdate]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadCode = () => {
    const jsBlob = new Blob([jsCode], { type: 'text/javascript' });
    const cssBlob = new Blob([cssCode], { type: 'text/css' });
    
    const jsUrl = URL.createObjectURL(jsBlob);
    const cssUrl = URL.createObjectURL(cssBlob);
    
    const jsLink = document.createElement('a');
    jsLink.href = jsUrl;
    jsLink.download = 'component.jsx';
    jsLink.click();
    
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'component.css';
    cssLink.click();
    
    URL.revokeObjectURL(jsUrl);
    URL.revokeObjectURL(cssUrl);
  };

  const CodeEditor = ({ value, onChange, language, placeholder }) => {
    const lines = value.split('\n');
    
    return (
      <div className="code-editor">
        <div className="code-editor-header">
          <div className="editor-tabs">
            <div className={`tab active ${language}`}>
              <span className="tab-icon">●</span>
              {language === 'javascript' ? 'component.jsx' : 'styles.css'}
            </div>
          </div>
          <div className="editor-actions">
            <button 
              className="editor-btn"
              onClick={() => copyToClipboard(value, language)}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="code-editor-content">
          <div className="line-numbers">
            {lines.map((_, index) => (
              <div key={index + 1} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          
          <textarea
            className={`code-textarea ${language}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck="false"
            ref={language === 'javascript' ? jsTextareaRef : cssTextareaRef}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dynamic-renderer">
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

      <div className={`renderer-content ${layout} ${!showPreview ? 'preview-hidden' : ''}`}>
        <div className="editors-panel">
          <div className="editor-container">
            <div className="editor-header">
              <h3>JSX/React Code</h3>
            </div>
            <CodeEditor
              value={jsCode}
              onChange={setJsCode}
              language="javascript"
              placeholder="Enter your React component code here..."
            />
          </div>

          <div className="editor-container">
            <div className="editor-header">
              <h3>CSS Styles</h3>
            </div>
            <CodeEditor
              value={cssCode}
              onChange={setCssCode}
              language="css"
              placeholder="Enter your CSS styles here..."
            />
          </div>
        </div>

        {showPreview && (
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
        )}
      </div>
    </div>
  );
};

export default DynamicComponentWithStyle;