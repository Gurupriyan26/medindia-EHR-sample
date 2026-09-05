// Vercel Serverless Entry Point
// This file wraps the Express app as a Vercel serverless function.
// All /api/* requests are routed here by vercel.json
import app from '../server/src/server';

export default app;
