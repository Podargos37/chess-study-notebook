// js/app.js
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';
import { UI } from './ui.js';
import { initEventListeners } from './events.js';
import { NoteManager } from './modules/noteManager.js';
import { GameManager } from './modules/gameManager.js';

const game = new Chess();
const $noteArea = $('#noteArea');
const aiManager = new ChessAI();
const noteManager = new NoteManager($noteArea);
let board = null;
let gameManager = null;

// 초기화
noteManager.init().then(() => {
    gameManager = new GameManager(game, board, aiManager, noteManager);
});

const handlers = {
    onUndo: () => {
        const fen = gameManager.undo();
        $noteArea.val(noteManager.getNote(fen));
        UI.syncCanvasSize(board);
    },
    onFlip: () => { board.flip(); UI.syncCanvasSize(board); },
    onStartBattle: (side, file) => gameManager.startBattle(side, file)
};

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    gameManager.afterMove(game.fen(), move.san);
    if (gameManager.isBattleMode && !game.game_over()) {
        setTimeout(() => gameManager.makeAiMove(), 600);
    }
}

// 보드 설정 및 이벤트 연결
// js/app.js 내 보드 설정 부분
board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDragStart: (source, piece, position, orientation) => {
        // 1. 우클릭(버튼 2)인 경우 기물을 잡지 못하게 함
        if (window.event && (window.event.buttons === 2 || window.event.button === 2)) {
            return false;
        }

        // 2. 게임이 끝났거나 내 차례가 아닐 때 드래그 방지 (기존 로직 유지)
        if (game.game_over()) return false;

    },
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

initEventListeners(handlers);
initGraphics(document.getElementById('drawingCanvas'), document.getElementById('drawingCanvas').getContext('2d'), game, {}, $noteArea, null, 'boardWrapper');

// [추가] 보드가 그려진 후 캔버스 위치를 즉시 맞춥니다.
setTimeout(() => {
    UI.syncCanvasSize(board);
}, 100);

$noteArea.on('input', function() {
    noteManager.saveCurrentNote(game.fen(), $(this).val());
});