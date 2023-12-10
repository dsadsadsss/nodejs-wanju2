const { spawn } = require('child_process');

const command = 'chmod +x ./start.sh && ./start.sh';

const childProcess = spawn(command, {
  shell: true,
  stdio: 'inherit' // 使用 'inherit' 来共享子进程的输入输出流
});

childProcess.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`子进程退出，退出码: ${code}`);
  } else if (signal !== null) {
    console.error(`子进程被终止，信号: ${signal}`);
  }
});
