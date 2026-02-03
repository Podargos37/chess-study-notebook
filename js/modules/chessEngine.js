// js/modules/chessEngine.js
// 대결 기능만 전담
export class ChessEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.onPlayCallback = null;
    }

    setEngine(engineFileName) {
        if (this.worker) this.worker.terminate();
        this.isReady = false;

        // 경로를 상대 경로로 바꿔보세요 (현재 HTML 위치 기준)
        const enginePath = `./js/aiengines/${engineFileName}`;
        this.worker = new Worker(enginePath);
        this.init();
    }

    init() {
        this.worker.postMessage('uci');
        this.worker.onmessage = (e) => {
            const line = e.data;
            if (line === 'uciok') this.worker.postMessage('isready');
            if (line === 'readyok') this.isReady = true;
            if (line.includes('bestmove')) {
                const move = line.split(' ')[1];
                if (this.onPlayCallback) this.onPlayCallback({ bestmove: move });
            }
        };
    }

    getNextMove(fen, callback) {
        if (!this.worker || !this.isReady) return;
        this.onPlayCallback = callback;
        this.worker.postMessage('stop');
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage('go depth 15');
    }
}