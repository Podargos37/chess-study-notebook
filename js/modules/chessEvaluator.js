// js/modules/chessEvaluator.js
// 체스 점수 계산만 전담
import { ChessParser } from '../utils/chessParser.js';

export class ChessEvaluator {
    constructor() {
        this.worker = new Worker('./js/stockfish.js');
        this.currentTurn = 'w';
        this.onEvalCallback = null;
        this.init();
    }

    init() {
        this.worker.postMessage('uci');
        this.worker.onmessage = (e) => {
            const line = e.data;
            if (line.includes('score cp') || line.includes('score mate')) {
                const score = ChessParser.parse(line, this.currentTurn);
                if (this.onEvalCallback) this.onEvalCallback({ score });
            }
        };
    }

    analyze(fen, callback) {
        this.onEvalCallback = callback;
        this.currentTurn = fen.split(' ')[1];
        this.worker.postMessage('stop');
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage('go depth 12');
    }
}