import express from 'express';
import cors from 'cors';
import './controller/connection';
import cookie from 'cookie-parser';
import authRoutes from './Routes/auth-routes';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

export default app;