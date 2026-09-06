import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', authRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.listen(3000, () => console.log('API on http://localhost:3000'));
