# Agentic AI Learning Roadmap

A dynamic, full-stack web application designed to track a structured, 3-month journey to becoming a job-ready AI Agent Developer. It features a curated learning roadmap, an interactive knowledge base, and an administrator panel to seamlessly manage community resources.

## 🚀 Features

- **Interactive Roadmap Overview:** Clear visualization of learning phases, key topics, and weekly goals for mastering Agentic AI.
- **Resource Hub:** Contains articles, code snippets, and video links dynamically saved and fetched from a cloud database.
- **Admin Dashboard:** A secured portal designed for managing (CRUD operations) course resources on-the-fly.
- **Premium UI:** Fast, slick, and responsive components built with React and Tailwind CSS.
- **Vercel-Ready:** Complete configuration mapping the Express APIs seamlessly to Vercel Serverless Functions.

## 🛠 Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS (v4)
- Lucide React Icons

**Backend:**
- Node.js & Express
- Firebase Admin SDK (Firestore Database)
- Vercel Serverless Functions

## 📋 Prerequisites

To run this project locally, you will need:
- [Node.js](https://nodejs.org/en/) installed on your machine.
- A [Firebase Project](https://firebase.google.com/) configured with an active Firestore database, and a generated Service Account JSON.

## ⚙️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/agentic-ai-roadmap.git
   cd agentic-ai-roadmap
   ```

2. **Configure your Secrets:**
   Create a `config.json` inside the `backend` folder containing your Firebase Credentials and an Admin Secret (used for the Admin Panel login):

   ```json
   {
      "FIREBASE_SERVICE_ACCOUNT": {
         "type": "service_account",
         "project_id": "your-project-id",
         "private_key_id": "...",
         "private_key": "...",
         "client_email": "...",
         ... 
      },
      "ADMIN_SECRET": "your-super-secret-password"
   }
   ```
   *(Alternatively, export these as environment variables `FIREBASE_SERVICE_ACCOUNT_JSON` and `ADMIN_SECRET`)*

3. **Run the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend should default to `http://localhost:8080`*

4. **Run the Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Vite will proxy `/api` traffic directly to your backend automatically.*

## 🌐 Deployment to Vercel (Free Tier)

This repository is strictly configured to act as a monorepo when deployed gracefully to Vercel.

1. Create a new project on [Vercel](https://vercel.com) and import this repository.
2. Under "Framework Preset", leave it as **Other**.
3. Under "Environment Variables", configure the following keys:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: Paste your entire Firebase JSON payload. 
   - `ADMIN_SECRET`: Your secure password for dashboard access.
4. Click **Deploy**. 

Vercel will install the Node modules, build the Vite application into `frontend/dist`, and seamlessly serve your Express backend via `/api`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you'd like to help expand the roadmap or add more curated Agentic AI resources, feel free to open a Pull Request.

## ⚖️ License

Distributed under the MIT License.
