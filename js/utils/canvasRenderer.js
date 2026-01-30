// js/utils/canvasRenderer.js
export const CanvasRenderer = {
    clear(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    highlightSquare(ctx, x, y) {
        const squareSize = ctx.canvas.width / 8;
        const col = Math.floor(x / squareSize);
        const row = Math.floor(y / squareSize);

        // 캔버스 범위를 벗어난 클릭은 무시
        if (col < 0 || col > 7 || row < 0 || row > 7) return;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
    },

    drawArrow(ctx, fx, fy, tx, ty) {
        // 화살표가 캔버스 경계에 너무 붙지 않도록 약간의 여백을 줌
        const headlen = 30; // 촉 크기를 약간 조절
        const angle = Math.atan2(ty - fy, tx - fx);

        ctx.strokeStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.fillStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        const x1 = tx - headlen * Math.cos(angle - Math.PI / 7);
        const y1 = ty - headlen * Math.sin(angle - Math.PI / 7);
        const x2 = tx - headlen * Math.cos(angle + Math.PI / 7);
        const y2 = ty - headlen * Math.sin(angle + Math.PI / 7);

        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
    }
};