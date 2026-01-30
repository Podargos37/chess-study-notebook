// js/chessai.js
import { ChessEvaluator } from './modules/chessEvaluator.js';
import { ChessEngine } from './modules/chessEngine.js';

export class ChessAI {
    constructor() {
        this.evaluator = new ChessEvaluator();
        this.engine = new ChessEngine();
    }

    setPlayEngine(engineFileName) {
        this.engine.setEngine(engineFileName);
    }

    analyze(fen, callback) {
        this.evaluator.analyze(fen, callback);
    }

    getNextMove(fen, callback) {
        this.engine.getNextMove(fen, callback);
    }
}