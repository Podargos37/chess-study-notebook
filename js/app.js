import { loadData, saveToServer } from './api.js';
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';
import { UI } from './ui.js';              // UI 모듈 임포트
import { initEventListeners } from './events.js'; // 이벤트 모듈 임포트


// --- 변수 설정 ---
let board = null;
const game = new Chess();
let moveTree = {};
const $noteArea = $('#noteArea');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let saveTimer = null;
const aiManager = new ChessAI('stockfish');
let isBattleMode = false;
let userSide = 'w';

// --- 초기화 로직 ---
loadData($noteArea).then(data => { moveTree = data; });

initGraphics(canvas, ctx, game, moveTree, $noteArea, saveToServer, 'boardWrapper');

// --- 핵심 핸들러 정의 (이벤트 모듈에 전달용) ---
const handlers = {
    onUndo: handleUndo,
    onFlip: () => {
        board.flip();
        UI.syncCanvasSize(board);
    },
    onResize: () => {
        board.resize();
        UI.syncCanvasSize(board);
    },
    onStartBattle: (side, engineFile) => {
        isBattleMode = true; // 대결 모드 활성화
        aiManager.setPlayEngine(engineFile);
        // 1. 진영 결정 (랜덤 처리)
        if (side === 'r') {
            userSide = Math.random() > 0.5 ? 'w' : 'b';
        } else {
            userSide = side; // 'w' 또는 'b'
        }

        // 2. 보드 방향 설정
        // 유저가 백이면 white, 흑이면 black이 아래로 오게 설정합니다.
        const orientation = (userSide === 'w') ? 'white' : 'black';
        board.orientation(orientation);

        // 3. 게임 초기화
        game.reset();
        board.start(); // 기물들을 시작 위치로

        // 4. 초기 UI 업데이트
        UI.syncCanvasSize(board);
        $('#noteArea').val("AI와의 대결이 시작되었습니다!");

        // 5. 유저가 흑('b')이라면 AI(백)가 첫 수를 둬야 합니다.
        if (userSide === 'b') {
            console.log("유저가 흑을 선택했습니다. AI(백)가 첫 수를 시작합니다.");
            // 엔진이 로드될 시간을 주어야 하므로 약간의 지연 후 실행합니다.
            setTimeout(() => {
                makeAiMove();
            }, 1000);
        }
    }
};

function updateNoteForPosition(fen, san) {
    // 이미 해당 FEN에 노트가 있다면 불러오고, 없다면 새로 생성
    if (!moveTree[fen]) {
        moveTree[fen] = { move: san, note: "" };
    }

    // UI(텍스트 영역)에 반영
    $noteArea.val(moveTree[fen].note);

    // 서버(storage.json)에 저장
    saveToServer(moveTree);
}

function makeAiMove() {
    if (!isBattleMode || game.game_over()) return;

    const fenBefore = game.fen();
    aiManager.getNextMove(fenBefore, (result) => {
        const move = game.move(result.bestmove, { sloppy: true });
        if (move) {
            board.position(game.fen());
            const fenAfter = game.fen();
            updateNoteForPosition(fenAfter, move.san);

            // 여기서도 분석 콜백 안에 다음 로직을 넣지 않습니다.
            aiManager.analyze(fenAfter, (res) => UI.updateEvalBar(res));
        }
    });
}

// 외부 모듈에서 정의한 이벤트 리스너 등록
initEventListeners(handlers);

// --- 게임 로직 ---
function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    const fen = game.fen();
    updateNoteForPosition(fen, move.san);

    // [수정] 분석은 결과가 올 때마다 UI만 업데이트합니다.
    aiManager.analyze(fen, (result) => {
        UI.updateEvalBar(result);
    });

    // [수정] AI 이동은 콜백 밖에서 '딱 한 번만' 호출합니다.
    if (isBattleMode && !game.game_over()) {
        setTimeout(makeAiMove, 600);
    }
}

function handleUndo() {
    game.undo();
    board.position(game.fen());

    const fen = game.fen();
    $noteArea.val(moveTree[fen]?.note || "");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    aiManager.analyze(fen, (result) => {
        UI.updateEvalBar(result);
    });

    UI.syncCanvasSize(board);
}

// --- 보드 및 캔버스 설정 ---
board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDragStart: (source, piece) => {
        if (window.event && (window.event.buttons === 2 || window.event.button === 2)) return false;
    },
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

// 초기 실행 및 리사이즈 대응
$(document).ready(() => {
    setTimeout(() => UI.syncCanvasSize(board), 500);
});

// 노트 영역 자동 저장 (디바운싱)
$noteArea.on('input', function() {
    const fen = game.fen();
    if (!moveTree[fen]) moveTree[fen] = { move: "", note: "" };
    moveTree[fen].note = $(this).val();

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToServer(moveTree), 1000);
});