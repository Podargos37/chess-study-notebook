// js/chessai.js
export class ChessAI {
    constructor() {
        // 1. 분석용 Stockfish: 현재 위치 고정
        this.evalWorker = new Worker('./js/stockfish.js');

        // 2. 대결용 엔진: aiengines 폴더 내부
        this.playWorker = null;
        this.isPlayReady = false;
        this.initEvalWorker();
    }

    // 대결용 엔진 교체
    setPlayEngine(engineFileName) {
        if (this.playWorker) this.playWorker.terminate();
        this.isPlayReady = false;

        // 절대 경로로 워커 생성
        const enginePath = `${window.location.origin}/js/aiengines/${engineFileName}`;
        this.playWorker = new Worker(enginePath);

        this.initPlayWorker();
    }

    initEvalWorker() {
        this.evalWorker.postMessage('uci');
        this.evalWorker.onmessage = (e) => {
            const line = e.data;
            if (line.includes('score cp') || line.includes('score mate')) {
                const score = this.parseScore(line);
                if (this.onEvalCallback) this.onEvalCallback({ score });
            }
        };
    }

    initPlayWorker() {
        this.playWorker.postMessage('uci');

        this.playWorker.onmessage = (e) => {
            const line = e.data;
            console.log("AI 엔진 출력:", line); // 디버깅용

            if (line === 'uciok') {
                this.playWorker.postMessage('isready');
            }
            if (line === 'readyok') {
                this.isPlayReady = true;
                console.log("대전 엔진이 완전히 준비되었습니다.");
            }
            if (line.includes('bestmove')) {
                const move = line.split(' ')[1];
                if (this.onPlayCallback) this.onPlayCallback({ bestmove: move });
            }
        };
    }

    // [분석] Stockfish 전용 호출
    analyze(fen, callback) {
        this.onEvalCallback = callback;
        this.evalWorker.postMessage('stop');
        this.evalWorker.postMessage(`position fen ${fen}`);
        this.evalWorker.postMessage('go depth 12');
    }

    // [대전] 선택된 엔진 전용 호출
    getNextMove(fen, callback) {
        if (!this.playWorker || !this.isPlayReady) return;

        // 이전 콜백을 덮어써서 중복 실행을 방지합니다.
        this.onPlayCallback = callback;

        // 엔진 초기화보다는 현재 포지션 설정과 계산 시작만 보냅니다.
        this.playWorker.postMessage('stop');
        this.playWorker.postMessage(`position fen ${fen}`);
        this.playWorker.postMessage('go depth 15');
    }

    parseScore(line) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        if (cpMatch) return parseInt(cpMatch[1]) / 100;
        return 0;
    }
}