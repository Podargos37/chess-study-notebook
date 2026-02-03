// js/app.js
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';
import { UI } from './ui.js';
import { initEventListeners } from './events.js';
import { NoteManager } from './modules/noteManager.js';
import { GameManager } from './modules/gameManager.js';
import { initAuth } from './modules/authManager.js';
import { initBoardSetup } from './modules/boardSetup.js';

const game = new Chess();
const $noteArea = $('#noteArea');
const aiManager = new ChessAI();
const noteManager = new NoteManager($noteArea, game);

let gameManager = null;
const getGameManager = () => gameManager;

// 인증 UI 및 이벤트
initAuth();

// 보드 생성 및 핸들러 (getGameManager는 비동기 초기화 후 채워짐)
const { board, createHandlers } = initBoardSetup(
    game,
    $noteArea,
    aiManager,
    noteManager,
    getGameManager
);

noteManager.init().then(() => {
    gameManager = new GameManager(game, board, aiManager, noteManager);
    aiManager.analyze(game.fen(), (result) => UI.updateEvalBar(result));
});

const handlers = createHandlers();
initEventListeners(handlers);

// 그래픽(드로잉 캔버스)
const drawingCanvas = document.getElementById('drawingCanvas');
if (drawingCanvas) {
    const ctx = drawingCanvas.getContext('2d');
    initGraphics(drawingCanvas, ctx, game, null, $noteArea, null, 'boardWrapper');
}

UI.syncCanvasSize(board);
window.addEventListener('resize', () => UI.syncCanvasSize(board));

const myBoard = document.getElementById('myBoard');
if (myBoard) {
    myBoard.addEventListener('contextmenu', (e) => e.preventDefault());
}

$noteArea.on('input', function () {
    noteManager.saveCurrentNote(game.fen(), $(this).val());
});
