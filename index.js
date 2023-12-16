const { spawn } = require('child_process');
const express = require('express');

// Command to make start.sh executable and run it in the background
const startCommand = 'chmod +x ./start.sh && ./start.sh';

// Spawn the child process to run start.sh
const childProcess = spawn(startCommand, {
  shell: true,
  stdio: 'inherit' // Inherit stdio so that the output of start.sh is visible in the console
});

// Listen for the exit event of the child process
childProcess.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Child process (start.sh) exited with code: ${code}`);
  } else if (signal !== null) {
    console.error(`Child process (start.sh) terminated with signal: ${signal}`);
  }
});

// Create a separate Express app for the web server
const app = express();

// Use SERVER_PORT environment variable, or PORT if SERVER_PORT is not set
const port = process.env.SERVER_PORT || process.env.PORT || 3000;

// Serve a simple "Hello, World!" page when the root URL is accessed
app.get('/', (req, res) => {
  res.send('<h1>Hello, World!</h1>');
});

// Start the Express server after a delay to allow start.sh to initialize
setTimeout(() => {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Close the Express server when the script is interrupted
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server closed.');
      process.exit();
    });
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed.');
      process.exit();
    });
  });
}, 5000); // Adjust the delay based on the time needed for start.sh to initialize
