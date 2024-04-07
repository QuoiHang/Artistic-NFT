const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!DOCTYPE html>
  <html>
  <head>
    <title>My Node.js Web Page</title>
  </head>
  <body>
    <h1>Hello from Node.js!</h1>
    <p>This is a simple web page served by Node.js server.</p>
    <script src="script.js"></script>
  </body>
  </html>`);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
