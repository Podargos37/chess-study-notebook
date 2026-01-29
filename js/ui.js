export const UI = {
    updateEvalBar(result) {
        const score = result.score;
        const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
        $('#eval-text').text(displayScore);
        const winPercent = 50 + (50 * (2 / (1 + Math.exp(-0.4 * score)) - 1));
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