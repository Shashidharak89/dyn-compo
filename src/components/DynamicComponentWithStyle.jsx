import React, { useState, useEffect } from 'react';
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
  Settings,
  Eye,
  EyeOff,
  Download
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

import Header from './Header';
import CodeEditorPanel from './CodeEditorPanel';
import PreviewPanel from './PreviewPanel';
// import './DynamicComponentRenderer.css';

const DynamicComponentRenderer = () => {
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
  const [layout, setLayout] = useState('vertical');

  const renderComponent = () => {
    try {
      setError('');
      
      // Clean the code by removing import statements and replacing them with direct access
      let cleanedCode = jsCode
        .replace(/import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
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

  return (
    <div className="dynamic-renderer">
      <Header
        liveUpdate={liveUpdate}
        setLiveUpdate={setLiveUpdate}
        layout={layout}
        setLayout={setLayout}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        downloadCode={downloadCode}
      />

      <div className={`renderer-content ${layout} ${!showPreview ? 'preview-hidden' : ''}`}>
        <CodeEditorPanel
          jsCode={jsCode}
          setJsCode={setJsCode}
          cssCode={cssCode}
          setCssCode={setCssCode}
          copyToClipboard={copyToClipboard}
          layout={layout}
        />

        {showPreview && (
          <PreviewPanel
            Component={Component}
            error={error}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            liveUpdate={liveUpdate}
            renderComponent={renderComponent}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicComponentRenderer;