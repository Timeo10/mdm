import type { Server } from 'node:http';
import { createServer } from 'node:http';
import app from './app';
import env from './config/environment';

let server: Server;

try {
  server = createServer(app);

  server.listen(env.SERVER_PORT, () => {
    console.log('Server: ✅');
    console.table([
      {
        Status: 'Running',
        PID: process.pid,
        Port: env.SERVER_PORT,
        Env: env.NODE_ENV,
      },
    ]);
  });
} catch (e) {
  const error = e as Error;

  console.log('Server: ❌');
  console.table([
    {
      Status: 'Error',
      PID: process.pid,
      Port: env.SERVER_PORT,
      Env: env.NODE_ENV,
    },
  ]);

  console.error(`\x1b[31mError starting the server: ${error.toString()}\x1b[0m`);
  process.exit(1);
}

const gracefulShutdown = (): void => {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
