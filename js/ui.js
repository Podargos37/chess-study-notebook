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
        const boardGrid = document.querySelector('#myBoard .board-b72b1');
        const boardWrapper = document.getElementById('boardWrapper');

        if (!canvas || !boardGrid || !boardWrapper) return;

        const gridRect = boardGrid.getBoundingClientRect();
        const wrapperRect = boardWrapper.getBoundingClientRect();
        const bufferW = Math.round(gridRect.width);
        const bufferH = Math.round(gridRect.height);

        // 크기/위치가 실제로 바뀐 경우에만 갱신 (매 수마다 리사이즈·캔버스 초기화 방지 → 잔상/버벅임 방지)
        const sizeChanged = canvas.width !== bufferW || canvas.height !== bufferH;
        if (sizeChanged) {
            canvas.width = bufferW;
            canvas.height = bufferH;
            if (board) board.resize();
        }

        canvas.style.width = gridRect.width + 'px';
        canvas.style.height = gridRect.height + 'px';
        canvas.style.top = (gridRect.top - wrapperRect.top) + "px";
        canvas.style.left = (gridRect.left - wrapperRect.left) + "px";
    }
};