import express from 'express';
import authRoutes from "./Routes/authRoutes.js"

const app = express();

app.use('/api/v1/auth', authRoutes);

export default app;