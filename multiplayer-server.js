const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const ROOM_TTL_MS = 1000 * 60 * 60 * 6;
const PLAYER_ONLINE_MS = 15000;
const MAX_SYMBOL_PAIR_INDEX = 2;
const rooms = new Map();

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sanitizeName(rawName) {
  const name = (rawName || '').trim();
  return name ? name.slice(0, 20) : 'Guest';
}

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function normalizeSymbolPairIndex(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_SYMBOL_PAIR_INDEX) {
    return 0;
  }
  return parsed;
}

function createRoom(ownerName, symbolPairIndex) {
  let roomId = generateRoomId();
  while (rooms.has(roomId)) {
    roomId = generateRoomId();
  }

  const playerId = randomUUID();
  const now = Date.now();
  const room = {
    roomId,
    board: ['', '', '', '', '', '', '', '', ''],
    symbolPairIndex: normalizeSymbolPairIndex(symbolPairIndex),
    currentTurn: 'X',
    status: 'waiting',
    winner: null,
    players: [
      {
        playerId,
        name: sanitizeName(ownerName),
        symbol: 'X',
        lastSeen: now
      }
    ],
    updatedAt: now
  };

  rooms.set(roomId, room);
  return { room, playerId };
}

function getRoom(roomId) {
  return rooms.get((roomId || '').toUpperCase());
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function toRoomState(room, playerId) {
  const now = Date.now();
  const currentPlayer = room.players.find((player) => player.symbol === room.currentTurn);
  const you = room.players.find((player) => player.playerId === playerId);

  return {
    roomId: room.roomId,
    board: room.board,
    symbolPairIndex: room.symbolPairIndex,
    currentTurn: room.currentTurn,
    status: room.status,
    winner: room.winner,
    players: room.players.map((player) => ({
      name: player.name,
      symbol: player.symbol,
      connected: now - player.lastSeen <= PLAYER_ONLINE_MS
    })),
    yourSymbol: you ? you.symbol : null,
    yourTurn: Boolean(you && room.status === 'active' && room.currentTurn === you.symbol),
    waitingFor: room.status === 'waiting' ? 'opponent' : null,
    currentPlayerName: currentPlayer ? currentPlayer.name : null
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
  });
}

function cleanupRooms() {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.updatedAt > ROOM_TTL_MS) {
      rooms.delete(roomId);
    }
  }
}

function serveStatic(req, res) {
  let requestPath = req.url.split('?')[0];
  if (requestPath === '/') requestPath = '/index.html';

  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  if (!filePath.startsWith(DIST_DIR)) {
    sendJson(res, 403, { ok: false, error: 'Forbidden' });
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 500, { ok: false, error: 'Failed to load file' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'POST' && pathname === '/api/multiplayer/rooms') {
    const body = await parseBody(req);
    const { room, playerId } = createRoom(body.playerName, body.symbolPairIndex);
    sendJson(res, 201, { ok: true, room: toRoomState(room, playerId), playerId });
    return;
  }

  const roomJoinMatch = pathname.match(/^\/api\/multiplayer\/rooms\/([A-Z0-9]+)\/join$/);
  if (req.method === 'POST' && roomJoinMatch) {
    const roomId = roomJoinMatch[1].toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      sendJson(res, 404, { ok: false, error: 'Room not found' });
      return;
    }
    if (room.players.length >= 2) {
      sendJson(res, 409, { ok: false, error: 'Room is full' });
      return;
    }

    const body = await parseBody(req);
    const playerId = randomUUID();
    room.players.push({
      playerId,
      name: sanitizeName(body.playerName),
      symbol: 'O',
      lastSeen: Date.now()
    });
    room.status = 'active';
    room.updatedAt = Date.now();
    sendJson(res, 200, { ok: true, room: toRoomState(room, playerId), playerId });
    return;
  }

  const roomStateMatch = pathname.match(/^\/api\/multiplayer\/rooms\/([A-Z0-9]+)\/state$/);
  if (req.method === 'GET' && roomStateMatch) {
    const roomId = roomStateMatch[1].toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      sendJson(res, 404, { ok: false, error: 'Room not found' });
      return;
    }
    const playerId = url.searchParams.get('playerId');
    const player = room.players.find((entry) => entry.playerId === playerId);
    if (player) {
      player.lastSeen = Date.now();
    }
    room.updatedAt = Date.now();
    sendJson(res, 200, { ok: true, room: toRoomState(room, playerId) });
    return;
  }

  const roomMoveMatch = pathname.match(/^\/api\/multiplayer\/rooms\/([A-Z0-9]+)\/move$/);
  if (req.method === 'POST' && roomMoveMatch) {
    const roomId = roomMoveMatch[1].toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      sendJson(res, 404, { ok: false, error: 'Room not found' });
      return;
    }
    if (room.status !== 'active') {
      sendJson(res, 409, { ok: false, error: 'Game is not active' });
      return;
    }

    const body = await parseBody(req);
    const player = room.players.find((entry) => entry.playerId === body.playerId);
    if (!player) {
      sendJson(res, 403, { ok: false, error: 'Invalid player' });
      return;
    }
    if (player.symbol !== room.currentTurn) {
      sendJson(res, 409, { ok: false, error: 'Not your turn' });
      return;
    }

    const index = Number(body.index);
    if (!Number.isInteger(index) || index < 0 || index > 8) {
      sendJson(res, 400, { ok: false, error: 'Invalid move index' });
      return;
    }
    if (room.board[index]) {
      sendJson(res, 409, { ok: false, error: 'Cell already used' });
      return;
    }

    room.board[index] = player.symbol;
    player.lastSeen = Date.now();

    const winner = checkWinner(room.board);
    if (winner) {
      room.status = 'finished';
      room.winner = winner;
    } else if (!room.board.includes('')) {
      room.status = 'finished';
      room.winner = null;
    } else {
      room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    }

    room.updatedAt = Date.now();
    sendJson(res, 200, { ok: true, room: toRoomState(room, body.playerId) });
    return;
  }

  const roomRestartMatch = pathname.match(/^\/api\/multiplayer\/rooms\/([A-Z0-9]+)\/restart$/);
  if (req.method === 'POST' && roomRestartMatch) {
    const roomId = roomRestartMatch[1].toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      sendJson(res, 404, { ok: false, error: 'Room not found' });
      return;
    }
    if (room.players.length < 2) {
      sendJson(res, 409, { ok: false, error: 'Need 2 players to restart' });
      return;
    }

    const body = await parseBody(req);
    const player = room.players.find((entry) => entry.playerId === body.playerId);
    if (!player) {
      sendJson(res, 403, { ok: false, error: 'Invalid player' });
      return;
    }

    room.board = ['', '', '', '', '', '', '', '', ''];
    room.currentTurn = 'X';
    room.status = 'active';
    room.winner = null;
    room.updatedAt = Date.now();
    player.lastSeen = Date.now();

    sendJson(res, 200, { ok: true, room: toRoomState(room, body.playerId) });
    return;
  }

  const roomStyleMatch = pathname.match(/^\/api\/multiplayer\/rooms\/([A-Z0-9]+)\/style$/);
  if (req.method === 'POST' && roomStyleMatch) {
    const roomId = roomStyleMatch[1].toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      sendJson(res, 404, { ok: false, error: 'Room not found' });
      return;
    }

    const body = await parseBody(req);
    const player = room.players.find((entry) => entry.playerId === body.playerId);
    if (!player) {
      sendJson(res, 403, { ok: false, error: 'Invalid player' });
      return;
    }
    if (player.symbol !== 'X') {
      sendJson(res, 403, { ok: false, error: 'Only the room creator can change symbol style' });
      return;
    }

    room.symbolPairIndex = normalizeSymbolPairIndex(body.symbolPairIndex);
    room.updatedAt = Date.now();
    player.lastSeen = Date.now();
    sendJson(res, 200, { ok: true, room: toRoomState(room, body.playerId) });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Endpoint not found' });
}

const server = http.createServer(async (req, res) => {
  cleanupRooms();

  try {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const host = req.headers.host || '';
    const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!isLocalHost && forwardedProto && forwardedProto !== 'https') {
      res.writeHead(301, { Location: `https://${host}${req.url}` });
      res.end();
      return;
    }

    if (req.url.startsWith('/api/multiplayer')) {
      await handleApi(req, res);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message || 'Internal error' });
  }
});

server.listen(PORT, HOST, () => {
  const localUrls = [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];
  const networkUrls = [];
  const interfaces = os.networkInterfaces();

  Object.values(interfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (entry.family === 'IPv4' && !entry.internal) {
        networkUrls.push(`http://${entry.address}:${PORT}`);
      }
    });
  });

  console.log(`Multiplayer server running on ${HOST}:${PORT}`);
  console.log(`Local: ${localUrls.join(' | ')}`);
  if (networkUrls.length > 0) {
    console.log(`Network: ${networkUrls.join(' | ')}`);
  }
});
