// js/utils/canvasRenderer.js
// 캔버스 위에 도형과 화살표를 그리는 기능 모음
export const CanvasRenderer = {
    // 캔버스 초기화
    clear(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    // 칸 하이라이트 (빨간색 사각형)
    highlightSquare(ctx, x, y) {
        const squareSize = ctx.canvas.width / 8;
        const col = Math.floor(x / squareSize);
        const row = Math.floor(y / squareSize);

        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
    },

    // 화살표 그리기
    drawArrow(ctx, fx, fy, tx, ty) {
        const headlen = 36;
        const angle = Math.atan2(ty - fy, tx - fx);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.fillStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        const lineEndX = tx - headlen * 0.5 * Math.cos(angle);
        const lineEndY = ty - headlen * 0.5 * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        const x1 = tx - headlen * Math.cos(angle - Math.PI / 7);
        const y1 = ty - headlen * Math.sin(angle - Math.PI / 7);
        const x2 = tx - headlen * Math.cos(angle + Math.PI / 7);
        const y2 = ty - headlen * Math.sin(angle + Math.PI / 7);
        const insideX = tx - (headlen * 0.6) * Math.cos(angle);
        const insideY = ty - (headlen * 0.6) * Math.sin(angle);

        ctx.lineTo(x1, y1);
        ctx.lineTo(insideX, insideY);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
    }
};