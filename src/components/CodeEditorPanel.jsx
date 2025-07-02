import React, { useRef, useState, useEffect } from 'react';
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
  
  // Undo/Redo functionality
  const [jsHistory, setJsHistory] = useState([jsCode]);
  const [jsHistoryIndex, setJsHistoryIndex] = useState(0);
  const [cssHistory, setCssHistory] = useState([cssCode]);
  const [cssHistoryIndex, setCssHistoryIndex] = useState(0);

  // Auto-closing brackets configuration
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`',
    '<': '>'
  };

  // HTML tags that should auto-complete
  const htmlTags = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'button', 'input', 'form', 'label',
    'section', 'article', 'header', 'footer', 'nav', 'main',
    'aside', 'figure', 'figcaption', 'table', 'tr', 'td', 'th',
    'thead', 'tbody', 'tfoot', 'img', 'video', 'audio', 'canvas',
    'svg', 'path', 'g', 'rect', 'circle', 'ellipse', 'line',
    'polyline', 'polygon', 'text', 'strong', 'em', 'small',
    'mark', 'del', 'ins', 'sub', 'sup', 'blockquote', 'cite',
    'q', 'abbr', 'address', 'time', 'code', 'pre', 'kbd', 'samp',
    'var', 'details', 'summary', 'dialog', 'menu', 'menuitem'
  ];

  // Clear all code functionality
  const clearAllCode = () => {
    if (window.confirm('Are you sure you want to clear all code? This action cannot be undone.')) {
      const emptyJs = '';
      const emptyCss = '';
      
      setJsCode(emptyJs);
      setCssCode(emptyCss);
      
      // Add to history
      addToHistory(emptyJs, 'javascript');
      addToHistory(emptyCss, 'css');
    }
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

  // History management
  const addToHistory = (value, language) => {
    if (language === 'javascript') {
      const newHistory = jsHistory.slice(0, jsHistoryIndex + 1);
      newHistory.push(value);
      if (newHistory.length > 50) newHistory.shift(); // Keep max 50 states
      setJsHistory(newHistory);
      setJsHistoryIndex(newHistory.length - 1);
    } else if (language === 'css') {
      const newHistory = cssHistory.slice(0, cssHistoryIndex + 1);
      newHistory.push(value);
      if (newHistory.length > 50) newHistory.shift(); // Keep max 50 states
      setCssHistory(newHistory);
      setCssHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = (language) => {
    if (language === 'javascript' && jsHistoryIndex > 0) {
      const newIndex = jsHistoryIndex - 1;
      setJsHistoryIndex(newIndex);
      setJsCode(jsHistory[newIndex]);
    } else if (language === 'css' && cssHistoryIndex > 0) {
      const newIndex = cssHistoryIndex - 1;
      setCssHistoryIndex(newIndex);
      setCssCode(cssHistory[newIndex]);
    }
  };

  const redo = (language) => {
    if (language === 'javascript' && jsHistoryIndex < jsHistory.length - 1) {
      const newIndex = jsHistoryIndex + 1;
      setJsHistoryIndex(newIndex);
      setJsCode(jsHistory[newIndex]);
    } else if (language === 'css' && cssHistoryIndex < cssHistory.length - 1) {
      const newIndex = cssHistoryIndex + 1;
      setCssHistoryIndex(newIndex);
      setCssCode(cssHistory[newIndex]);
    }
  };

  // Enhanced HTML tag auto-completion
  const handleHtmlTagCompletion = (value, selectionStart, language) => {
    // Check if we just typed a closing >
    const beforeCursor = value.substring(0, selectionStart);
    const tagMatch = beforeCursor.match(/<(\w+)([^>]*)>$/);
    
    if (tagMatch) {
      const tagName = tagMatch[1];
      const attributes = tagMatch[2];
      
      // Check if it's a self-closing tag or if it already has a closing tag nearby
      const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      
      if (selfClosingTags.includes(tagName.toLowerCase())) {
        return null; // Don't auto-complete self-closing tags
      }
      
      // Check if there's already a closing tag
      const afterCursor = value.substring(selectionStart);
      const hasClosingTag = afterCursor.includes(`</${tagName}>`);
      
      if (!hasClosingTag && htmlTags.includes(tagName.toLowerCase())) {
        const newValue = beforeCursor + `</${tagName}>` + afterCursor;
        return {
          newValue,
          cursorPosition: selectionStart
        };
      }
    }
    
    return null;
  };

  const handleKeyDown = (e, language) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;
    
    // Handle Ctrl+Z (Undo) and Ctrl+Y (Redo)
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo(language);
        return;
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo(language);
        return;
      }
    }
    
    // Handle auto-closing brackets
    if (bracketPairs[e.key]) {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + e.key + bracketPairs[e.key] + afterCursor;
      
      if (language === 'javascript') {
        setJsCode(newValue);
        addToHistory(newValue, 'javascript');
      } else if (language === 'css') {
        setCssCode(newValue);
        addToHistory(newValue, 'css');
      }
      
      // Position cursor between brackets
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Enhanced HTML tag completion on >
    if (e.key === '>' && language === 'javascript') {
      const beforeCursor = value.substring(0, selectionStart);
      // Check if we're inside a JSX tag
      const tagMatch = beforeCursor.match(/<(\w+)([^>]*)$/);
      
      if (tagMatch) {
        const tagName = tagMatch[1];
        const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        
        if (!selfClosingTags.includes(tagName.toLowerCase()) && htmlTags.includes(tagName.toLowerCase())) {
          e.preventDefault();
          const afterCursor = value.substring(selectionEnd);
          const newValue = beforeCursor + `></${tagName}>` + afterCursor;
          
          setJsCode(newValue);
          addToHistory(newValue, 'javascript');
          
          // Position cursor between opening and closing tags
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
          }, 0);
          return;
        }
      }
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + '  ' + afterCursor;
      
      if (language === 'javascript') {
        setJsCode(newValue);
        addToHistory(newValue, 'javascript');
      } else if (language === 'css') {
        setCssCode(newValue);
        addToHistory(newValue, 'css');
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
        addToHistory(newValue, 'javascript');
      } else if (language === 'css') {
        setCssCode(newValue);
        addToHistory(newValue, 'css');
      }
      
      setTimeout(() => {
        const newPosition = selectionStart + newIndent.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const handleInputChange = (e, language) => {
    const value = e.target.value;
    if (language === 'javascript') {
      setJsCode(value);
      // Add to history with debounce for performance
      clearTimeout(window.jsHistoryTimeout);
      window.jsHistoryTimeout = setTimeout(() => {
        addToHistory(value, 'javascript');
      }, 500);
    } else if (language === 'css') {
      setCssCode(value);
      // Add to history with debounce for performance
      clearTimeout(window.cssHistoryTimeout);
      window.cssHistoryTimeout = setTimeout(() => {
        addToHistory(value, 'css');
      }, 500);
    }
  };

  const applySyntaxHighlighting = (code, language) => {
    if (language === 'javascript') {
      return code
        // JSX elements and React components
        .replace(/(<\/?)([A-Z][a-zA-Z0-9]*|[a-z]+)(\s[^>]*)?>/g, (match, open, tag, attrs) => {
          return `${open}<span class="vscode-jsx-tag">${tag}</span>${attrs || ''}>`;
        })
        // JSX attributes
        .replace(/(\w+)=(?={)/g, '<span class="vscode-jsx-attribute">$1</span>=')
        .replace(/(\w+)="([^"]*)"/g, '<span class="vscode-jsx-attribute">$1</span>="<span class="vscode-string">$2</span>"')
        // Keywords
        .replace(/\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|class|extends|import|export|from|as|async|await|new|typeof|instanceof)\b/g, '<span class="vscode-keyword">$1</span>')
        // Boolean and null values
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="vscode-boolean">$1</span>')
        // React hooks and components
        .replace(/\b(React|useState|useEffect|useRef|useCallback|useMemo|useContext|useReducer|useImperativeHandle|useLayoutEffect|useDebugValue|Component|PureComponent|Fragment)\b/g, '<span class="vscode-react-keyword">$1</span>')
        // Built-in objects and methods
        .replace(/\b(console|window|document|localStorage|sessionStorage|Math|Date|Array|Object|String|Number|Boolean|JSON|Promise|setTimeout|setInterval|clearTimeout|clearInterval)\b/g, '<span class="vscode-builtin">$1</span>')
        // Method calls
        .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '.<span class="vscode-method">$1</span>(')
        // Strings
        .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="vscode-string">$1$2$1</span>')
        // Template literals
        .replace(/(`[^`]*`)/g, '<span class="vscode-template-string">$1</span>')
        // Numbers
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="vscode-number">$1</span>')
        // Comments
        .replace(/\/\/.*$/gm, '<span class="vscode-comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="vscode-comment">$&</span>')
        // This keyword
        .replace(/\bthis\b/g, '<span class="vscode-this">this</span>')
        // Function names
        .replace(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 'function <span class="vscode-function-name">$1</span>')
        // Arrow functions
        .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*{/g, '<span class="vscode-function-name">$1</span> => {');
    } else if (language === 'css') {
      return code
        // CSS selectors (classes, IDs, elements, pseudo-classes)
        .replace(/([.#]?[a-zA-Z-_][a-zA-Z0-9-_]*(?::[a-zA-Z-_]+)?)\s*{/g, '<span class="vscode-css-selector">$1</span> {')
        // CSS at-rules
        .replace(/@([a-zA-Z-]+)/g, '<span class="vscode-css-at-rule">@$1</span>')
        // CSS properties
        .replace(/([a-zA-Z-]+)\s*:/g, '<span class="vscode-css-property">$1</span>:')
        // CSS values
        .replace(/:\s*([^;{}\/\*]+)/g, (match, value) => {
          let formattedValue = value.trim();
          // Color values (hex)
          formattedValue = formattedValue.replace(/#[a-fA-F0-9]{3,8}/g, '<span class="vscode-css-color">$&</span>');
          // RGB/RGBA values
          formattedValue = formattedValue.replace(/rgba?\([^)]+\)/g, '<span class="vscode-css-color">$&</span>');
          // Units
          formattedValue = formattedValue.replace(/(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw|fr|s|ms|deg|turn|rad)/g, '<span class="vscode-number">$1</span><span class="vscode-css-unit">$2</span>');
          // Numbers without units
          formattedValue = formattedValue.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="vscode-number">$1</span>');
          // Important
          formattedValue = formattedValue.replace(/!important/g, '<span class="vscode-css-important">!important</span>');
          return ': <span class="vscode-css-value">' + formattedValue + '</span>';
        })
        // Strings
        .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="vscode-string">$1$2$1</span>')
        // Comments
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="vscode-comment">$&</span>');
    }
    return code;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Inline styles for the clear button
  const clearButtonStyle = {
    background: ' #ff4757',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 12px',
    marginLeft: '1px',
    marginTop:'10px',
    marginRight:'20px',

    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(255, 71, 87, 0.3)',
    // display: 'flex',
    // alignItems: 'center',
    gap: '4px'
  };

  const clearButtonHoverStyle = {
    ...clearButtonStyle,
    background: 'linear-gradient(45deg, #ff3742, #ff5722)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(255, 71, 87, 0.4)'
  };

  return (
    <div className={`vscode-editors-panel ${isDarkMode ? 'vscode-dark-theme' : 'vscode-light-theme'}`}>
      <div className="vscode-toolbar">
        <div className="vscode-toolbar-left">
          <span className="vscode-toolbar-title">Code Editor</span>
        </div>
        <div className="vscode-toolbar-right clear-button">
          
          <button 
            style={clearButtonStyle}
            onClick={clearAllCode}
            title="Clear all code"
            onMouseEnter={(e) => {
              Object.assign(e.target.style, clearButtonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, clearButtonStyle);
            }}
          >
            🗑️ CLEAR
          </button>
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
              onChange={(e) => handleInputChange(e, 'javascript')}
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
              onChange={(e) => handleInputChange(e, 'css')}
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