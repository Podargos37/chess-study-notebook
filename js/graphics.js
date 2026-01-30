// js/graphics.js
import { CanvasRenderer } from './utils/canvasRenderer.js';

export function initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, boardWrapperId) {
    let isDrawing = false;
    let startPos = null;
    const $boardWrapper = $(`#${boardWrapperId}`);

    // 우클릭 메뉴 방지
    $boardWrapper.on('contextmenu', (e) => e.preventDefault());

    $boardWrapper.on('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (e.button === 2) { // 우클릭: 그리기 시작
            isDrawing = true;
            startPos = { x: x, y: y };
        } else if (e.button === 0) { // 좌클릭: 캔버스 지우기
            CanvasRenderer.clear(ctx);
        }
    });

    $(window).on('mouseup', function(e) {
        if (isDrawing && e.button === 2) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dist = Math.hypot(x - startPos.x, y - startPos.y);

            // 거리 기준에 따라 화살표 또는 하이라이트 결정
            if (dist > 20) {
                CanvasRenderer.drawArrow(ctx, startPos.x, startPos.y, x, y);
            } else {
                CanvasRenderer.highlightSquare(ctx, x, y);
            }
            isDrawing = false;
        }
    });
}