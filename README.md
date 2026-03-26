# Next.js Spreadsheet

A web-based spreadsheet application built with Next.js and React. This project demonstrates high-performance data grids with virtualization, complex state management, and versatile export capabilities (Excel and PDF).

## 🚀 Features

- **High Performance Grid:** Renders large datasets efficiently using `@tanstack/react-virtual`.
- **Complex State Management:** Utilizes atomic state management with `jotai` and `jotai-family` for robust cell and sheet state.
- **Export Capabilities:**
  - Export to Excel (`.xlsx`) using `xlsx`.
  - Export to PDF with preview generation using `jspdf` and `jspdf-autotable`.
- **Type-Safe Styling:** Uses CSS Modules with `@css-modules-kit/codegen` for strict typed styles.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React](https://react.dev/) 19
- **State Management:** [Jotai](https://jotai.org/)
- **Virtualization:** [TanStack Virtual](https://tanstack.com/virtual/latest)
- **Styling:** CSS Modules, [destyle.css](https://nicolas-cusan.github.io/destyle.css/)
- **Linting & Formatting:** [Biome](https://biomejs.dev/)

## 🚦 Getting Started

### Prerequisites

Make sure you have Node.js (v20+) installed.

### Installation

```bash
npm install
```

### Development Server

Run the development server. This will automatically generate TypeScript definitions for CSS Modules before starting Next.js.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📦 Scripts

- `npm run dev`: Starts the development server and generates CSS module types.
- `npm run build`: Builds the app for production.
- `npm start`: Starts the production server.
- `npm run type:gen:css`: Manually generates TypeScript definitions for CSS Modules.
- `npm run type:check`: Runs TypeScript type checking.
- `npm run lint:check`: Checks formatting and linting rules using Biome.
- `npm run lint:fix`: Automatically fixes linting errors and formats code.
