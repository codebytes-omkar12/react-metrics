# 📊 React Metrics Dashboard

A modern, full-stack developer tool for analyzing React component performance, memory usage, and hook utilization in real-time. This dashboard provides deep insights into your application's health, helping you optimize and maintain robust React apps.

---

## ✨ Features

### Component Performance Dashboard

- Visualize re-renders, render durations, and memory usage of your React components in real time.
- Explore an interactive component hierarchy tree with detailed metrics for each node.

### Live Hook Analysis

- Analyze and display all React hooks used in your codebase, including their arguments and TSDoc descriptions.

### AI-Powered Health Analysis

- Get an AI-generated health score (0-100) for your components based on performance metrics and best practices.
- Receive concise, AI-powered summaries with actionable recommendations for improvement.

### Secure & Flexible Backend

- An Express server handles static code analysis, file listing, and communication with the Gemini API.

### Dark Mode

- A sleek, modern UI with a toggleable dark mode for comfortable viewing.

---

## 🛠️ Tech Stack

| Category           | Technology                                   |
|--------------------|----------------------------------------------|
| **Frontend**       | React, Vite, TypeScript, Tailwind CSS        |
| **State Management** | Zustand                                   |
| **Data Visualization** | Recharts                                |
| **Backend**        | Node.js, Express, TypeScript                 |
| **AI Integration** | Google Gemini                                |
| **Linting**        | ESLint, TypeScript ESLint                    |

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm (v8.0.0 or higher recommended)
- A Google Gemini API Key

### Installation & Setup

**Clone the repository:**
```sh
git clone <your-repository-url>
cd react-metrics
```

**Install dependencies:**
```sh
npm install
```

**Configure Environment Variables:**

Create a `.env` file in the root of the project directory and add your Gemini API key:
```sh
# .env
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
This serves as a fallback. You can also enter the key directly in the UI.

**Run the application:**

This project requires two terminal sessions to run concurrently.

**Terminal 1: Start the Backend Server**
```sh
npm run backend:dev
```
The analyzer server will start on [http://localhost:5001](http://localhost:5001).

**Terminal 2: Start the Frontend App**
```sh
npm run dev
```
The React application will be available at [http://localhost:5173](http://localhost:5173).

**Add your API Key in the UI:**

Open the application in your browser, click the settings (gear) icon in the top right, and enter your Gemini API Key to enable the AI features.

---

## 🔬 How to Monitor a Component

To track a component's performance metrics, you need to wrap it with the `withPerformanceMonitor` Higher-Order Component (HOC). This HOC injects the necessary logic to measure render times, re-renders, and memory usage.

**Example Usage**
```js
// src/components/MyComponent.tsx
import React from 'react';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

const MyComponent = (props) => {
  // ...component logic...
};

// Wrap the component with the HOC before exporting
export default withPerformanceMonitor(MyComponent, { id: 'MyComponent' });
```

Once wrapped, `MyComponent` will automatically appear in the dashboard's component hierarchy, and its performance data will be collected in real-time.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server for the frontend.
- `npm run backend:dev`: Starts the backend Express server with nodemon.
- `npm run build`: Builds the production-ready application.
- `npm run lint`: Lints the entire codebase using ESLint.
- `npm run preview`: Serves the production build locally.

---

## 📂 Project Structure

```
Backend/         — Express backend for static analysis & AI integration
src/             — React frontend (components, hooks, context, utils)
public/          — Static assets for the Vite frontend
package.json     — Project dependencies and scripts
tailwind.config.js — Tailwind CSS configuration
tsconfig.*.json  — TypeScript configurations
```

---

## 🔐 Security & Monitoring

- Uses `helmet`, `compression`, `morgan`, and `cors` for backend security and observability.
- Health check endpoint available at `/health`.

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch
3. Submit a pull request

---

## 📝 License

MIT
