// js/modules/boardSetup.js
import { UI } from '../ui.js';

/**
 * 체스판 생성 및 핸들러 생성.
 * getGameManager: () => gameManager (비동기 초기화 후 설정됨)
 * @returns {{ board: object, createHandlers: () => object }}
 */
export function initBoardSetup(game, $noteArea, aiManager, noteManager, getGameManager) {
    function onDrop(source, target) {
        const move = game.move({ from: source, to: target, promotion: 'q' });
        if (move === null) return 'snapback';

        const gameManager = getGameManager();
        if (gameManager) {
            gameManager.afterMove(game.fen(), move.san);
            if (gameManager.isBattleMode && !game.game_over()) {
                setTimeout(() => gameManager.makeAiMove(), 600);
            }
        }
    }

    const board = Chessboard('myBoard', {
        draggable: true,
        position: 'start',
        onDragStart: (source, piece, position, orientation) => {
            if (window.event && (window.event.buttons === 2 || window.event.button === 2)) {
                return false;
            }
            if (game.game_over()) return false;
        },
        onDrop: onDrop,
        onSnapEnd: () => board.position(game.fen()),
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    function createHandlers() {
        return {
            onUndo: () => {
                const gm = getGameManager();
                if (!gm) return;
                const fen = gm.undo();
                noteManager.loadDataByFen(fen).then((data) => {
                    $noteArea.val(data ? data.note : '');
                });
                UI.syncCanvasSize(board);
                aiManager.analyze(fen, (result) => UI.updateEvalBar(result));
            },
            onFlip: () => {
                board.flip();
                UI.syncCanvasSize(board);
            },
            onStartBattle: (side, file) => getGameManager().startBattle(side, file),
            onResize: () => UI.syncCanvasSize(board)
        };
    }

    return { board, createHandlers };
}
