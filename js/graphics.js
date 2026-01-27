export function initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, boardWrapperId) {
    let isDrawing = false;
    let startPos = null;
    const $boardWrapper = $(`#${boardWrapperId}`);

    $boardWrapper.on('contextmenu', (e) => e.preventDefault());

    $boardWrapper.on('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (e.button === 2) { 
            isDrawing = true;
            startPos = { x: x, y: y };
        } else if (e.button === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    $(window).on('mouseup', function(e) {
        if (isDrawing && e.button === 2) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dist = Math.hypot(x - startPos.x, y - startPos.y);

            if (dist > 20) drawArrow(ctx, startPos.x, startPos.y, x, y);
            else highlightSquare(ctx, x, y);
            isDrawing = false;
        }
    });
}

function highlightSquare(ctx, x, y) {
    const squareSize = ctx.canvas.width / 8;

    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
}

function drawArrow(ctx, fx, fy, tx, ty) {
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