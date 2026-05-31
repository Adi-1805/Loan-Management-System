import express from 'express';
import cors from 'cors';
import { Server } from 'http';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const allowedOrigins = new Set(
  env.nodeEnv === 'production'
    ? [env.clientUrl].filter(Boolean)
    : ['http://localhost:3000', env.clientUrl].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'LMS API is running' });
});

app.use('/api', routes);
app.use(errorHandler);

let server: Server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    return;
  }

  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

start();

export default app;
