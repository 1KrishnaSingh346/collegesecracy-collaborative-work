import express from 'express';
const app = express();
import menteeRoutes from './Routes/menteeRoute'
app.use(express.json())
app.use('/api/v1/mentee', menteeRoutes);

export default app;