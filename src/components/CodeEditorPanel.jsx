import React, { useRef } from 'react';
import CodeEditor from './CodeEditor';
import './styles/CodeEditorPanel.css';

const CodeEditorPanel = ({
  jsCode,
  setJsCode,
  cssCode,
  setCssCode,
  copyToClipboard,
  layout
}) => {
  const jsTextareaRef = useRef(null);
  const cssTextareaRef = useRef(null);

  return (
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
          copyToClipboard={copyToClipboard}
          textareaRef={jsTextareaRef}
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
          copyToClipboard={copyToClipboard}
          textareaRef={cssTextareaRef}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;