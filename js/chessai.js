// js/chessai.js

export class ChessAI {
    constructor(engineType = 'stockfish') {
        this.engineType = engineType;
        this.worker = null;
        this.initEngine();
    }

    initEngine() {
        if (this.engineType === 'stockfish') {
            this.worker = new Worker('./js/stockfish.js');
        } else if (this.engineType === 'custom') {
            this.worker = new Worker('./js/my-own-ai.js');
        }

        this.worker.onmessage = (e) => this.handleMessage(e);
    }

    // 분석 요청 (인터페이스 통일)
    analyze(fen, callback) {
        this.onAnalysisComplete = callback;

        if (this.engineType === 'stockfish') {
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage('go depth 15');
        } else {
            // 커스텀 AI만의 통신 방식 구현
            this.worker.postMessage({ type: 'ANALYZE', fen: fen });
        }
    }

    handleMessage(event) {
        const line = event.data;

        // 어떤 엔진이든 결과값은 일정한 형식으로 가공해서 리턴
        if (this.engineType === 'stockfish') {
            if (line.includes('score cp')) {
                const cp = parseInt(line.match(/score cp (-?\d+)/)[1]);
                this.onAnalysisComplete({ score: cp / 100, type: 'cp' });
            }
        } else {
            // 커스텀 엔진의 결과 처리
            if (event.data.type === 'RESULT') {
                this.onAnalysisComplete({ score: event.data.value, type: 'cp' });
            }
        }
    }

    // 엔진 교체 기능
    switchEngine(newType) {
        if (this.worker) this.worker.terminate();
        this.engineType = newType;
        this.initEngine();
    }
}