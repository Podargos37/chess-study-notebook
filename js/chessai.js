// js/chessai.js
export class ChessAI {
    constructor() {
        // 1. 분석용 Stockfish: 현재 위치 고정
        this.evalWorker = new Worker('./js/stockfish.js');

        // 2. 대결용 엔진: aiengines 폴더 내부
        this.playWorker = null;
        this.isPlayReady = false;

        // 추가: 점수 계산 시 관점(Perspective)을 고정하기 위한 변수
        this.currentTurn = 'w';

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
            // score cp 또는 score mate가 포함된 행만 처리
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

        // FEN 문자열에서 현재 차례('w' 또는 'b')를 추출합니다.
        // 예: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" -> 'w'
        const parts = fen.split(' ');
        this.currentTurn = parts[1];

        this.evalWorker.postMessage('stop');
        this.evalWorker.postMessage(`position fen ${fen}`);
        this.evalWorker.postMessage('go depth 12');
    }

    // [대전] 선택된 엔진 전용 호출
    getNextMove(fen, callback) {
        if (!this.playWorker || !this.isPlayReady) return;

        this.onPlayCallback = callback;

        this.playWorker.postMessage('stop');
        this.playWorker.postMessage(`position fen ${fen}`);
        this.playWorker.postMessage('go depth 15');
    }

    parseScore(line) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);

        let score = 0;

        if (cpMatch) {
            // centipawn 점수를 pawn 단위로 변환
            score = parseInt(cpMatch[1]) / 100;
        } else if (mateMatch) {
            // 외통수 상황: 백 승리 방향이면 큰 양수, 흑 승리 방향이면 큰 음수
            const mateIn = parseInt(mateMatch[1]);
            score = mateIn > 0 ? 99 : -99;
        }

        /**
         * 핵심 로직: 관점 변환
         * 엔진은 '현재 차례인 쪽'이 유리하면 양수를 보냅니다.
         * 따라서 흑의 차례('b')일 때 양수가 나오면 백에게는 불리한 것이므로 부호를 반전시킵니다.
         */
        if (this.currentTurn === 'b') {
            return -score;
        }
        return score;
    }
}