// 简单的静态文件服务器，用于测试钓鱼潮汐PWA应用
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || 'localhost';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.manifest': 'text/cache-manifest'
};

const server = http.createServer((req, res) => {
  console.log(`收到请求: ${req.method} ${req.url}`);
  
  // 解析请求的文件路径
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  filePath = path.resolve('.') + filePath;
  
  // 获取文件扩展名
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 设置响应头
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // 读取并发送文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`文件未找到: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        console.error(`服务器错误: ${err.code}`);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`钓鱼潮汐PWA 服务器运行在 http://${hostname}:${port}`);
  console.log('按 Ctrl+C 停止服务器');
});