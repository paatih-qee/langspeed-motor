# Bengkel Information System - Langspeed Motor

An MVP (Minimum Viable Product) web application designed to help small-scale motorcycle workshops manage daily operations, from item management to processing service orders.

---

## ✨ Key Features

This application is built with a focus on the core functionalities most needed for workshop operations:

* **Product & Service Management:** Full CRUD (Create, Read, Update, Delete) functionality to manage spare parts (with stock) and service jobs (with rates).
* **Automatic Stock Management:** Product stock levels are automatically decremented whenever an item is used in a completed service order.
* **Service Order Management:** A complete workflow for creating new service orders, from recording customer data to adding multiple products and services.
* **Order History:** A page to view all transaction history, complete with status filtering ("In Progress" or "Completed").
* **User Authentication:** The system is secured with a login flow to ensure only authorized users can access the data.

---

## 🚀 Tech Stack

This application is built using a modern JavaScript/TypeScript stack.

* **Frontend:**
    * **React** (via **Vite**): A JavaScript library for building fast and interactive user interfaces.
    * **Tailwind CSS:** A utility-first CSS framework for rapid and modern styling.
    * **Sonner:** A lightweight and elegant library for displaying toast notifications.

* **Backend & Database (BaaS):**
    * **Convex:** A Backend-as-a-Service platform providing:
        * A real-time, transactional database.
        * Serverless Functions for all backend logic (written in TypeScript).
        * A built-in authentication system.

---

## 🏗️ System Architecture

This application adopts a modern architecture with a **decoupled frontend** and backend.

* **Frontend (Client-Side):** Built as a **Single Page Application (SPA)** using Vite + React. All UI is client-side rendered, providing a fast and responsive user experience without full page reloads.
* **Backend (Serverless):** Business logic and database interactions are fully managed by **Convex**. The frontend communicates with the backend via well-defined and secure mutations and queries, eliminating the need to manage a traditional server.

---

## 🛠️ Local Setup and Installation Guide

Follow these steps to run the project on your local environment.

1.  **Clone the Repository**
    ```bash
    git clone [your-repository-url]
    cd [project-folder-name]
    ```

2.  **Install Frontend Dependencies**
    Run the following command to install all the required libraries.
    ```bash
    npm install
    ```

3.  **Connect to the Convex Backend**
    Run this command for the first time. It will guide you through logging into your Convex account and creating a new deployment for this project.
    ```bash
    npx convex dev
    ```
    This command will create a `.env.local` file containing the unique keys for your project.

4.  **Seed the Initial Admin User (Crucial Step)**
    Since this application does not have a public sign-up feature, you must create the first admin user manually.
    * Open your **Convex Project Dashboard** in a browser.
    * Navigate to the **Functions** menu.
    * Find the mutation: `createInitialAdmin`.
    * Click the **"Run"** button next to it (leave the arguments empty).

5.  **Run the Application**
    After the steps above are complete, the application is ready to run.
    ```bash
    # Keep the `npx convex dev` terminal running...
    # Open a new terminal and run:
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port shown in the terminal).

---

## ✍️ Author

Created by **Muhamad Adillah Fatih**
