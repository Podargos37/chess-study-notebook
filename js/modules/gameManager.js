// js/modules/gameManager.js
// 게임의 규칙, 보드 상태, ai 대결을 전담
import { UI } from '../ui.js';

export class GameManager {
    constructor(game, board, aiManager, noteManager) {
        this.game = game;
        this.board = board;
        this.aiManager = aiManager;
        this.noteManager = noteManager;
        this.isBattleMode = false;
        this.userSide = 'w';
    }

    startBattle(side, engineFile) {
        this.isBattleMode = true;
        this.aiManager.setPlayEngine(engineFile);
        this.userSide = side === 'r' ? (Math.random() > 0.5 ? 'w' : 'b') : side;

        const orientation = (this.userSide === 'w') ? 'white' : 'black';
        this.board.orientation(orientation);
        this.game.reset();
        this.board.start();

        if (this.userSide === 'b') {
            setTimeout(() => this.makeAiMove(), 1000);
        }
    }

    makeAiMove() {
        if (!this.isBattleMode || this.game.game_over()) return;

        const fenBefore = this.game.fen();
        this.aiManager.getNextMove(fenBefore, (result) => {
            const move = this.game.move(result.bestmove, { sloppy: true });
            if (move) {
                this.board.position(this.game.fen());
                this.afterMove(this.game.fen(), move.san);
            }
        });
    }

    afterMove(fen, san) {
        this.noteManager.updateNote(fen, san);
        this.aiManager.analyze(fen, (res) => UI.updateEvalBar(res));
    }

    undo() {
        this.game.undo();
        const fen = this.game.fen();
        this.board.position(fen);
        this.aiManager.analyze(fen, (res) => UI.updateEvalBar(res));
        return fen;
    }
}