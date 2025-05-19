# 📣 Feedback System Module – Collaborative Task

Welcome to the `collegesecracy-collaborative-work` repo!  
This task involves designing and implementing a **Feedback System** that integrates with the `Mentee Dashboard` of the main project.

---

## 📌 Objective

Create a **fully functional Feedback System** that includes:
- 🖼️ UI for mentees to submit and view feedback
- 🧠 Separate `authStore` for handling feedback-specific auth (not main one)
- 🧩 Backend API with MongoDB integration
- 🛠️ Routing, state management, and modular structure
- 🔐 Basic simulated token authentication

---

## 🗂️ Project Structure & Where to Work

### 🔷 Frontend

All frontend code should go inside:


- Your `FeedbackSection` component should be added inside the `MenteeDashboard.jsx`.
- Use **Tailwind CSS** for styling.
- Routing should be handled for `/dashboard/feedback` or integrated via internal switching.
- `useAuthStore.js` should be specific to the feedback module (separate from the app's main auth).

---

### 🔶 Backend

Backend code goes inside:


#### Sample API endpoints:
- `POST /api/feedback` → submit feedback
- `GET /api/feedback` → get all feedbacks

#### Feedback model (Mongoose):
```js
{
  menteeId: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
}
