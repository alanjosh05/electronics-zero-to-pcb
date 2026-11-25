// Shared Tailwind theme for every lesson and reference page.
// Load order in <head>:  tailwind play CDN  →  this file  →  course.css
// Palette follows the warm "paper" look of designed-to-scale.vercel.app.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: '#f4ebe0',
        sheet: '#f9f2e8',
        card: '#f8f0e6',
        line: '#ddd3c5',
        'line-strong': '#c6bbac',
        ink: '#1d1b18',
        'ink-2': '#34302b',
        muted: '#6f6961',
        rust: '#d0683a',
        'rust-2': '#d97a4f',
        leaf: '#cfe3b2',
        'leaf-2': '#7fc278',
        'leaf-ink': '#2a7a3d',
        violet: '#e7ddf5',
        'violet-ink': '#5a43a6',
        peach: '#fcdcbd',
        sky: '#d6e5f6',
        'sky-ink': '#1f63a0',
        danger: '#c0392b',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        pop: '1.5px 2.5px 0 #1d1b18',
        'pop-lg': '3px 4px 0 #1d1b18',
      },
      borderRadius: { xl2: '12px' },
    },
  },
};
