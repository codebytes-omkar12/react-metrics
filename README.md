# React Metrics

A modern, full-stack developer tool for analyzing React component performance, memory usage, and hook utilization. Built with React, Vite, TypeScript, Express, and TailwindCSS.

---

## Features

- **Component Performance Dashboard:**
  - Visualize re-renders, render durations, and memory usage of your React components in real time.
  - Interactive component hierarchy tree with detailed metrics for each node.
- **Hook Analysis:**
  - Analyze and display all React hooks used in your codebase, including their arguments and descriptions.
  - File picker and dashboard for per-file hook usage.
- **Backend Analyzer:**
  - Express server for static code analysis and file listing.
  - Secure, production-ready setup with helmet, compression, CORS, and request logging.
- **Production-Ready:**
  - Strict TypeScript setup with project references and shared base config.
  - Linting, formatting, and security best practices.
  - Health check endpoint for monitoring and uptime checks.

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the backend analyzer:**
   ```sh
   npm run backend   # or: node Backend/analyzeHook.js
   ```
3. **Start the frontend app:**
   ```sh
   npm run dev
   ```
4. **Open your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

---

## Project Structure

- `src/` — React frontend (components, hooks, context, utils)
- `Backend/` — Express backend for static analysis
- `tsconfig.*.json` — TypeScript configs for each part of the project
- `package.json` — Project dependencies and scripts

---

## Security & Monitoring

- Uses `helmet`, `compression`, `morgan`, and `express-validator` for backend security and observability
- Health check endpoint at `/health`
- All dependencies are up-to-date and production-ready

---

## Contributing

1. Fork this repo
2. Create a feature branch
3. Submit a pull request

---

## License

MIT
