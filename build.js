const esbuild = require('esbuild');
const chokidar = require('chokidar');
const WebSocket = require('ws');

// Start a WebSocket server for HMR
const clients = [];
const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('close', () => clients.splice(clients.indexOf(ws), 1));
});

// Notify clients of updates
const notifyClients = () => {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('reload');
    }
  });
};

// Build with esbuild
const build = () =>
  esbuild.build({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    outfile: 'dist/bundle.js',
    loader: { '.js': 'jsx', '.svg': 'file' },
    sourcemap: true,
    target: ['es6'],
    logLevel: 'info',
    publicPath: '/',
  });

// Watch for changes
chokidar.watch('src').on('change', async () => {
  console.log('File changed, rebuilding...');
  await build();
  notifyClients();
});

// Run initial build
build();
