import React, { useState } from 'react';
import * as Babel from '@babel/standalone';

const DynamicComponentWithStyle = () => {
  const [jsCode, setJsCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState('');

  const renderComponent = () => {
    try {
      setError('');

      // Remove import lines (like `import React from 'react';`)
      const cleanedCode = jsCode.replace(/import\s+.*?from\s+['"].*?['"];/g, '');

      // Compile with Babel
      const transformedCode = Babel.transform(cleanedCode, {
        presets: ['react', 'env'],
      }).code;

      // Inject CSS
      let styleTag = document.getElementById('dynamic-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-style';
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = cssCode;

      // Execute JS: inject React into the scope of the compiled code
      const exports = {};
      const scopeFunction = new Function('React', 'exports', transformedCode);
      scopeFunction(React, exports);

      const ExportedComponent = exports.default || exports.Component;
      if (!ExportedComponent) throw new Error('No component exported');

      setComponent(() => ExportedComponent);
    } catch (err) {
      console.error('Compilation error:', err);
      setError(err.message);
      setComponent(() => () => <div style={{ color: 'red' }}>❌ {err.message}</div>);
    }
  };

  return (
    <div style={{ background: '#111', color: 'white', padding: '2rem', minHeight: '100vh' }}>
      <h2>⚛️ Dynamic Component + CSS Renderer (React Scoped)</h2>

      <label>JSX/React Code:</label>
      <textarea
        rows="12"
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder={`import React from 'react';

function MyComp() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>;
}

export default MyComp;
`}
        value={jsCode}
        onChange={(e) => setJsCode(e.target.value)}
      />

      <label>CSS Code:</label>
      <textarea
        rows="6"
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder={`button { background: purple; color: white; padding: 0.5rem; }`}
        value={cssCode}
        onChange={(e) => setCssCode(e.target.value)}
      />

      <button
        onClick={renderComponent}
        style={{ padding: '0.5rem 1rem', background: 'purple', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        ▶️ Render
      </button>

      <hr />
      <h3>🖥️ Output:</h3>
      <div style={{ background: '#222', padding: '1rem', borderRadius: '10px' }}>
        {Component ? <Component /> : <p>Rendered component will appear here.</p>}
        {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      </div>
    </div>
  );
};

export default DynamicComponentWithStyle;
