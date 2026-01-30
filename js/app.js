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
board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

initEventListeners(handlers);
initGraphics(document.getElementById('drawingCanvas'), document.getElementById('drawingCanvas').getContext('2d'), game, {}, $noteArea, null, 'boardWrapper');

$noteArea.on('input', function() {
    noteManager.saveCurrentNote(game.fen(), $(this).val());
});