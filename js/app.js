import { loadData, saveToServer } from './api.js';
import { initGraphics } from './graphics.js';

let board = null;
const game = new Chess();
let moveTree = {};
const $noteArea = $('#noteArea');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
// 타이머 변수 추가 (성능 최적화용)
let saveTimer = null;

// 1. 초기 데이터 로드
loadData($noteArea).then(data => { moveTree = data; });

// 2. 그래픽 초기화
initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, 'boardWrapper');

// 3. [핵심] 스마트 자동 저장 로직 (디바운싱)
$noteArea.on('input', function() {
    const fen = game.fen();

    // 변수에는 실시간으로 글자를 반영 (화면 동기화)
    if (!moveTree[fen]) moveTree[fen] = { move: "", note: "" };
    moveTree[fen].note = $(this).val();

    // 기존에 예약된 저장이 있다면 취소 (아직 타자 치는 중이니까)
    clearTimeout(saveTimer);

    // 타자를 멈추고 '1초(1000ms)' 뒤에 서버로 저장
    saveTimer = setTimeout(() => {
        saveToServer(moveTree);
        console.log("자동 저장 완료!"); // 확인용
    }, 1000);
});

// 4. 기물 놓을 때는 즉시 저장 (타이핑이 아니므로 바로 저장해도 됨)
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

$('#flipBtn').on('click', board.flip);