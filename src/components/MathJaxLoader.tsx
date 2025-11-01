import { useEffect } from 'react';

declare global {
  interface Window {
    MathJax?: {
      typeset: () => void;
    };
  }
}

export function MathJaxLoader() {
  useEffect(() => {
    // Inject MathJax config and script if not already loaded
    if (!window.MathJax) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.text = `
        window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    svg: { fontCache: 'global' },
    startup: {
      ready: () => {
        console.log('MathJax is loaded and ready!');
		window.__MathJaxReady = true; // ✅ custom global flag
        MathJax.startup.defaultReady();
      }
    }
  };
      `;
      document.head.appendChild(configScript);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return null; // This component just loads the scripts; nothing visible
}


export default MathJaxLoader;