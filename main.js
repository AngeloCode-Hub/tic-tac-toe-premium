import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';

const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const pvpBtn = document.getElementById('pvpBtn');
const pvcBtn = document.getElementById('pvcBtn');
const onlineBtn = document.getElementById('onlineBtn');
const goOnlineBtn = document.getElementById('goOnlineBtn');
const difficultyContainer = document.getElementById('difficultyContainer');
const onlineSection = document.getElementById('onlineSection');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const onlineRoomInfo = document.getElementById('onlineRoomInfo');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyInviteBtn = document.getElementById('copyInviteBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const onlineFeedback = document.getElementById('onlineFeedback');
const diffBtns = document.querySelectorAll('.diff-btn');
const symbolBtns = document.querySelectorAll('.symbol-btn');
const cells = document.querySelectorAll('.cell');
const playerNameInput = document.getElementById('playerNameInput');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const scoreboardPanel = document.getElementById('scoreboardPanel');
const scoreboardTab = document.getElementById('scoreboardTab');
const closeScoreboardBtn = document.getElementById('closeScoreboardBtn');
const winsCount = document.getElementById('winsCount');
const lossesCount = document.getElementById('lossesCount');
const drawsCount = document.getElementById('drawsCount');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const celebrationOverlay = document.getElementById('celebrationOverlay');
const celebrationContent = document.getElementById('celebrationContent');
const container = document.querySelector('.container');
const scrollHint = document.getElementById('scrollHint');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareCopy = document.getElementById('shareCopy');
const gameBtns = document.querySelectorAll('.game-btn');
const ticTacToeBoard = document.getElementById('board');
const connect4Board = document.getElementById('connect4Board');
const battleshipSection = document.getElementById('battleshipSection');
const battleshipOwnGrid = document.getElementById('battleshipOwnGrid');
const battleshipTargetGrid = document.getElementById('battleshipTargetGrid');

console.log('Game Script Loaded');

let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "PvA"; // Default internal state
let aiDifficulty = 'easy'; // easy, medium, hard

// Score tracking
let playerName = localStorage.getItem('playerName') || 'Guest';
let stats = {
    wins: parseInt(localStorage.getItem('wins')) || 0,
    losses: parseInt(localStorage.getItem('losses')) || 0,
    draws: parseInt(localStorage.getItem('draws')) || 0
};

// Symbol Logic
const symbolPairs = [
    { p1: 'X', p2: 'O' },
    { p1: '🔥', p2: '❄️' },
    { p1: '1', p2: '0' }
];
let currentPairIndex = 0;
let currentPlayer = symbolPairs[0].p1;
let onlineSession = null;
let onlinePollInterval = null;
let canEditOnlineSymbolStyle = true;
let selectedGameType = 'tictactoe';

const CONNECT4_ROWS = 6;
const CONNECT4_COLS = 7;
let connect4Grid = Array.from({ length: CONNECT4_ROWS }, () => Array(CONNECT4_COLS).fill(''));
let connect4CurrentTurn = 'X';
let connect4Active = true;

const BATTLESHIP_SIZE = 6;
const BATTLESHIP_SHIP_COUNT = 6;
let battleshipState = null;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function isOnlineMode() {
    return selectedGameType === 'tictactoe' && gameMode === 'Online';
}

function setOnlineFeedback(message, isError = false) {
    if (!onlineFeedback) return;
    onlineFeedback.textContent = message || '';
    onlineFeedback.classList.toggle('error', Boolean(message && isError));
}

function setOnlineControlsState(inRoom) {
    if (!onlineRoomInfo || !createRoomBtn || !joinRoomBtn || !roomCodeInput || !copyInviteBtn || !leaveRoomBtn) return;

    onlineRoomInfo.style.display = inRoom ? 'flex' : 'none';
    createRoomBtn.disabled = inRoom;
    joinRoomBtn.disabled = inRoom;
    roomCodeInput.disabled = inRoom;
    copyInviteBtn.disabled = !inRoom;
    leaveRoomBtn.disabled = !inRoom;
}

function setModeButtons(mode) {
    if (pvpBtn) pvpBtn.classList.toggle('active', mode === 'PvP');
    if (pvcBtn) pvcBtn.classList.toggle('active', mode === 'PvAI');
    if (onlineBtn) onlineBtn.classList.toggle('active', mode === 'Online');
}

function normalizeRoomCode(value) {
    return (value || '').trim().toUpperCase();
}

function getPairByIndex(index) {
    const parsedIndex = Number(index);
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= symbolPairs.length) {
        return symbolPairs[0];
    }
    return symbolPairs[parsedIndex];
}

function toDisplaySymbol(canonicalSymbol, pairIndex = currentPairIndex) {
    if (!canonicalSymbol) return '';
    const pair = getPairByIndex(pairIndex);
    if (canonicalSymbol === 'X') return pair.p1;
    if (canonicalSymbol === 'O') return pair.p2;
    return canonicalSymbol;
}

function updateSymbolButtons() {
    symbolBtns.forEach(btn => {
        const btnIndex = parseInt(btn.getAttribute('data-pair'));
        if (btnIndex === currentPairIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setSymbolSelectionDisabled(disabled) {
    symbolBtns.forEach((btn) => {
        btn.disabled = Boolean(disabled);
    });
}

function getOpponentLabel() {
    return gameMode === 'PvAI' ? 'AI' : 'Player 2';
}

function updateGameButtons() {
    gameBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-game') === selectedGameType);
    });
}

function setModeButtonsAvailability() {
    if (!pvpBtn || !pvcBtn || !onlineBtn || !goOnlineBtn) return;

    if (selectedGameType === 'tictactoe') {
        pvpBtn.disabled = false;
        pvcBtn.disabled = false;
        onlineBtn.disabled = false;
        goOnlineBtn.style.display = 'inline-flex';
        return;
    }

    if (selectedGameType === 'connect4') {
        pvpBtn.disabled = false;
        pvcBtn.disabled = false;
        onlineBtn.disabled = true;
        goOnlineBtn.style.display = 'none';
        return;
    }

    pvpBtn.disabled = true;
    pvcBtn.disabled = false;
    onlineBtn.disabled = true;
    goOnlineBtn.style.display = 'none';
}

function updateVisibleBoard() {
    if (ticTacToeBoard) ticTacToeBoard.style.display = selectedGameType === 'tictactoe' ? 'grid' : 'none';
    if (connect4Board) connect4Board.style.display = selectedGameType === 'connect4' ? 'grid' : 'none';
    if (battleshipSection) battleshipSection.style.display = selectedGameType === 'battleship' ? 'block' : 'none';
}

function setSelectedGameType(gameType) {
    if (!['tictactoe', 'connect4', 'battleship'].includes(gameType)) return;
    selectedGameType = gameType;
    updateGameButtons();
    updateVisibleBoard();
    setModeButtonsAvailability();

    if (selectedGameType !== 'tictactoe' && isOnlineMode()) {
        setGameMode('PvP');
    } else if (selectedGameType === 'battleship' && gameMode !== 'PvAI') {
        setGameMode('PvAI');
    } else {
        handleRestartGame();
    }
}

function getRoomCodeFromLocation() {
    const queryCode = normalizeRoomCode(new URLSearchParams(window.location.search).get('room'));
    if (queryCode) return queryCode;

    const pathMatch = window.location.pathname.match(/\/room\/([A-Z0-9]{4,10})$/i);
    if (pathMatch) return normalizeRoomCode(pathMatch[1]);

    return '';
}

function getBaseInviteUrlFromParsed(parsedUrl) {
    if (!parsedUrl) return '';

    if (parsedUrl.pathname.startsWith('/api/')) {
        return parsedUrl.origin;
    }

    const cleanPath = parsedUrl.pathname.endsWith('.html')
        ? parsedUrl.pathname.replace(/\/[^/]+$/, '')
        : parsedUrl.pathname;
    const finalPath = cleanPath === '' ? '/' : cleanPath;
    return `${parsedUrl.origin}${finalPath}`.replace(/\/+$/, '');
}

function getInviteBaseUrl() {
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (!isLocalHost) {
        const currentUrl = new URL(window.location.href.replace(/^http:\/\//i, 'https://'));
        return getBaseInviteUrlFromParsed(currentUrl);
    }

    const savedPublicUrl = (localStorage.getItem('publicBaseUrl') || '').trim();
    if (savedPublicUrl) {
        try {
            return getBaseInviteUrlFromParsed(new URL(savedPublicUrl.replace(/^http:\/\//i, 'https://')));
        } catch (error) {
            localStorage.removeItem('publicBaseUrl');
        }
    }

    const enteredUrl = window.prompt(
        'Je draait lokaal. Vul je publieke app-URL in (bijv. https://jouw-app.onrender.com):',
        ''
    );

    if (!enteredUrl) {
        return '';
    }

    let normalizedUrl = enteredUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
    }

    normalizedUrl = normalizedUrl.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');

    try {
        const parsedUrl = new URL(normalizedUrl);
        const localHosts = ['localhost', '127.0.0.1', '::1'];
        if (localHosts.includes(parsedUrl.hostname)) {
            setOnlineFeedback('Gebruik een publieke HTTPS URL, geen localhost.', true);
            return '';
        }

        const inviteBaseUrl = getBaseInviteUrlFromParsed(parsedUrl);
        if (!inviteBaseUrl) {
            setOnlineFeedback('Ongeldige publieke URL.', true);
            return '';
        }

        localStorage.setItem('publicBaseUrl', inviteBaseUrl);
        return inviteBaseUrl;
    } catch (error) {
        setOnlineFeedback('Ongeldige URL. Gebruik bijvoorbeeld https://jouw-app.onrender.com', true);
        return '';
    }
}

function createConnect4Board() {
    if (!connect4Board) return;
    connect4Board.innerHTML = '';
    for (let row = 0; row < CONNECT4_ROWS; row += 1) {
        for (let col = 0; col < CONNECT4_COLS; col += 1) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'connect4-cell';
            cell.setAttribute('data-row', String(row));
            cell.setAttribute('data-col', String(col));
            connect4Board.appendChild(cell);
        }
    }
}

function renderConnect4Board() {
    if (!connect4Board) return;
    const connect4Cells = connect4Board.querySelectorAll('.connect4-cell');
    connect4Cells.forEach((cell) => {
        const row = Number(cell.getAttribute('data-row'));
        const col = Number(cell.getAttribute('data-col'));
        const value = connect4Grid[row][col];
        cell.textContent = toDisplaySymbol(value, currentPairIndex);
    });
}

function findConnect4DropRow(col) {
    for (let row = CONNECT4_ROWS - 1; row >= 0; row -= 1) {
        if (!connect4Grid[row][col]) return row;
    }
    return -1;
}

function hasConnect4Winner(row, col, symbol) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    return directions.some(([dr, dc]) => {
        let count = 1;
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < CONNECT4_ROWS && c >= 0 && c < CONNECT4_COLS && connect4Grid[r][c] === symbol) {
            count += 1;
            r += dr;
            c += dc;
        }
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < CONNECT4_ROWS && c >= 0 && c < CONNECT4_COLS && connect4Grid[r][c] === symbol) {
            count += 1;
            r -= dr;
            c -= dc;
        }
        return count >= 4;
    });
}

function updateConnect4Status(message, color = 'var(--text-dim)') {
    statusDisplay.textContent = message;
    statusDisplay.style.color = color;
}

function applyConnect4Move(col) {
    if (!connect4Active) return;
    const row = findConnect4DropRow(col);
    if (row === -1) return;

    connect4Grid[row][col] = connect4CurrentTurn;
    renderConnect4Board();

    if (hasConnect4Winner(row, col, connect4CurrentTurn)) {
        connect4Active = false;
        const winnerName = connect4CurrentTurn === 'X' ? playerName : getOpponentLabel();
        updateConnect4Status(`Vier op een rij: ${winnerName} wint!`, '#22c55e');
        if (gameMode === 'PvAI') {
            updateStats(connect4CurrentTurn === 'X' ? 'win' : 'loss');
        }
        return;
    }

    const isDraw = connect4Grid.every((boardRow) => boardRow.every((cell) => Boolean(cell)));
    if (isDraw) {
        connect4Active = false;
        updateConnect4Status('Vier op een rij: Gelijkspel', '#cbd5e1');
        updateStats('draw');
        return;
    }

    connect4CurrentTurn = connect4CurrentTurn === 'X' ? 'O' : 'X';
    const turnName = connect4CurrentTurn === 'X' ? playerName : getOpponentLabel();
    updateConnect4Status(`Vier op een rij - Beurt: ${turnName} (${toDisplaySymbol(connect4CurrentTurn)})`, 'var(--text-dim)');

    if (gameMode === 'PvAI' && connect4CurrentTurn === 'O') {
        setTimeout(makeConnect4AiMove, 350);
    }
}

function makeConnect4AiMove() {
    if (!connect4Active || connect4CurrentTurn !== 'O') return;
    const availableCols = [];
    for (let col = 0; col < CONNECT4_COLS; col += 1) {
        if (findConnect4DropRow(col) !== -1) availableCols.push(col);
    }
    if (availableCols.length === 0) return;
    const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
    applyConnect4Move(randomCol);
}

function restartConnect4() {
    connect4Grid = Array.from({ length: CONNECT4_ROWS }, () => Array(CONNECT4_COLS).fill(''));
    connect4CurrentTurn = 'X';
    connect4Active = true;
    renderConnect4Board();
    updateConnect4Status(`Vier op een rij - Beurt: ${playerName} (${toDisplaySymbol('X')})`, 'var(--text-dim)');
}

function randomUniqueCells(size, count) {
    const max = size * size;
    const values = new Set();
    while (values.size < count) {
        values.add(Math.floor(Math.random() * max));
    }
    return values;
}

function createBattleshipGrid(root, type) {
    if (!root) return;
    root.innerHTML = '';
    for (let index = 0; index < BATTLESHIP_SIZE * BATTLESHIP_SIZE; index += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'battleship-cell';
        cell.setAttribute('data-index', String(index));
        cell.setAttribute('data-grid', type);
        root.appendChild(cell);
    }
}

function updateBattleshipStatus(message, color = 'var(--text-dim)') {
    statusDisplay.textContent = message;
    statusDisplay.style.color = color;
}

function renderBattleshipBoards() {
    if (!battleshipState || !battleshipOwnGrid || !battleshipTargetGrid) return;

    const ownCells = battleshipOwnGrid.querySelectorAll('.battleship-cell');
    ownCells.forEach((cell) => {
        const index = Number(cell.getAttribute('data-index'));
        const hasShip = battleshipState.playerShips.has(index);
        const wasHit = battleshipState.aiShots.has(index) && hasShip;
        const wasMiss = battleshipState.aiShots.has(index) && !hasShip;
        cell.classList.toggle('ship', hasShip);
        cell.classList.toggle('hit', wasHit);
        cell.classList.toggle('miss', wasMiss);
        cell.disabled = true;
    });

    const targetCells = battleshipTargetGrid.querySelectorAll('.battleship-cell');
    targetCells.forEach((cell) => {
        const index = Number(cell.getAttribute('data-index'));
        const wasShot = battleshipState.playerShots.has(index);
        const wasHit = wasShot && battleshipState.aiShips.has(index);
        cell.classList.toggle('hit', wasHit);
        cell.classList.toggle('miss', wasShot && !wasHit);
        cell.disabled = battleshipState.turn !== 'player' || battleshipState.playerShots.has(index) || !battleshipState.active;
    });
}

function finishBattleship(playerWon) {
    battleshipState.active = false;
    if (playerWon) {
        updateBattleshipStatus(`Zeeslag: ${playerName} wint!`, '#22c55e');
        updateStats('win');
    } else {
        updateBattleshipStatus('Zeeslag: AI wint!', '#f87171');
        updateStats('loss');
    }
    renderBattleshipBoards();
}

function runBattleshipAiTurn() {
    if (!battleshipState || !battleshipState.active || battleshipState.turn !== 'ai') return;

    const available = [];
    for (let index = 0; index < BATTLESHIP_SIZE * BATTLESHIP_SIZE; index += 1) {
        if (!battleshipState.aiShots.has(index)) {
            available.push(index);
        }
    }
    if (available.length === 0) return;

    const pick = available[Math.floor(Math.random() * available.length)];
    battleshipState.aiShots.add(pick);
    if (battleshipState.playerShips.has(pick)) {
        battleshipState.aiHits += 1;
    }

    if (battleshipState.aiHits >= BATTLESHIP_SHIP_COUNT) {
        finishBattleship(false);
        return;
    }

    battleshipState.turn = 'player';
    updateBattleshipStatus('Zeeslag - Jouw beurt om te schieten', '#93c5fd');
    renderBattleshipBoards();
}

function handleBattleshipShot(index) {
    if (!battleshipState || !battleshipState.active || battleshipState.turn !== 'player') return;
    if (battleshipState.playerShots.has(index)) return;

    battleshipState.playerShots.add(index);
    if (battleshipState.aiShips.has(index)) {
        battleshipState.playerHits += 1;
    }

    if (battleshipState.playerHits >= BATTLESHIP_SHIP_COUNT) {
        finishBattleship(true);
        return;
    }

    battleshipState.turn = 'ai';
    updateBattleshipStatus('Zeeslag - AI is aan zet...', 'var(--text-dim)');
    renderBattleshipBoards();
    setTimeout(runBattleshipAiTurn, 450);
}

function restartBattleship() {
    battleshipState = {
        playerShips: randomUniqueCells(BATTLESHIP_SIZE, BATTLESHIP_SHIP_COUNT),
        aiShips: randomUniqueCells(BATTLESHIP_SIZE, BATTLESHIP_SHIP_COUNT),
        playerShots: new Set(),
        aiShots: new Set(),
        playerHits: 0,
        aiHits: 0,
        turn: 'player',
        active: true
    };
    renderBattleshipBoards();
    updateBattleshipStatus('Zeeslag - Jouw beurt om te schieten', '#93c5fd');
}

function applyRemoteBoard(board, pairIndex = currentPairIndex) {
    if (!Array.isArray(board) || board.length !== 9) return;

    gameState = board.slice();
    cells.forEach((cell, index) => {
        const value = gameState[index] || '';
        cell.innerHTML = toDisplaySymbol(value, pairIndex);
        cell.classList.toggle('occupied', value !== '');
    });
}

function getRoomPlayerBySymbol(room, symbol) {
    if (!room || !Array.isArray(room.players)) return null;
    return room.players.find((player) => player.symbol === symbol) || null;
}

function getRoomPlayerName(room, symbol, fallback) {
    const player = getRoomPlayerBySymbol(room, symbol);
    const name = player && typeof player.name === 'string' ? player.name.trim() : '';
    return name || fallback;
}

function getOnlineStatusHeader(room) {
    const xName = getRoomPlayerName(room, 'X', 'Player X');
    const oName = getRoomPlayerName(room, 'O', room.status === 'waiting' ? 'Waiting...' : 'Player O');
    const xDisplay = toDisplaySymbol('X', currentPairIndex);
    const oDisplay = toDisplaySymbol('O', currentPairIndex);
    return `Room ${room.roomId}: ${xName} (${xDisplay}) vs ${oName} (${oDisplay})`;
}

function renderOnlineState(room) {
    if (!room) return;

    if (Number.isInteger(room.symbolPairIndex) && room.symbolPairIndex >= 0 && room.symbolPairIndex < symbolPairs.length) {
        currentPairIndex = room.symbolPairIndex;
        updateSymbolButtons();
    }

    canEditOnlineSymbolStyle = room.yourSymbol === 'X';
    setSymbolSelectionDisabled(!canEditOnlineSymbolStyle);

    applyRemoteBoard(room.board, currentPairIndex);
    currentPlayer = room.currentTurn || 'X';
    gameActive = room.status === 'active';

    const yourSymbol = toDisplaySymbol(room.yourSymbol, currentPairIndex);
    const turnSymbol = toDisplaySymbol(room.currentTurn, currentPairIndex);
    const statusHeader = getOnlineStatusHeader(room);
    const turnPlayerName = getRoomPlayerName(room, room.currentTurn, `Player ${room.currentTurn}`);

    if (roomCodeDisplay && room.roomId) {
        roomCodeDisplay.textContent = `Room: ${room.roomId}`;
    }

    if (room.status === 'waiting') {
        statusDisplay.innerHTML = `${statusHeader}<br>Waiting for opponent to join...`;
        statusDisplay.style.color = 'var(--text-dim)';
        setOnlineFeedback('Share your invite link with your friend.');
        return;
    }

    if (room.status === 'active') {
        const yourTurn = room.yourTurn;
        const line = yourTurn
            ? `Your turn: ${turnPlayerName} (${yourSymbol})`
            : `Turn: ${turnPlayerName} (${turnSymbol})`;
        statusDisplay.innerHTML = `${statusHeader}<br>${line}`;
        statusDisplay.style.color = yourTurn ? '#93c5fd' : 'var(--text-dim)';
        setOnlineFeedback(yourTurn ? 'Make your move.' : 'Waiting for opponent move.');
        return;
    }

    if (room.status === 'finished') {
        if (room.winner) {
            const winnerName = getRoomPlayerName(room, room.winner, `Player ${room.winner}`);
            const winnerSymbol = toDisplaySymbol(room.winner, currentPairIndex);
            statusDisplay.innerHTML = `${statusHeader}<br>Winner: ${winnerName} (${winnerSymbol})`;
            statusDisplay.style.color = '#22c55e';
        } else {
            statusDisplay.innerHTML = `${statusHeader}<br>Result: Draw`;
            statusDisplay.style.color = '#cbd5e1';
        }
        setOnlineFeedback('Game ended. Tap Restart to play again.');
    }
}

function stopOnlinePolling() {
    if (onlinePollInterval) {
        clearInterval(onlinePollInterval);
        onlinePollInterval = null;
    }
}

async function onlineApi(path, options = {}) {
    let baseUrl = '';

    if (window.location.protocol === 'file:') {
        baseUrl = 'http://127.0.0.1:8787/api/multiplayer';
    } else {
        baseUrl = `${window.location.origin}/api/multiplayer`;
    }

    const endpoint = `${baseUrl}${path}`;
    let response;

    try {
        response = await fetch(endpoint, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });
    } catch (error) {
        throw new Error('Online server niet bereikbaar. Start `npm run online` en open via http://localhost:8787');
    }

    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error('Server response is ongeldig. Controleer of je via de multiplayer server draait.');
    }

    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Online request failed');
    }
    return data;
}

async function syncOnlineState() {
    if (!onlineSession) return;

    try {
        const data = await onlineApi(`/rooms/${onlineSession.roomId}/state?playerId=${onlineSession.playerId}`);
        renderOnlineState(data.room);
    } catch (error) {
        setOnlineFeedback(error.message, true);
    }
}

function startOnlinePolling() {
    stopOnlinePolling();
    syncOnlineState();
    onlinePollInterval = setInterval(syncOnlineState, 1200);
}

async function createOnlineRoom() {
    try {
        const data = await onlineApi('/rooms', {
            method: 'POST',
            body: {
                playerName,
                symbolPairIndex: currentPairIndex
            }
        });

        onlineSession = {
            roomId: data.room.roomId,
            playerId: data.playerId
        };

        setOnlineControlsState(true);
        renderOnlineState(data.room);
        startOnlinePolling();
    } catch (error) {
        setOnlineFeedback(error.message, true);
    }
}

async function setOnlineSymbolPair(index) {
    if (!onlineSession) return;
    if (!canEditOnlineSymbolStyle) {
        setOnlineFeedback('Alleen de room-maker kan de tekens aanpassen.', true);
        return;
    }

    const parsedIndex = Number(index);
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= symbolPairs.length) return;

    try {
        const data = await onlineApi(`/rooms/${onlineSession.roomId}/style`, {
            method: 'POST',
            body: {
                playerId: onlineSession.playerId,
                symbolPairIndex: parsedIndex
            }
        });
        renderOnlineState(data.room);
        setOnlineFeedback('Symbol style updated for this room.');
    } catch (error) {
        setOnlineFeedback(error.message, true);
    }
}

async function joinOnlineRoom(codeFromInput) {
    const roomCode = normalizeRoomCode(codeFromInput);
    if (!roomCode) {
        setOnlineFeedback('Enter a valid room code.', true);
        return;
    }

    try {
        const data = await onlineApi(`/rooms/${roomCode}/join`, {
            method: 'POST',
            body: { playerName }
        });

        onlineSession = {
            roomId: data.room.roomId,
            playerId: data.playerId
        };

        if (roomCodeInput) roomCodeInput.value = '';
        setOnlineControlsState(true);
        renderOnlineState(data.room);
        startOnlinePolling();
    } catch (error) {
        setOnlineFeedback(error.message, true);
    }
}

function leaveOnlineRoom() {
    stopOnlinePolling();
    onlineSession = null;
    canEditOnlineSymbolStyle = true;
    setSymbolSelectionDisabled(false);
    setOnlineControlsState(false);
    setOnlineFeedback('Left room.');
    if (roomCodeDisplay) roomCodeDisplay.textContent = 'Room: -';
    handleRestartGame();
}

async function copyInviteLink() {
    if (!onlineSession) {
        setOnlineFeedback('Create or join a room first.', true);
        return;
    }

    const inviteBaseUrl = getInviteBaseUrl();
    if (!inviteBaseUrl) {
        setOnlineFeedback('Geen publieke URL ingesteld. Invite niet gekopieerd.', true);
        return;
    }

    const inviteLink = `${inviteBaseUrl}/room/${onlineSession.roomId}`;

    try {
        await copyToClipboardFallback(inviteLink);
        setOnlineFeedback('Invite link copied.');
    } catch (error) {
        window.prompt('Copy this invite link:', inviteLink);
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    // Add class based on player index (p1 or p2) for styling if needed, or just generic 'occupied'
    // keeping simple styles for now
    clickedCell.classList.add('occupied');
}

function handlePlayerChange() {
    const p1 = symbolPairs[currentPairIndex].p1;
    const p2 = symbolPairs[currentPairIndex].p2;
    
    currentPlayer = currentPlayer === p1 ? p2 : p1;
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn`;

    // If AI mode and it's AI's turn (Player 2)
    if (gameActive && gameMode === 'PvAI' && currentPlayer === p2) {
        const delay = Math.random() * 500 + 300; 
        setTimeout(makeAiMove, delay);
    }
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} Wins!`;
        statusDisplay.style.color = currentPlayer === symbolPairs[currentPairIndex].p1 ? "#fca5a5" : "#93c5fd";
        gameActive = false;
        
        // Update stats
        const p1 = symbolPairs[currentPairIndex].p1;
        if (gameMode === 'PvAI') {
            if (currentPlayer === p1) {
                updateStats('win');
                showCelebration('win');
            } else {
                updateStats('loss');
                showCelebration('loss');
            }
        } else {
            // In PvP mode, just show a win celebration
            showCelebration('win');
        }
        
        // Show scroll hint after a delay
        showScrollHint();
        
        return true; 
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = `Draw!`;
        statusDisplay.style.color = "#cbd5e1";
        gameActive = false;
        updateStats('draw');
        
        // Show scroll hint after a delay
        showScrollHint();
        
        return true; 
    }

    handlePlayerChange();
    return false;
}

async function handleOnlineMove(clickedCellIndex) {
    if (!onlineSession || !gameActive) return;

    try {
        const data = await onlineApi(`/rooms/${onlineSession.roomId}/move`, {
            method: 'POST',
            body: {
                playerId: onlineSession.playerId,
                index: clickedCellIndex
            }
        });
        renderOnlineState(data.room);
    } catch (error) {
        setOnlineFeedback(error.message, true);
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.currentTarget || clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    console.log('Cell clicked:', clickedCellIndex, 'GameActive:', gameActive, 'GameState:', gameState[clickedCellIndex]);

    if (isOnlineMode()) {
        handleOnlineMove(clickedCellIndex);
        return;
    }

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

// AI Functions
function makeAiMove() {
    if (!gameActive) return;

    let moveIndex = -1;

    if (aiDifficulty === 'easy') {
        moveIndex = getEasyMove();
    } else if (aiDifficulty === 'medium') {
        moveIndex = getMediumMove();
    } else {
        moveIndex = getHardMove();
    }

    if (moveIndex !== -1) {
        const cell = document.querySelector(`.cell[data-index='${moveIndex}']`);
        handleCellPlayed(cell, moveIndex);
        handleResultValidation();
    }
}

function getEasyMove() {
    const availableMoves = gameState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    return -1;
}

function getMediumMove() {
    const p1 = symbolPairs[currentPairIndex].p1;
    const p2 = symbolPairs[currentPairIndex].p2;

    // AI is p2
    let move = findImmediateBestMove(p2);
    if (move !== -1) return move;
    
    move = findImmediateBestMove(p1);
    if (move !== -1) return move;

    return getEasyMove();
}

function findImmediateBestMove(playerSymbol) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const values = [gameState[a], gameState[b], gameState[c]];
        const playerCount = values.filter(v => v === playerSymbol).length;
        const emptyCount = values.filter(v => v === "").length;

        if (playerCount === 2 && emptyCount === 1) {
            if (gameState[a] === "") return a;
            if (gameState[b] === "") return b;
            if (gameState[c] === "") return c;
        }
    }
    return -1;
}

function getHardMove() {
    let bestScore = -Infinity;
    let move = -1;
    
    // Optimization for first move
    const emptySpots = gameState.filter(s => s === "").length;
    if (emptySpots === 9) return 4;
    if (emptySpots === 8 && gameState[4] === "") return 4;

    const p2 = symbolPairs[currentPairIndex].p2;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = p2;
            let score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = { win: 10, loss: -10, tie: 0 };

function minimax(board, depth, isMaximizing) {
    const p1 = symbolPairs[currentPairIndex].p1;
    const p2 = symbolPairs[currentPairIndex].p2;

    let result = checkWinner();
    if (result !== null) {
        if (result === p2) return scores.win;
        if (result === p1) return scores.loss;
        return scores.tie;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = p2;
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = p1;
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    if (!gameState.includes("")) return "tie";
    return null;
}

function handleRestartGame() {
    if (selectedGameType === 'connect4') {
        restartConnect4();
        return;
    }

    if (selectedGameType === 'battleship') {
        restartBattleship();
        return;
    }

    if (isOnlineMode() && onlineSession) {
        onlineApi(`/rooms/${onlineSession.roomId}/restart`, {
            method: 'POST',
            body: {
                playerId: onlineSession.playerId
            }
        }).then((data) => {
            renderOnlineState(data.room);
        }).catch((error) => {
            setOnlineFeedback(error.message, true);
        });
        return;
    }

    gameActive = true;
    const p1 = symbolPairs[currentPairIndex].p1;
    const p2 = symbolPairs[currentPairIndex].p2;
    
    currentPlayer = p1;
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn`;
    statusDisplay.style.color = "var(--text-dim)";
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('occupied'); 
    });

    // Check if AI needs to move (if we ever support AI starts)
    // Currently AI is always P2, so P1 always starts.
}

function setGameMode(mode) {
    console.log(`Setting mode: ${mode}`);

    if (selectedGameType !== 'tictactoe' && mode === 'Online') {
        setOnlineFeedback('Online mode is momenteel alleen beschikbaar voor TicTacToe.');
        mode = 'PvP';
    }

    if (selectedGameType === 'battleship' && mode !== 'PvAI') {
        mode = 'PvAI';
    }

    gameMode = mode;

    setModeButtons(mode);

    if (difficultyContainer) {
        const showDifficulty = mode === 'PvAI' && (selectedGameType === 'tictactoe' || selectedGameType === 'connect4');
        difficultyContainer.style.display = showDifficulty ? 'flex' : 'none';
    }
    if (onlineSection) {
        onlineSection.style.display = selectedGameType === 'tictactoe' && mode === 'Online' ? 'flex' : 'none';
    }

    if (mode !== 'Online') {
        stopOnlinePolling();
    }

    handleRestartGame();

    if (mode === 'Online' && selectedGameType === 'tictactoe') {
        if (onlineSession) {
            setOnlineControlsState(true);
            startOnlinePolling();
        } else {
            canEditOnlineSymbolStyle = true;
            setSymbolSelectionDisabled(false);
            setOnlineControlsState(false);
            statusDisplay.innerHTML = 'Create or join an online room.';
            statusDisplay.style.color = 'var(--text-dim)';
            setOnlineFeedback('Web multiplayer beta is ready.');
        }
    } else {
        canEditOnlineSymbolStyle = true;
        setSymbolSelectionDisabled(false);
        setOnlineFeedback('');
    }
}

function setDifficulty(level) {
    console.log(`Setting difficulty: ${level}`);
    aiDifficulty = level;
    diffBtns.forEach(btn => {
        const btnLevel = btn.getAttribute('data-level');
        if (btnLevel === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    handleRestartGame();
}

function setSymbolPair(index) {
    console.log(`Setting symbol pair index: ${index}`);
    currentPairIndex = parseInt(index);
    updateSymbolButtons();
    handleRestartGame();
}

if (cells.length > 0) {
    cells.forEach(cell => {
        // Use both click and touchstart for better mobile responsiveness
        // But prevent double firing
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('touchstart', (e) => {
            // Prevent default to avoid double-tap zoom or simulated click delay
            // However, we need to be careful not to block scrolling if needed. 
            // Since this is a game grid, usually we want instant reaction.
            e.preventDefault(); 
            handleCellClick(e);
        }, { passive: false });
    });
} else {
    console.error("No cells found");
}

if (connect4Board) {
    connect4Board.addEventListener('click', (event) => {
        if (selectedGameType !== 'connect4') return;
        const target = event.target.closest('.connect4-cell');
        if (!target || !connect4Active) return;
        if (gameMode === 'PvAI' && connect4CurrentTurn === 'O') return;
        const col = Number(target.getAttribute('data-col'));
        if (!Number.isInteger(col)) return;
        applyConnect4Move(col);
    });
}

if (battleshipTargetGrid) {
    battleshipTargetGrid.addEventListener('click', (event) => {
        if (selectedGameType !== 'battleship') return;
        const target = event.target.closest('.battleship-cell');
        if (!target) return;
        const index = Number(target.getAttribute('data-index'));
        if (!Number.isInteger(index)) return;
        handleBattleshipShot(index);
    });
}

if (gameBtns.length > 0) {
    gameBtns.forEach((btn) => {
        const handler = (event) => {
            if (event.type === 'touchstart') event.preventDefault();
            const selected = event.currentTarget.getAttribute('data-game');
            setSelectedGameType(selected);
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchstart', handler, { passive: false });
    });
}

if (restartBtn) {
    restartBtn.addEventListener('click', handleRestartGame);
    restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleRestartGame(); }, { passive: false });
}

if (pvpBtn) {
    pvpBtn.addEventListener('click', () => setGameMode('PvP'));
    pvpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setGameMode('PvP'); }, { passive: false });
}

if (pvcBtn) {
    pvcBtn.addEventListener('click', () => setGameMode('PvAI'));
    pvcBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setGameMode('PvAI'); }, { passive: false });
}

if (onlineBtn) {
    onlineBtn.addEventListener('click', () => setGameMode('Online'));
    onlineBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setGameMode('Online'); }, { passive: false });
}

if (goOnlineBtn) {
    const handleGoOnline = () => {
        setGameMode('Online');
        if (!onlineSession) {
            createOnlineRoom();
        }
    };

    goOnlineBtn.addEventListener('click', handleGoOnline);
    goOnlineBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleGoOnline();
    }, { passive: false });
}

if (diffBtns.length > 0) {
    diffBtns.forEach(btn => {
        const handler = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            setDifficulty(e.currentTarget.getAttribute('data-level'));
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchstart', handler, { passive: false });
    });
}

if (symbolBtns.length > 0) {
    symbolBtns.forEach(btn => {
        const handler = async (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            const nextPairIndex = parseInt(e.currentTarget.getAttribute('data-pair'));

            if (isOnlineMode() && onlineSession) {
                await setOnlineSymbolPair(nextPairIndex);
                return;
            }

            setSymbolPair(nextPairIndex);
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchstart', handler, { passive: false });
    });
}

const themeBtns = document.querySelectorAll('.theme-btn');
if (themeBtns.length > 0) {
    themeBtns.forEach(btn => {
        const handler = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            setGameTheme(e.currentTarget.getAttribute('data-theme'));
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchstart', handler, { passive: false });
    });
}

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', createOnlineRoom);
}

if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => joinOnlineRoom(roomCodeInput ? roomCodeInput.value : ''));
}

if (roomCodeInput) {
    roomCodeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            joinOnlineRoom(roomCodeInput.value);
        }
    });
}

if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', copyInviteLink);
}

if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', leaveOnlineRoom);
}

function setGameTheme(theme) {
    console.log(`Setting theme: ${theme}`);
    document.body.className = `theme-${theme}`; // Overwrites other classes, be careful if body has other classes
    // Actually, body currently only has theme classes potentially.
    // Let's remove any existing theme- class and add the new one to be safe
    document.body.classList.remove('theme-nebula', 'theme-ocean', 'theme-forest', 'theme-sunset');
    document.body.classList.add(`theme-${theme}`);

    themeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Scoreboard Functions
function updateStats(result) {
    if (result === 'win') {
        stats.wins++;
        localStorage.setItem('wins', stats.wins);
    } else if (result === 'loss') {
        stats.losses++;
        localStorage.setItem('losses', stats.losses);
    } else if (result === 'draw') {
        stats.draws++;
        localStorage.setItem('draws', stats.draws);
    }
    updateScoreDisplay();
}

function updateScoreDisplay() {
    winsCount.textContent = stats.wins;
    lossesCount.textContent = stats.losses;
    drawsCount.textContent = stats.draws;
}

function toggleScoreboard() {
    scoreboardPanel.classList.toggle('open');
    scoreboardTab.classList.toggle('hidden');
}

function openScoreboard() {
    scoreboardPanel.classList.add('open');
    scoreboardTab.classList.add('hidden');
}

function closeScoreboard() {
    scoreboardPanel.classList.remove('open');
    scoreboardTab.classList.remove('hidden');
}

// Swipe detection for scoreboard
let touchStartX = 0;
let touchEndX = 0;
let openTouchStartX = 0;
let openTouchStartY = 0;

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    // Swipe right to close (minimum 50px)
    if (swipeDistance > 50) {
        closeScoreboard();
    }
}

if (scoreboardPanel) {
    scoreboardPanel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    scoreboardPanel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

// Swipe left from the right edge to open scoreboard
document.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    openTouchStartX = touch.screenX;
    openTouchStartY = touch.screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!scoreboardPanel || scoreboardPanel.classList.contains('open')) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.screenX - openTouchStartX;
    const deltaY = touch.screenY - openTouchStartY;
    const startedFromRightEdge = openTouchStartX >= (window.innerWidth - 40);
    const mostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    // Open on clear right-to-left swipe from right edge
    if (startedFromRightEdge && mostlyHorizontal && deltaX < -50) {
        openScoreboard();
    }
}, { passive: true });

// Celebration Functions
function showCelebration(type) {
    if (type === 'win') {
        // Show confetti
        createConfetti();
        
        // Show win message
        const winMsg = document.createElement('div');
        winMsg.className = 'win-message';
        winMsg.textContent = '🎉 YOU WIN! 🎉';
        celebrationContent.appendChild(winMsg);
        
        celebrationOverlay.classList.add('active');
        
        // Remove after animation
        setTimeout(() => {
            celebrationOverlay.classList.remove('active');
            celebrationContent.innerHTML = '';
        }, 3000);
        
    } else if (type === 'loss') {
        // Shake the container
        container.classList.add('shake');
        
        // Show loss message
        const lossMsg = document.createElement('div');
        lossMsg.className = 'loss-message';
        lossMsg.textContent = '😢 YOU LOST';
        celebrationContent.appendChild(lossMsg);
        
        celebrationOverlay.classList.add('active');
        
        // Remove shake and message
        setTimeout(() => {
            container.classList.remove('shake');
        }, 500);
        
        setTimeout(() => {
            celebrationOverlay.classList.remove('active');
            celebrationContent.innerHTML = '';
        }, 2000);
    }
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random position
        confetti.style.left = Math.random() * 100 + '%';
        
        // Random color
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Random delay
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        
        // Random duration
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        celebrationContent.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// Scroll Hint Functions
function showScrollHint() {
    // Wait for celebration to finish
    setTimeout(() => {
        // Check if restart button is visible in viewport
        const restartBtnRect = restartBtn.getBoundingClientRect();
        const isVisible = (
            restartBtnRect.top >= 0 &&
            restartBtnRect.bottom <= window.innerHeight
        );
        
        // Only show hint if button is not visible
        if (!isVisible && scrollHint) {
            scrollHint.classList.add('show');
        }
    }, 3000); // Wait 3 seconds after game ends
}

// Hide scroll hint when user scrolls
if (container) {
    container.addEventListener('scroll', () => {
        if (scrollHint) {
            scrollHint.classList.remove('show');
        }
    });
}

// Share Functions
function getShareMessage() {
    const name = playerName || 'Guest';
    const message = `🎮 ${name}'s Tic-Tac-Toe Stats 🎮\n\n` +
                   `🏆 Wins: ${stats.wins}\n` +
                   `😢 Losses: ${stats.losses}\n` +
                   `🤝 Draws: ${stats.draws}\n\n` +
                   `Total Games: ${stats.wins + stats.losses + stats.draws}\n\n` +
                   `Can you beat my score? Play now!`;
    return message;
}

function isNativeRuntime() {
    return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
}

function showCopySuccess() {
    if (!shareCopy) return;

    shareCopy.classList.add('copied');
    const originalText = shareCopy.innerHTML;
    shareCopy.innerHTML = '<span>✓ Copied!</span>';

    setTimeout(() => {
        shareCopy.classList.remove('copied');
        shareCopy.innerHTML = originalText;
    }, 2000);
}

async function copyToClipboardFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
        throw new Error('document.execCommand copy failed');
    }
}

async function shareOnWhatsApp() {
    const message = getShareMessage();
    const url = window.location.href;
    const fullText = `${message}\n\n${url}`;

    if (isNativeRuntime()) {
        try {
            await Share.share({
                title: 'My Tic-Tac-Toe Stats',
                text: fullText,
                dialogTitle: 'Share via WhatsApp'
            });
            return;
        } catch (error) {
            console.log('Native share failed, using WhatsApp link fallback', error);
        }
    }

    const text = encodeURIComponent(fullText);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
        ? `https://api.whatsapp.com/send?text=${text}`
        : `https://web.whatsapp.com/send?text=${text}`;

    window.location.href = whatsappUrl;
}

async function shareOnFacebook() {
    const message = getShareMessage();
    const url = window.location.href;
    const fullText = `${message}\n\n${url}`;

    if (isNativeRuntime()) {
        try {
            await Share.share({
                title: 'My Tic-Tac-Toe Stats',
                text: fullText,
                dialogTitle: 'Share via Facebook'
            });
            return;
        } catch (error) {
            console.log('Native share failed, using Facebook link fallback', error);
        }
    }

    const shareUrl = encodeURIComponent(url);
    const quote = encodeURIComponent(message);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`;
    window.location.href = facebookUrl;
}

async function copyShareLink() {
    const link = window.location.href;
    let copied = false;

    if (isNativeRuntime()) {
        try {
            await Clipboard.write({ string: link });
            copied = true;
        } catch (error) {
            console.warn('Native clipboard failed, trying web fallback:', error);
        }
    }

    if (!copied) {
        try {
            await copyToClipboardFallback(link);
            copied = true;
        } catch (error) {
            console.warn('Web clipboard fallback failed:', error);
        }
    }

    if (copied) {
        showCopySuccess();
        return;
    }

    window.prompt('Kopieer deze link handmatig:', link);
}

function updatePlayerName() {
    const name = playerNameInput.value.trim() || 'Guest';
    playerName = name;
    localStorage.setItem('playerName', playerName);
    playerNameDisplay.textContent = playerName;

    if (selectedGameType === 'connect4' || selectedGameType === 'battleship') {
        handleRestartGame();
    }
}

// Initialize
createConnect4Board();
createBattleshipGrid(battleshipOwnGrid, 'own');
createBattleshipGrid(battleshipTargetGrid, 'target');
updateVisibleBoard();
updateGameButtons();
setModeButtonsAvailability();
setGameMode('PvAI');
document.body.classList.add('theme-nebula'); // Default theme

// Initialize scoreboard
playerNameInput.value = playerName;
playerNameDisplay.textContent = playerName;
updateScoreDisplay();

const initialRoomCode = getRoomCodeFromLocation();
if (initialRoomCode) {
    if (roomCodeInput) roomCodeInput.value = initialRoomCode;
    setGameMode('Online');
    joinOnlineRoom(initialRoomCode);
}

// Player name input listener
if (playerNameInput) {
    playerNameInput.addEventListener('input', updatePlayerName);
    playerNameInput.addEventListener('blur', updatePlayerName);
}

// Scoreboard tab listener
if (scoreboardTab) {
    scoreboardTab.addEventListener('click', toggleScoreboard);
    scoreboardTab.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleScoreboard();
    }, { passive: false });
}

// Close scoreboard button listener
if (closeScoreboardBtn) {
    closeScoreboardBtn.addEventListener('click', closeScoreboard);
    closeScoreboardBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeScoreboard();
    }, { passive: false });
}

// Share button listeners
if (shareWhatsApp) {
    shareWhatsApp.addEventListener('click', shareOnWhatsApp);
}

if (shareFacebook) {
    shareFacebook.addEventListener('click', shareOnFacebook);
}

if (shareCopy) {
    shareCopy.addEventListener('click', copyShareLink);
}

// Reset stats button
if (resetStatsBtn) {
    resetStatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all stats?')) {
            stats = { wins: 0, losses: 0, draws: 0 };
            localStorage.setItem('wins', 0);
            localStorage.setItem('losses', 0);
            localStorage.setItem('draws', 0);
            updateScoreDisplay();
        }
    });
    resetStatsBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to reset all stats?')) {
            stats = { wins: 0, losses: 0, draws: 0 };
            localStorage.setItem('wins', 0);
            localStorage.setItem('losses', 0);
            localStorage.setItem('draws', 0);
            updateScoreDisplay();
        }
    }, { passive: false });
}
