import { loadData, saveToServer } from './api.js';
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';
import { UI } from './ui.js';              // UI 모듈 임포트
import { initEventListeners } from './events.js'; // 이벤트 모듈 임포트

// --- 변수 설정 ---
let board = null;
const game = new Chess();
let moveTree = {};
const $noteArea = $('#noteArea');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let saveTimer = null;
const aiManager = new ChessAI('stockfish');

// --- 초기화 로직 ---
loadData($noteArea).then(data => { moveTree = data; });

initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, 'boardWrapper');

// --- 핵심 핸들러 정의 (이벤트 모듈에 전달용) ---
const handlers = {
    onUndo: handleUndo,
    onFlip: () => {
        board.flip();
        UI.syncCanvasSize(board);
    },
    onResize: () => {
        board.resize();
        UI.syncCanvasSize(board);
    }
};

// 외부 모듈에서 정의한 이벤트 리스너 등록
initEventListeners(handlers);

// --- 게임 로직 ---
function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    const fen = game.fen();

    // AI 분석 요청 및 UI 업데이트
    aiManager.analyze(fen, (result) => {
        UI.updateEvalBar(result);
    });

    if (!moveTree[fen]) moveTree[fen] = { move: move.san, note: "" };
    $noteArea.val(moveTree[fen].note);
    saveToServer(moveTree);
}

function handleUndo() {
    game.undo();
    board.position(game.fen());

    const fen = game.fen();
    $noteArea.val(moveTree[fen]?.note || "");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    aiManager.analyze(fen, (result) => {
        UI.updateEvalBar(result);
    });

    UI.syncCanvasSize(board);
}

// --- 보드 및 캔버스 설정 ---
board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDragStart: (source, piece) => {
        if (window.event && (window.event.buttons === 2 || window.event.button === 2)) return false;
    },
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

// 초기 실행 및 리사이즈 대응
$(document).ready(() => {
    setTimeout(() => UI.syncCanvasSize(board), 500);
});

// 노트 영역 자동 저장 (디바운싱)
$noteArea.on('input', function() {
    const fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { move: "", note: "" };
    moveTree[fen].note = $(this).val();

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToServer(moveTree), 1000);
});