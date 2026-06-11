import express from 'express';
import { profRouter } from './routes/prof';
import { gebietRouter } from './routes/gebiet';
import { themaRouter } from './routes/thema';
import { loginRouter } from './routes/login';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from "express-rate-limit";

export const app = express();

// Middleware:

// Wozu wird diese Middleware benötigt?
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const securityLimiter = rateLimit({
    windowMs: process.env.RATE_WINDOW_MS ? parseInt(process.env.RATE_WINDOW_MS) : 15 * 60 * 1000,
    limit: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT) : 100, 

    statusCode: 429, 
    legacyHeaders: false, 
    skipSuccessfulRequests: true, 
    
    message: { error: "Zu viele Brute-Force-Versuche. Bitte warten Sie eine Weile." }
});


// Routes
// Registrieren Sie hier die Router!
app.use("/api/login", securityLimiter);
app.use("/api/prof/:id/password", securityLimiter);

app.use("/api/prof", profRouter);

app.use("/api/gebiet", gebietRouter);

app.use("/api/thema", themaRouter);

app.use('/api/login', loginRouter);

