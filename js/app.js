// js/app.js
import { initGraphics } from './graphics.js';
import { ChessAI } from './chessai.js';
import { UI } from './ui.js';
import { initEventListeners } from './events.js';
import { NoteManager } from './modules/noteManager.js';
import { GameManager } from './modules/gameManager.js';
import { login, logout, getCurrentUser, pb } from './api.js';

const game = new Chess();
const $noteArea = $('#noteArea');
const aiManager = new ChessAI();
const noteManager = new NoteManager($noteArea, game);
let board = null;
let gameManager = null;
let isSignupMode = false;

$(document).ready(function() {
    const user = getCurrentUser();

    // UI 요소들
    const $loginBtn = $('#loginBtn');
    const $logoutBtn = $('#logoutBtn');
    const $userDisplay = $('#userDisplay');
    const $loginModal = $('#loginModal');

    // 1. 상태에 따른 버튼 표시
    if (user) {
        $loginBtn.hide();
        $logoutBtn.show();
        $userDisplay.text(`${user.email}님`).show();
    } else {
        $loginBtn.show();
        $logoutBtn.hide();
        $userDisplay.hide();
    }

    // 2. 로그인 모달 열기 (클릭 이벤트 강제 확인)
    $(document).on('click', '#loginBtn', function(e) {
        console.log("로그인 버튼 눌림!"); // 콘솔에 이게 뜨는지 확인하세요!
        $loginModal.removeClass('hidden').css('display', 'flex');
    });

    // 3. 모달 닫기
    $(document).on('click', '#closeModal', function() {
        $loginModal.addClass('hidden').hide();
    });

    // 4. 로그인 수행
    $(document).on('click', '#doLogin', async function() {
        const email = $('#emailInput').val();
        const pass = $('#passInput').val();

        if(!email || !pass) return alert("입력창을 채워주세요.");

        $(this).text("로그인 중...").prop('disabled', true);
        try {
            await login(email, pass);
        } catch(e) {
            $(this).text("로그인하기").prop('disabled', false);
        }
    });

    // 5. 로그아웃
    $logoutBtn.on('click', logout);
});

// 1. 로그인/회원가입 모드 전환 (텍스트 클릭 시)
$(document).on('click', '#toggleAuthMode', function() {
    isSignupMode = !isSignupMode;

    if (isSignupMode) {
        $('#modalTitle').text("SIGN UP");
        $('#doLogin').hide();      // 로그인 버튼 숨김
        $('#doSignup').show();     // 가입 버튼 보임
        $(this).text("이미 계정이 있나요? 로그인");
    } else {
        $('#modalTitle').text("LOGIN");
        $('#doLogin').show();      // 로그인 버튼 보임
        $('#doSignup').hide();     // 가입 버튼 숨김
        $(this).text("계정이 없으신가요? 회원가입");
    }
});

// 2. 실제 회원가입 버튼 클릭 시
$(document).on('click', '#doSignup', async function() {
    const email = $('#emailInput').val();
    const pass = $('#passInput').val();

    if (!email || !pass) return alert("이메일과 비밀번호를 입력해주세요.");

    try {
        // PocketBase 회원가입 API 호출
        const data = {
            "email": email,
            "password": pass,
            "passwordConfirm": pass, // 비번 확인용
            "emailVisibility": true
        };

        // api.js의 pb 객체를 직접 쓰거나 api.js에 signup 함수를 만들어 호출
        await pb.collection('users').create(data);

        alert("회원가입 성공! 가입하신 정보로 로그인해주세요.");
        // 가입 성공 후 다시 로그인 모드로 전환
        $('#toggleAuthMode').click();
    } catch (err) {
        console.error("가입 에러:", err);
        alert("가입 실패: " + err.message);
    }
});

// --- 기존 게임 초기화 로직 ---
noteManager.init().then(() => {
    gameManager = new GameManager(game, board, aiManager, noteManager);
    // 초기 포지션(시작 국면) 승률 바 갱신
    aiManager.analyze(game.fen(), (result) => UI.updateEvalBar(result));
});

const handlers = {
    onUndo: () => {
        const fen = gameManager.undo();
        // noteManager가 비동기로 가져오므로 await 처리가 필요할 수 있음
        noteManager.loadDataByFen(fen).then(data => {
            $noteArea.val(data ? data.note : "");
        });
        UI.syncCanvasSize(board);
        aiManager.analyze(fen, (result) => UI.updateEvalBar(result));
    },
    onFlip: () => { board.flip(); UI.syncCanvasSize(board); },
    onStartBattle: (side, file) => gameManager.startBattle(side, file)
};

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    gameManager.afterMove(game.fen(), move.san);
    if (gameManager.isBattleMode && !game.game_over()) {
        setTimeout(() => gameManager.makeAiMove(), 600);
    }
}

board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDragStart: (source, piece, position, orientation) => {
        if (window.event && (window.event.buttons === 2 || window.event.button === 2)) {
            return false;
        }
        if (game.game_over()) return false;
    },
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

const drawingCanvas = document.getElementById('drawingCanvas');
if (drawingCanvas) {
    const ctx = drawingCanvas.getContext('2d');
    initGraphics(drawingCanvas, ctx, game, null, $noteArea, null, 'boardWrapper');
}
initEventListeners(handlers);
UI.syncCanvasSize(board);

window.addEventListener('resize', () => UI.syncCanvasSize(board));

// 우클릭 방지 (그리기 기능을 위해)
document.getElementById('myBoard').addEventListener('contextmenu', (e) => e.preventDefault());

$noteArea.on('input', function() {
    noteManager.saveCurrentNote(game.fen(), $(this).val());
});