# Newton's Method Interactive Visualization

## Project Overview
Create an interactive mathematical graphing website that visualizes Newton's method for root-finding.

### Core Requirements
1. Interactive graph (pan, zoom, click-to-identify functions)
2. User function input with graphing
3. Newton's method visualization with step-by-step iterations
4. Tangent line visualization at each iteration

---

## Chosen Approach: React + Vite + JSXGraph

**Tech Stack:**
- React 18 with Vite (fast dev server, modern build)
- JSXGraph for interactive math visualization
- math.js for safe expression parsing
- CSS Modules or plain CSS for styling

**Why this combination:**
- React provides component-based architecture and clean state management for iterations
- JSXGraph handles all the math visualization (curves, points, tangent lines, zoom/pan)
- Vite offers fast HMR and simple setup
- math.js safely parses user-entered mathematical expressions

---

## Project Structure

```
newton-method-visualizer/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── jsxgraph.css
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main app component
│   ├── App.css               # Global styles
│   ├── index.css             # Base styles
│   ├── components/
│   │   ├── Graph.jsx         # JSXGraph wrapper component
│   │   ├── Graph.css
│   │   ├── Controls.jsx      # Function input, start guess, buttons
│   │   ├── Controls.css
│   │   ├── IterationList.jsx # Shows iteration history
│   │   └── IterationList.css
│   └── utils/
│       ├── newton.js         # Newton's method calculations
│       └── mathParser.js     # Safe math expression parsing
```

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Newton's Method Algorithm

```
Given: f(x), initial guess x_0, tolerance ε

For n = 0, 1, 2, ...
  1. Evaluate f(x_n) and f'(x_n)
  2. If |f(x_n)| < ε, we found the root
  3. If f'(x_n) = 0, method fails (horizontal tangent)
  4. Compute x_{n+1} = x_n - f(x_n) / f'(x_n)
  5. Draw tangent line at (x_n, f(x_n))
  6. Repeat
```

---

## Features

- **Function Input**: Enter any function using standard math notation (e.g., `x^2 - 2`, `sin(x)`, `x^3 - x - 1`)
- **Interactive Graph**: Pan by dragging, zoom with scroll wheel
- **Step-by-Step Iterations**: Click "Next Iteration" to see each step of Newton's method
- **Visual Elements**: Points on curve, tangent lines, vertical lines to x-axis
- **Iteration History**: Table showing all iteration values
- **Convergence Tracking**: Visual indicator when root is found

---

## Hosting (for later)
When ready to deploy: GitHub Pages, Netlify, or Vercel (all free for static sites)
