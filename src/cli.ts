#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to the compiled index.js
const serverPath = join(__dirname, 'index.js');

// Spawn the MCP server
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('close', (code) => {
  process.exit(code || 0);
});

server.on('error', (error) => {
  console.error('Error starting MCP server:', error);
  process.exit(1);
});
