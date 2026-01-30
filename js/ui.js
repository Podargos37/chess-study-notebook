// js/ui.js
export const UI = {
    updateEvalBar(result) {
        const score = result.score;

        // 1. 표시용 텍스트 설정 (예: +1.2 또는 -0.5)
        const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
        $('#eval-text').text(displayScore);

        // 2. 승률(Win Probability) 계산
        // 시그모이드 함수를 사용하여 centipawn 점수를 0~100% 사이로 변환합니다.
        // 계수 -0.33은 폰 1개 유리(+1.0)일 때 약 58% 정도를 나타내는 대중적인 수치입니다.
        let winPercent = 50 + (50 * (2 / (1 + Math.exp(-0.33 * score)) - 1));

        // 3. 시각적 보정 (Clamp)
        // 승률이 0%나 100%에 도달해 그래프 바가 아예 사라지거나 꽉 차는 것을 방지하기 위해
        // 최소 5%, 최대 95%로 범위를 제한합니다.
        winPercent = Math.max(5, Math.min(95, winPercent));

        // 4. UI 반영
        // 백이 유리할수록(score가 높을수록) winPercent가 커지며,
        // CSS에서 bottom: 0인 #eval-fill의 높이가 높아져 흰색 영역이 위로 차오릅니다.
        $('#eval-fill').css('height', `${winPercent}%`);
    },

    syncCanvasSize(board) {
        const boardEl = document.getElementById('myBoard');
        const canvas = document.getElementById('drawingCanvas');
        if (boardEl && canvas) {
            canvas.width = boardEl.clientWidth;
            canvas.height = boardEl.clientHeight;
            canvas.style.top = boardEl.offsetTop + "px";
            canvas.style.left = boardEl.offsetLeft + "px";
            if(board) board.resize();
        }
    }
};