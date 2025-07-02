import React, { useState, useEffect } from 'react';
import * as Babel from '@babel/standalone';

import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Home, Menu, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

const DynamicComponentWithStyle = () => {
  const [jsCode, setJsCode] = useState(`import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

function Page() {
  return (
    <div>
      <Menu color="lime" />
      <h1>Hello</h1>
      <Link to="/">Home</Link>
    </div>
  );
}

export default Page;
`);
  const [cssCode, setCssCode] = useState(`h1 { color: cyan; text-align: center; }
button { padding: 0.5rem; background: purple; color: white; }`);

  const [Component, setComponent] = useState(null);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState(true);

  const renderComponent = () => {
    try {
      setError('');

      const cleanedCode = jsCode.replace(/import\s+.*?from\s+['"].*?['"];/g, '');

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
        require,
        exports,
        _: _,
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
      setComponent(() => () => <div style={{ color: 'red' }}>❌ {err.message}</div>);
    }
  };

  useEffect(() => {
    if (liveUpdate) renderComponent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsCode, cssCode]);

  return (
    <div style={{ background: '#111', color: 'white', padding: '2rem', minHeight: '100vh' }}>
      <h2>⚛️ Dynamic Component + CSS Renderer</h2>
      <p>
        Supported imports:{' '}
        <code>
          react, lodash, axios, moment, dayjs, uuid, lucide-react, react-router-dom
        </code>
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={liveUpdate}
            onChange={() => setLiveUpdate(!liveUpdate)}
            style={{ marginRight: '0.5rem' }}
          />
          Enable Live Update
        </label>
      </div>

      <label>JSX/React Code:</label>
      <textarea
        rows="12"
        style={{
          width: '100%',
          marginBottom: '1rem',
          background: '#222',
          color: 'white',
          padding: '1rem',
          fontFamily: 'monospace',
          border: '1px solid #444',
          borderRadius: '6px',
        }}
        value={jsCode}
        onChange={(e) => setJsCode(e.target.value)}
      />

      <label>CSS Code:</label>
      <textarea
        rows="6"
        style={{
          width: '100%',
          marginBottom: '1rem',
          background: '#222',
          color: 'white',
          padding: '1rem',
          fontFamily: 'monospace',
          border: '1px solid #444',
          borderRadius: '6px',
        }}
        value={cssCode}
        onChange={(e) => setCssCode(e.target.value)}
      />

      {!liveUpdate && (
        <button
          onClick={renderComponent}
          style={{
            padding: '0.5rem 1rem',
            background: 'purple',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ▶️ Render
        </button>
      )}

      <hr />
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        🖥️ Output:
        <button
          onClick={() => setFullscreen(!fullscreen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          title={fullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </h3>

      <div
        style={{
          background: '#000',
          padding: fullscreen ? '2rem 4rem' : '2rem',
          borderRadius: '10px',
          marginTop: '1rem',
          minHeight: fullscreen ? '100vh' : '300px',
          position: fullscreen ? 'fixed' : 'relative',
          top: fullscreen ? 0 : 'auto',
          left: fullscreen ? 0 : 'auto',
          width: fullscreen ? '100%' : 'auto',
          zIndex: fullscreen ? 9999 : 'auto',
          overflow: 'auto',
        }}
      >
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'purple',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              zIndex: 10000,
            }}
          >
            🔙 Exit Fullscreen
          </button>
        )}

        {Component ? (
          <BrowserRouter>
            <Component />
          </BrowserRouter>
        ) : (
          <p>Rendered component will appear here.</p>
        )}
        {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      </div>
    </div>
  );
};

export default DynamicComponentWithStyle;
