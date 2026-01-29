import { loadData, saveToServer } from './api.js';
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';

let board = null;
const game = new Chess();
let moveTree = {};
const $noteArea = $('#noteArea');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let saveTimer = null;
const aiManager = new ChessAI('stockfish'); // 기본은 스톡피쉬

// 초기 데이터 로드
loadData($noteArea).then(data => { moveTree = data; });

initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, 'boardWrapper');

// 디바운싱
$noteArea.on('input', function() {
    const fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { move: "", note: "" };
    moveTree[fen].note = $(this).val();

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveToServer(moveTree);
    }, 1000);
});


function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    const fen = game.fen();

    // 4. 수가 두어질 때마다 AI에게 분석 요청
    aiManager.analyze(fen, (result) => {
        updateEvalBar(result);
    });

    if (!moveTree[fen]) moveTree[fen] = { move: move.san, note: "" };
    $noteArea.val(moveTree[fen].note);
    saveToServer(moveTree);
}

function updateEvalBar(result) {
    const score = result.score; // 예: -0.44

    // 1. 텍스트 업데이트
    const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
    $('#eval-text').text(displayScore);

    // 2. 바 높이 조절 (백 승률 기준 시그모이드 근사치)
    // 점수가 0이면 50%, +3이면 90%, -3이면 10% 정도가 되게 설정
    const winPercent = 50 + (50 * (2 / (1 + Math.exp(-0.4 * score)) - 1));
    $('#eval-fill').css('height', `${winPercent}%`);

    console.log(`형세 점수: ${displayScore} (백 승률: ${winPercent.toFixed(1)}%)`);
}

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

$(window).on('resize', function() {
    board.resize();
    syncCanvasSize();
});

function syncCanvasSize() {
    const boardEl = document.getElementById('myBoard');
    const canvas = document.getElementById('drawingCanvas');
    if (boardEl && canvas) {
        // 보드의 실제 렌더링 크기를 캔버스에 동기화
        canvas.width = boardEl.clientWidth;
        canvas.height = boardEl.clientHeight;

        // 캔버스를 보드 바로 위에 띄우기
        canvas.style.top = boardEl.offsetTop + "px";
        canvas.style.left = boardEl.offsetLeft + "px";

        // 보드 자체가 작게 나오면 강제 리사이즈
        if(board) board.resize();
    }
}

$(document).ready(() => {
    setTimeout(() => {
        syncCanvasSize();
    }, 500);
});

$(window).on('resize', function() {
    board.resize();
    syncCanvasSize();
});

setTimeout(() => {
    board.resize();
    syncCanvasSize();
}, 200);

syncCanvasSize();

$('#flipBtn').on('click', board.flip);

$('#undoBtn').on('click', function() {
    game.undo();
    board.position(game.fen());

    const fen = game.fen();
    $noteArea.val(moveTree[fen]?.note || "");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
});