var board = null;
var game = new Chess();
var moveTree = {};
var $noteArea = $('#noteArea');
var canvas = document.getElementById('drawingCanvas');
var ctx = canvas.getContext('2d');

// --- 1. 서버 동기화 로직 ---
fetch('http://localhost:5000/api/load')
    .then(res => res.json())
    .then(data => {
        moveTree = data;
        $noteArea.val(moveTree['start']?.note || "");
    })
    .catch(err => console.error("서버 연결 실패. server.py를 켰는지 확인하세요."));

function saveToServer() {
    fetch('http://localhost:5000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moveTree)
    });
}

// --- 2. Lichess 스타일 그리기 (화살표 & 칸 강조) ---
let isDrawing = false;
let startPos = null;

$('#boardWrapper').on('contextmenu', (e) => e.preventDefault());

$('#boardWrapper').on('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.button === 2) { // 우클릭 감지
        isDrawing = true;
        startPos = { x: x, y: y };
    } else if (e.button === 0) { // 좌클릭 시 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

$(window).on('mouseup', function(e) {
    if (isDrawing && e.button === 2) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dist = Math.hypot(x - startPos.x, y - startPos.y);

        if (dist > 20) {
            drawArrow(startPos.x, startPos.y, x, y); // 드래그면 화살표
        } else {
            highlightSquare(x, y); // 클릭이면 빨간색 강조
        }
        isDrawing = false;
    }
});

function highlightSquare(x, y) {
    const squareSize = 550 / 8;
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // 반투명 빨간색
    ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
}

function drawArrow(fx, fy, tx, ty) {
    const headlen = 36; // 화살촉의 길이
    const angle = Math.atan2(ty - fy, tx - fx);

    // Lichess 특유의 주황색과 선 굵기 세팅
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.85)';
    ctx.fillStyle = 'rgba(255, 170, 0, 0.85)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    // 1. 화살표 몸통 선 그리기
    // 선이 화살촉 밖으로 삐져나오지 않도록 끝점을 약간 뒤로 조절합니다.
    const lineEndX = tx - headlen * 0.5 * Math.cos(angle);
    const lineEndY = ty - headlen * 0.5 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();

    // 2. 오목한 V자형 화살촉 그리기
    // 날카로운 끝점(tx, ty)에서 시작하여 양옆 날개를 펼칩니다.
    ctx.beginPath();
    ctx.moveTo(tx, ty);

    // 왼쪽 날개 끝
    const x1 = tx - headlen * Math.cos(angle - Math.PI / 7);
    const y1 = ty - headlen * Math.sin(angle - Math.PI / 7);

    // 오른쪽 날개 끝
    const x2 = tx - headlen * Math.cos(angle + Math.PI / 7);
    const y2 = ty - headlen * Math.sin(angle + Math.PI / 7);

    // 화살촉 뒷부분의 안쪽 점 (V자로 파이게 만드는 핵심 포인트)
    const insideX = tx - (headlen * 0.6) * Math.cos(angle);
    const insideY = ty - (headlen * 0.6) * Math.sin(angle);

    ctx.lineTo(x1, y1);
    ctx.lineTo(insideX, insideY); // 안쪽으로 파고듬
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
}

// --- 3. 체스 보드 설정 (우클릭 드래그 방지 포함) ---
function onDragStart (source, piece, position, orientation) {
    // 우클릭 중에는 기물 드래그를 차단하여 화살표 그리에 집중
    if (window.event && (window.event.buttons === 2 || window.event.button === 2)) {
        return false;
    }
    if (game.game_over()) return false;
}

function onDrop(source, target) {
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    var fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { move: move.san, note: "" };
    $noteArea.val(moveTree[fen].note);
    saveToServer();
}

$noteArea.on('input', function() {
    var fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { note: "" };
    moveTree[fen].note = $(this).val();
    saveToServer();
});

board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

$('#flipBtn').on('click', board.flip);