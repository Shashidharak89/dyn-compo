<!-- README.md -->

<div align="center" style="background:#111; padding:30px; border-radius:12px; color:#fff; font-family:sans-serif">

  <img src="public/logo.png" alt="Dynamic Component Renderer Logo" width="120" style="margin-bottom:20px;" />
  
  <h1 style="color:#ffffff; font-size:2.2rem;">⚛️ Dynamic Component Renderer</h1>

  <p style="color: #ccc; max-width: 500px;">
    Write, render, and preview React components with live JSX & CSS. Supports full-screen preview and import libraries.
  </p>

  <a href="https://dynamic-component-render.vercel.app/" target="_blank" style="color:#79f2ff;font-size:1rem;text-decoration:none;display:inline-block;margin-top:10px;">🌐 Visit Live App →</a>
</div>

---

## 🚀 Features

- 🎨 Live JSX and CSS editor
- 📦 Supports libraries like: `react`, `axios`, `lodash`, `moment`, `dayjs`, `uuid`, `lucide-react`, `react-router-dom`
- 🔄 Optional Live Update mode
- 🖥️ Fullscreen preview with toggle
- 🌑 Clean dark mode interface

---

## 🔧 How It Works

### 1. ✍️ Write JSX/React code

```jsx
import React from 'react';
import { Menu } from 'lucide-react';

function MyComponent() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <Menu color="lime" />
      <h1>Hello World</h1>
      <button onClick={() => setCount(c => c + 1)}>Click {count}</button>
    </div>
  );
}

export default MyComponent;
