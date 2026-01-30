// js/chessai.js
import { ChessParser } from './utils/chessParser.js'; // 분리한 파서 임포트

export class ChessAI {
    constructor() {
        // 1. 분석용 Stockfish
        this.evalWorker = new Worker('./js/stockfish.js');

        // 2. 대결용 엔진
        this.playWorker = null;
        this.isPlayReady = false;

        // 현재 차례 정보 (파서에서 관점 변환을 위해 사용)
        this.currentTurn = 'w';

        this.initEvalWorker();
    }

    // 대결용 엔진 교체
    setPlayEngine(engineFileName) {
        if (this.playWorker) this.playWorker.terminate();
        this.isPlayReady = false;

        const enginePath = `${window.location.origin}/js/aiengines/${engineFileName}`;
        this.playWorker = new Worker(enginePath);

        this.initPlayWorker();
    }

    initEvalWorker() {
        this.evalWorker.postMessage('uci');
        this.evalWorker.onmessage = (e) => {
            const line = e.data;

            // 데이터 가공 로직을 ChessParser에게 전적으로 맡깁니다.
            if (line.includes('score cp') || line.includes('score mate')) {
                const score = ChessParser.parse(line, this.currentTurn);
                if (this.onEvalCallback) this.onEvalCallback({ score });
            }
        };
    }

    initPlayWorker() {
        this.playWorker.postMessage('uci');
        this.playWorker.onmessage = (e) => {
            const line = e.data;
            if (line === 'uciok') {
                this.playWorker.postMessage('isready');
            }
            if (line === 'readyok') {
                this.isPlayReady = true;
            }
            if (line.includes('bestmove')) {
                const move = line.split(' ')[1];
                if (this.onPlayCallback) this.onPlayCallback({ bestmove: move });
            }
        };
    }

    // [분석] 호출 시 현재 차례 업데이트
    analyze(fen, callback) {
        this.onEvalCallback = callback;

        // FEN에서 현재 차례 파싱 ('w' 또는 'b')
        this.currentTurn = fen.split(' ')[1];

        this.evalWorker.postMessage('stop');
        this.evalWorker.postMessage(`position fen ${fen}`);
        this.evalWorker.postMessage('go depth 12');
    }

    // [대전] 호출
    getNextMove(fen, callback) {
        if (!this.playWorker || !this.isPlayReady) return;
        this.onPlayCallback = callback;

        this.playWorker.postMessage('stop');
        this.playWorker.postMessage(`position fen ${fen}`);
        this.playWorker.postMessage('go depth 15');
    }
}