// js/graphics.js
import { CanvasRenderer } from './utils/canvasRenderer.js';

export function initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, boardWrapperId) {
    let isDrawing = false;
    let startPos = null;
    const $wrapper = $(`#${boardWrapperId}`);

    // 우클릭 메뉴 차단
    $wrapper.on('contextmenu', (e) => e.preventDefault());

    $wrapper.on('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 캔버스 영역 안에서만 작동하도록 제한
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

        if (e.button === 2) { // 우클릭: 그리기 시작
            isDrawing = true;
            startPos = { x, y };
            e.stopPropagation();
        } else if (e.button === 0) { // 좌클릭: 지우기
            CanvasRenderer.clear(ctx);
        }
    });

    $(window).on('mouseup', function(e) {
        if (isDrawing && e.button === 2) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dist = Math.hypot(x - startPos.x, y - startPos.y);

            if (dist > 20) {
                CanvasRenderer.drawArrow(ctx, startPos.x, startPos.y, x, y);
            } else {
                CanvasRenderer.highlightSquare(ctx, startPos.x, startPos.y);
            }
            isDrawing = false;
        }
    });
}