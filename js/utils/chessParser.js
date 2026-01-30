// js/utils/chessParser.js
export const ChessParser = {
    /**
     * 엔진의 출력 라인에서 점수를 추출하여 '백의 관점'으로 변환합니다.
     */
    parse(line, currentTurn) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);

        let score = 0;

        // 1. 점수 유형 판별 및 수치화
        if (cpMatch) {
            score = parseInt(cpMatch[1]) / 100;
        } else if (mateMatch) {
            const mateIn = parseInt(mateMatch[1]);
            score = mateIn > 0 ? 99 : -99;
        }

        // 2. 현재 차례에 따른 관점 정규화 (항상 백 기준으로 통일)
        return currentTurn === 'b' ? -score : score;
    }
};