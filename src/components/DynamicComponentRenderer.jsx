import React, { useState } from 'react';
import * as Babel from '@babel/standalone';

const DynamicComponentRenderer = () => {
  const [input, setInput] = useState('');
  const [Component, setComponent] = useState(null);

  const handleRender = () => {
    try {
      const code = Babel.transform(input, { presets: ['react'] }).code;
      const component = new Function('React', `return ${code}`)(React);
      setComponent(() => component);
    } catch (err) {
      console.error('Error compiling JSX:', err);
      setComponent(() => () => <div style={{ color: 'red' }}>Invalid JSX</div>);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <textarea
        rows="10"
        cols="60"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter JSX here (e.g., <h1>Hello</h1>)"
      />
      <br />
      <button onClick={handleRender}>Render Component</button>
      <hr />
      <div>
        {Component ? <Component /> : <p>Component output will appear here</p>}
      </div>
    </div>
  );
};

export default DynamicComponentRenderer;
