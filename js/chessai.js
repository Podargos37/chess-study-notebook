// js/chessai.js
import { ChessEvaluator } from './modules/chessEvaluator.js';
import { ChessEngine } from './modules/chessEngine.js';

export class ChessAI {
    constructor() {
        this.evaluator = new ChessEvaluator();
        this.engine = new ChessEngine();
    }

    setPlayEngine(engineFileName, onReady) {
        this.engine.setEngine(engineFileName);
        if (typeof onReady === 'function') this.engine.setOnReady(onReady);
    }

    analyze(fen, callback) {
        this.evaluator.analyze(fen, callback);
    }

    getNextMove(fen, callback) {
        this.engine.getNextMove(fen, callback);
    }
}