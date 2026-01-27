import { loadData, saveToServer } from './api.js';
import { initGraphics } from './graphics.js';

let board = null;
const game = new Chess();
let moveTree = {};
const $noteArea = $('#noteArea');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let saveTimer = null;

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
        console.log("자동 저장 완료!"); // 확인용
    }, 1000);
});

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    const fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { move: move.san, note: "" };
    $noteArea.val(moveTree[fen].note);
    saveToServer(moveTree);
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
        canvas.width = boardEl.clientWidth;
        canvas.height = boardEl.clientHeight;

        canvas.style.top = boardEl.offsetTop + "px";
        canvas.style.left = boardEl.offsetLeft + "px";
    }
}

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