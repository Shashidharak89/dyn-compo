import React from 'react';
import { Copy } from 'lucide-react';
import './styles/CodeEditor.css';

const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  placeholder, 
  copyToClipboard, 
  textareaRef 
}) => {
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
          ref={textareaRef}
        />
      </div>
    </div>
  );
};

export default CodeEditor;