import React, { useRef, useState, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [jsLineNumbers, setJsLineNumbers] = useState([1]);
  const [cssLineNumbers, setCssLineNumbers] = useState([1]);

  // Auto-closing brackets configuration
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  // Update line numbers when code changes
  useEffect(() => {
    const jsLines = jsCode.split('\n').length;
    setJsLineNumbers(Array.from({ length: jsLines }, (_, i) => i + 1));
  }, [jsCode]);

  useEffect(() => {
    const cssLines = cssCode.split('\n').length;
    setCssLineNumbers(Array.from({ length: cssLines }, (_, i) => i + 1));
  }, [cssCode]);

  const handleKeyDown = (e, language) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;
    
    // Handle auto-closing brackets
    if (bracketPairs[e.key]) {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + e.key + bracketPairs[e.key] + afterCursor;
      
      if (language === 'javascript') {
        setJsCode(newValue);
      } else if (language === 'css') {
        setCssCode(newValue);
      }
      
      // Position cursor between brackets
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + '  ' + afterCursor;
      
      if (language === 'javascript') {
        setJsCode(newValue);
      } else if (language === 'css') {
        setCssCode(newValue);
      }
      
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }, 0);
      return;
    }

    // Handle Enter key for auto-indentation
    if (e.key === 'Enter') {
      const beforeCursor = value.substring(0, selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Add extra indentation if line ends with opening bracket
      const extraIndent = /[{(\[]$/.test(currentLine.trim()) ? '  ' : '';
      
      e.preventDefault();
      const newIndent = '\n' + currentIndent + extraIndent;
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + newIndent + afterCursor;
      
      if (language === 'javascript') {
        setJsCode(newValue);
      } else if (language === 'css') {
        setCssCode(newValue);
      }
      
      setTimeout(() => {
        const newPosition = selectionStart + newIndent.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const applySyntaxHighlighting = (code, language) => {
    if (language === 'javascript') {
      return code
        .replace(/\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|class|extends|import|export|from|as|async|await|true|false|null|undefined|this|super|new|typeof|instanceof)\b/g, '<span class="vscode-keyword">$1</span>')
        .replace(/\b(React|useState|useEffect|useRef|useCallback|useMemo|useContext|Component|Fragment)\b/g, '<span class="vscode-react-keyword">$1</span>')
        .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="vscode-string">$1$2$1</span>')
        .replace(/\/\/.*$/gm, '<span class="vscode-comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="vscode-comment">$&</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="vscode-number">$1</span>')
        .replace(/\b(console|window|document|localStorage|sessionStorage)\b/g, '<span class="vscode-builtin">$1</span>');
    } else if (language === 'css') {
      return code
        .replace(/([.#]?[a-zA-Z-_][a-zA-Z0-9-_]*)\s*{/g, '<span class="vscode-css-selector">$1</span> {')
        .replace(/([a-zA-Z-]+)\s*:/g, '<span class="vscode-css-property">$1</span>:')
        .replace(/:\s*([^;{}]+)/g, ': <span class="vscode-css-value">$1</span>')
        .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="vscode-string">$1$2$1</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="vscode-comment">$&</span>')
        .replace(/#[a-fA-F0-9]{3,6}\b/g, '<span class="vscode-css-color">$&</span>')
        .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|fr|s|ms))\b/g, '<span class="vscode-css-unit">$1</span>');
    }
    return code;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`vscode-editors-panel ${isDarkMode ? 'vscode-dark-theme' : 'vscode-light-theme'}`}>
      <div className="vscode-toolbar">
        <div className="vscode-toolbar-left">
          <span className="vscode-toolbar-title">Code Editor</span>
        </div>
        <div className="vscode-toolbar-right">
          <button 
            className="vscode-theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="vscode-editor-container">
        <div className="vscode-editor-header">
          <div className="vscode-tab vscode-tab-active">
            <span className="vscode-tab-icon">📄</span>
            <span>Component.jsx</span>
          </div>
        </div>
        <div className="vscode-editor-wrapper">
          <div className="vscode-line-numbers">
            {jsLineNumbers.map(num => (
              <div key={num} className="vscode-line-number">{num}</div>
            ))}
          </div>
          <div className="vscode-code-container">
            <div 
              className="vscode-syntax-overlay"
              dangerouslySetInnerHTML={{
                __html: applySyntaxHighlighting(jsCode, 'javascript')
              }}
            />
            <textarea
              ref={jsTextareaRef}
              value={jsCode}
              onChange={(e) => setJsCode(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'javascript')}
              placeholder="Enter your React component code here..."
              className="vscode-textarea"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>

      <div className="vscode-editor-container">
        <div className="vscode-editor-header">
          <div className="vscode-tab vscode-tab-active">
            <span className="vscode-tab-icon">🎨</span>
            <span>styles.css</span>
          </div>
        </div>
        <div className="vscode-editor-wrapper">
          <div className="vscode-line-numbers">
            {cssLineNumbers.map(num => (
              <div key={num} className="vscode-line-number">{num}</div>
            ))}
          </div>
          <div className="vscode-code-container">
            <div 
              className="vscode-syntax-overlay"
              dangerouslySetInnerHTML={{
                __html: applySyntaxHighlighting(cssCode, 'css')
              }}
            />
            <textarea
              ref={cssTextareaRef}
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'css')}
              placeholder="Enter your CSS styles here..."
              className="vscode-textarea"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPanel;