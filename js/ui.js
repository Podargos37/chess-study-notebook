// js/ui.js
export const UI = {
    updateEvalBar(result) {
        const score = result.score;
        const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
        $('#eval-text').text(displayScore);

        let winPercent = 50 + (50 * (2 / (1 + Math.exp(-0.33 * score)) - 1));
        winPercent = Math.max(5, Math.min(95, winPercent));
        $('#eval-fill').css('height', `${winPercent}%`);
    },

    syncCanvasSize(board) {
        const canvas = document.getElementById('drawingCanvas');
        // 중요: #myBoard 전체가 아니라 내부의 실제 격자판(.board-b72b1)을 타겟팅합니다.
        const boardGrid = document.querySelector('#myBoard .board-b72b1');
        const boardWrapper = document.getElementById('boardWrapper');

        if (canvas && boardGrid && boardWrapper) {
            const gridRect = boardGrid.getBoundingClientRect();
            const wrapperRect = boardWrapper.getBoundingClientRect();

            // 1. 캔버스 크기를 격자판 크기와 1:1로 맞춤
            canvas.width = gridRect.width;
            canvas.height = gridRect.height;

            // 2. 캔버스 위치를 격자판 바로 위로 정렬 (오프셋 보정)
            canvas.style.top = (gridRect.top - wrapperRect.top) + "px";
            canvas.style.left = (gridRect.left - wrapperRect.left) + "px";

            if (board) board.resize();
        }
    }
};