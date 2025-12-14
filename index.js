// index.js
const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// ============ 配置区域 ============
const SCRIPT_NAME = process.env.SCRIPT || 'start.sh';  // 要监控的脚本名称
const SUB_PATH = process.env.SUB || 'sub123-D-ff200da-fafsd232-gsdg';         // 日志访问路径
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

// =================================

// 小游戏 HTML 页面
const gameHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>贪吃蛇游戏</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
        }
        h1 {
            color: white;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        #gameCanvas {
            border: 3px solid white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            background: #1a1a2e;
        }
        #score {
            color: white;
            font-size: 24px;
            margin-top: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        #controls {
            color: white;
            margin-top: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>🐍 贪吃蛇游戏</h1>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="score">分数: 0</div>
    <div id="controls">使用方向键控制 | 按空格键暂停</div>
    
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let paused = false;
        let gameOver = false;
        
        function drawGame() {
            if (paused || gameOver) return;
            
            // 移动蛇
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            // 检查碰撞
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                endGame();
                return;
            }
            
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    endGame();
                    return;
                }
            }
            
            snake.unshift(head);
            
            // 检查是否吃到食物
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = '分数: ' + score;
                placeFood();
            } else {
                snake.pop();
            }
            
            // 清空画布
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制网格
            ctx.strokeStyle = '#2a2a3e';
            for (let i = 0; i <= tileCount; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(canvas.width, i * gridSize);
                ctx.stroke();
            }
            
            // 绘制食物
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
            
            // 绘制蛇
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#4ecdc4' : '#45b7af';
                ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
            });
        }
        
        function placeFood() {
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);
            
            // 确保食物不在蛇身上
            for (let segment of snake) {
                if (food.x === segment.x && food.y === segment.y) {
                    placeFood();
                    return;
                }
            }
        }
        
        function endGame() {
            gameOver = true;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 20);
        }
        
        function resetGame() {
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
            score = 0;
            gameOver = false;
            paused = false;
            scoreElement.textContent = '分数: 0';
            placeFood();
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameOver) {
                    resetGame();
                } else {
                    paused = !paused;
                }
                return;
            }
            
            if (gameOver || paused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (dy === 0) { dx = 0; dy = -1; }
                    break;
                case 'ArrowDown':
                    if (dy === 0) { dx = 0; dy = 1; }
                    break;
                case 'ArrowLeft':
                    if (dx === 0) { dx = -1; dy = 0; }
                    break;
                case 'ArrowRight':
                    if (dx === 0) { dx = 1; dy = 0; }
                    break;
            }
        });
        
        setInterval(drawGame, 100);
        drawGame();
    </script>
</body>
</html>
`;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(gameHTML);
    } else if (req.url === `/${SUB_PATH}`) {
        // 读取 /tmp/list.log 文件
        const logPath = '/tmp/list.log';
        fs.readFile(logPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('File not found or error reading file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Log endpoint: http://localhost:${PORT}/${SUB_PATH}`);
    console.log(`Monitoring script: ${SCRIPT_NAME}`);
});

// 进程监控功能
let checkCommand = null;
let commandChecked = false;

// 检测可用的进程检查命令
function detectCheckCommand(callback) {
    const commands = ['pgrep', 'pidof', 'ps'];
    let index = 0;
    
    function checkNext() {
        if (index >= commands.length) {
            console.log('未找到可用的进程检查命令，将使用延迟启动模式');
            callback(null);
            return;
        }
        
        const cmd = commands[index];
        exec(`which ${cmd}`, (err) => {
            if (!err) {
                console.log(`找到可用命令: ${cmd}`);
                callback(cmd);
            } else {
                index++;
                checkNext();
            }
        });
    }
    
    checkNext();
}

// 检查进程是否存在
function checkProcess(callback) {
    if (!checkCommand) {
        callback(false);
        return;
    }
    
    let cmd;
    switch(checkCommand) {
        case 'pgrep':
            cmd = `pgrep -f ${SCRIPT_NAME}`;
            break;
        case 'pidof':
            cmd = `pidof -x ${SCRIPT_NAME}`;
            break;
        case 'ps':
            cmd = `ps aux | grep ${SCRIPT_NAME} | grep -v grep`;
            break;
        default:
            callback(false);
            return;
    }
    
    exec(cmd, (err, stdout) => {
        const exists = !err && stdout.trim().length > 0;
        callback(exists);
    });
}

// 启动脚本（后台运行）
function startNgnx() {
    const scriptPath = `./${SCRIPT_NAME}`;
    
    // 检查文件是否存在
    if (!fs.existsSync(scriptPath)) {
        console.error(`错误: ${SCRIPT_NAME} 文件不存在`);
        return;
    }
    
    console.log(`启动 ${SCRIPT_NAME}...`);
    // 使用 nohup 和 & 让脚本在后台运行，不阻塞主进程
    exec(`chmod +x ${scriptPath} && nohup ${scriptPath} > /dev/null 2>&1 &`, (err, stdout, stderr) => {
        if (err) {
            console.error('启动失败:', err.message);
            return;
        }
        console.log(`${SCRIPT_NAME} 已在后台启动`);
    });
}

// 监控循环
function monitorProcess() {
    detectCheckCommand((cmd) => {
        checkCommand = cmd;
        commandChecked = true;
        
        if (!checkCommand) {
            // 没有找到检查命令，等待30秒后启动一次
            console.log(`等待 30 秒后启动 ${SCRIPT_NAME}...`);
            setTimeout(() => {
                startNgnx();
            }, 30000);
        } else {
            // 立即执行第一次检查
            performCheck();
            // 每5分钟检查一次
            setInterval(performCheck, 5 * 60 * 1000);
        }
    });
}

function performCheck() {
    console.log(`[${new Date().toLocaleString()}] 检查 ${SCRIPT_NAME} 进程...`);
    checkProcess((exists) => {
        if (!exists) {
            console.log(`${SCRIPT_NAME} 进程不存在，准备启动...`);
            startNgnx();
        } else {
            console.log(`${SCRIPT_NAME} 进程正在运行`);
        }
    });
}

// 启动监控
monitorProcess();

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
