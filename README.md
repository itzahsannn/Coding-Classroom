# Coding Classroom

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

A modern, highly interactive Learning Management System (LMS) frontend tailored for Computer Science education. **Coding Classroom** bridges the gap between traditional assignment platforms and live coding IDEs, allowing instructors to seamlessly distribute coding assignments and students to execute code within a unified, aesthetically premium interface.

---

## Features

- **Figma-Meticulous Design**: A pristine, modern UI crafted with Tailwind CSS to prioritize readability, focus, and a premium "glass/minimalist" aesthetic.
- **Integrated Coding Playground**: A dedicated execution environment featuring interactive file tabs (e.g., Python vs JavaScript), live-updating output terminals, and a responsive editor interface. Students can securely transition from assignment requirements directly into the execution playground.
- **Dual Client Architecture**: Dynamic rendering of dashboards allowing for segmented experiences:
  - **Teachers**: Can blast announcements, review pending work, manage the class roster, and dictate assignment schemas.
  - **Students**: Receive priority views on upcoming deadlines, graded artifacts, and a streamlined stream of lecture announcements.
- **Visual Course Calendar**: A custom-built CSS grid calendar mapping out upcoming assignments and lectures across distinct nested courses.

## Tech Stack

Built with enterprise-ready frontend technologies emphasizing performance and type-safety:

- **Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) - For lightning-fast HMR and optimized production bundles.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework enabling rapid, highly responsive UI deployment without bloated CSS files.
- **Routing**: [React Router DOM v6](https://reactrouter.com/) - Handling complex nested layouts, private routes, and query parametrization for assignment deep-links.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node.js (v16.14.0 or newer) installed.

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/itzahsannn/Coding-Classroom.git
   cd Coding-Classroom/coding-classroom-frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to \`http://localhost:5173\` (or the port specified in your terminal).

> **Note**: The application initializes to the \`/login\` route by default. Authentication is currently operating in local-mock mode, so supplying any credentials will successfully authenticate and generate a session.

## Architecture & Directory Structure

The project strictly follows a scalable, component-driven directory hierarchy:

\`\`\`text
src/
├── api/             # Mock services and network delays resolving JSON payloads
├── components/
│   ├── common/      # Reusable agnostic UI elements (Spinners, Buttons, Inputs)
│   ├── course/      # Specific layout structures for classes (Tabs, Headers, Cards)
│   └── layout/      # Parent layout wrappers (DashboardLayout, TopBars)
├── hooks/           # Custom React Hooks (useFetch for synthetic async data)
├── pages/           # High-level route entry components (Playground, Dashboard, Auth)
│   └── auth/        # Specialized authentication screens
├── App.tsx          # Root Component & Global Providers
└── ClassroomRoutes.tsx # Centralized Routing Logic
\`\`\`

## 🛣 Roadmap / Upcoming Integrations

While the frontend visualization and workflow logic are completed, the following backend/infrastructure tasks are scheduled for subsequent sprints:

- [ ] **Dockerized Code Execution**: Binding the Coding Playground's virtual terminal to a backend sandboxed container service (e.g. AWS Lambda / Docker instances) to safely execute raw Python/Node.js logic.
- [ ] **PostgreSQL Data Layer**: Replacing the \`api/index.ts\` mock handlers with GraphQL / REST API calls syncing to a fully clustered database schema.
- [ ] **JWT Authentication**: Migrating mock-logins to OAuth 2.0 (Google Workspace integration) using HTTP-only secure cookies.

## Developers
  - Muhammad Ahsan (23L-0621)
  - Abdullah Mushtaq (23L-0892)

