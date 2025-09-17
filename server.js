const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || './data';
const STATIC_DIR = process.env.STATIC_DIR || '.';

let wss;
const clients = new Set();

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Serve static files
async function serveStatic(req, res, filePath) {
    try {
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        };
        
        const contentType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
        });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
        }
    }
}

// Handle data API
async function handleDataAPI(req, res, dataFile) {
    const filePath = path.join(DATA_DIR, dataFile);
    
    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Return empty array if file doesn't exist
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        }
    } else if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Validate JSON
                const data = JSON.parse(body);
                
                // Save to file
                await fs.writeFile(filePath, body, 'utf8');
                
                // Broadcast update to all connected clients
                broadcastUpdate({
                    type: 'dataUpdate',
                    file: dataFile,
                    data: data
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON data' }));
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

// WebSocket broadcast function
function broadcastUpdate(message) {
    clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            try {
                client.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error broadcasting to client:', error);
                clients.delete(client);
            }
        }
    });
}

// Main request handler
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    // CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }
    
    // Handle data API
    if (url.pathname.startsWith('/data/')) {
        const dataFile = url.pathname.substring(6); // Remove '/data/'
        if (dataFile && dataFile.endsWith('.json')) {
            await handleDataAPI(req, res, dataFile);
            return;
        }
    }
    
    // Handle static files
    let filePath;
    if (url.pathname === '/' || url.pathname === '') {
        filePath = path.join(STATIC_DIR, 'index.html');
    } else {
        filePath = path.join(STATIC_DIR, url.pathname);
    }
    
    // Security check: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const staticDirResolved = path.resolve(STATIC_DIR);
    
    if (!resolvedPath.startsWith(staticDirResolved)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access denied');
        return;
    }
    
    await serveStatic(req, res, filePath);
});

// Start server
async function start() {
    await ensureDataDir();
    
    server.listen(PORT, () => {
        console.log(`LIU Repairs Tracker server running on http://localhost:${PORT}`);
        console.log(`Data directory: ${DATA_DIR}`);
        console.log(`Static directory: ${STATIC_DIR}`);
    });

    // Setup WebSocket server
    wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected');
        clients.add(ws);
        
        ws.on('message', async (message) => {
            try {
                const request = JSON.parse(message.toString());
                if (request.type === 'requestData' && request.file) {
                    const filePath = path.join(DATA_DIR, request.file);
                    try {
                        const data = await fs.readFile(filePath, 'utf8');
                        ws.send(JSON.stringify({
                            type: 'initialData',
                            file: request.file,
                            data: JSON.parse(data)
                        }));
                    } catch (error) {
                        ws.send(JSON.stringify({
                            type: 'initialData',
                            file: request.file,
                            data: []
                        }));
                    }
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        });
        
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            clients.delete(ws);
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clients.delete(ws);
        });
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

start().catch(console.error);