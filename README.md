# TicketHub AI 🤖🎟️

A modern, containerized full-stack Support Ticket System that leverages Google's Gemini LLM to automatically categorize and prioritize user issues in real-time.

![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Django%20%7C%20PostgreSQL-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.5-orange)

## ✨ Features

* **AI Auto-Classification:** Integrates directly with the Gemini 2.5 REST API to read user descriptions and instantly suggest categories and priority levels.
* **Graceful AI Fallback:** Engineered with strict try/catch network fallbacks to ensure users can always submit tickets even if the LLM provider experiences downtime.
* **Real-Time Analytics Dashboard:** Displays total tickets, open counts, and categorical breakdowns using highly optimized PostgreSQL database-level aggregations (`Count`, `Min`, `Max`) via Django's ORM.
* **Dynamic React UI:** Features instantaneous filtering, debounced search functionality, and hot-reloading ticket status updates without full page refreshes.
* **Strict Data Integrity:** Utilizes PostgreSQL `CheckConstraint` rules at the database level to rigidly enforce valid choices for ticket routing.

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS (via CDN for rapid prototyping), Axios
* **Backend:** Python, Django, Django REST Framework
* **Database:** PostgreSQL
* **Infrastructure:** Docker, Docker Compose
* **AI/LLM:** Google Gemini Generative AI API

## 🚀 Quick Start

This project is fully containerized. You do not need Python or Node.js installed locally to run it—just Docker.

### 1. Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here

### 2.Run the following command to build the images, spin up the database, run Django auto-migrations, and start the React frontend:

docker-compose up --build

### 3.Access the Application

Client UI: http://localhost:3000

Backend API: http://localhost:8000/api/tickets/
