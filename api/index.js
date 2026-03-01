import serverless from 'serverless-http';
import app from '../backend/server.js';

// Wrap Express app for Vercel serverless; all /api/* requests are sent here
export default serverless(app);
