import React, { useState } from 'react';
import * as Babel from '@babel/standalone';

import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Home, Menu, ArrowRight } from 'lucide-react';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useNavigate,
    useParams,
    useLocation
} from 'react-router-dom';


const DynamicComponentWithStyle = () => {
    const [jsCode, setJsCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState('');

    const renderComponent = () => {
        try {
            setError('');

            // Remove import lines like `import React from 'react';`
            const cleanedCode = jsCode.replace(/import\s+.*?from\s+['"].*?['"];/g, '');

            // Compile JSX to JavaScript
            const transformedCode = Babel.transform(cleanedCode, {
                presets: ['react', 'env'],
            }).code;

            // Inject dynamic CSS
            let styleTag = document.getElementById('dynamic-style');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'dynamic-style';
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = cssCode;

            // Fake CommonJS exports
            const exports = {};

            // Simulate imports
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
                        useLocation
                    };
                }
                throw new Error(`❌ Package "${pkg}" is not supported.`);
            };


            // Execute the code with access to React and supported imports
            const scopeFunction = new Function('React', 'require', 'exports', transformedCode);
            scopeFunction(React, require, exports);

            const ExportedComponent = exports.default || exports.Component;
            if (!ExportedComponent) throw new Error('No default/component export found');

            setComponent(() => ExportedComponent);
        } catch (err) {
            console.error('Compilation error:', err);
            setError(err.message);
            setComponent(() => () => <div style={{ color: 'red' }}>❌ {err.message}</div>);
        }
    };

    return (
        <div style={{ background: '#111', color: 'white', padding: '2rem', minHeight: '100vh' }}>
            <h2>⚛️ Dynamic Component + CSS Renderer</h2>
            <p>Supported imports: <code>react, lodash, axios, moment, dayjs, uuid</code></p>

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
                placeholder={`button { background: purple; color: white; padding: 0.5rem; border: none; border-radius: 5px; }`}
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
            />

            <button
                onClick={renderComponent}
                style={{
                    padding: '0.5rem 1rem',
                    background: 'purple',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                ▶️ Render
            </button>

            <hr />
            <h3>🖥️ Output:</h3>
            <div style={{ background: '#222', padding: '1rem', borderRadius: '10px', marginTop: '1rem' }}>
                {Component ? <Component /> : <p>Rendered component will appear here.</p>}
                {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
            </div>
        </div>
    );
};

export default DynamicComponentWithStyle;
