// js/modules/gameManager.js
// 게임의 규칙, 보드 상태, ai 대결을 전담
import { UI } from '../ui.js';

export class GameManager {
  constructor(game, board, aiManager, noteManager) {
    this.game = game;
    this.board = board;
    this.aiManager = aiManager;
    this.noteManager = noteManager;
    this.isBattleMode = false;
    this.userSide = 'w';
  }

  startBattle(side, engineFile) {
    this.isBattleMode = true;

    // 유저 진영 설정 (랜덤 포함)
    this.userSide = side === 'r' ? (Math.random() > 0.5 ? 'w' : 'b') : side;

    const orientation = (this.userSide === 'w') ? 'white' : 'black';
    this.board.orientation(orientation);

    // 핵심 수정: 게임 상태를 먼저 리셋하고 보드 위치를 강제로 동기화
    this.game.reset();
    this.board.position('start', false); // 에니메이션 없이 즉시 배치

    console.log(`Battle Start: User is ${this.userSide}`);

    // 흑 선택 시 엔진 준비된 뒤 AI가 백으로 첫 수 두도록 콜백 등록 후 엔진 로드
    const onEngineReady = () => {
      if (this.userSide === 'b') {
        console.log("AI is making the first move as White...");
        this.makeAiMove();
      }
    };
    this.aiManager.setPlayEngine(engineFile, onEngineReady);

    // 초기 국면 승률 바 갱신
    this.aiManager.analyze(this.game.fen(), (result) => UI.updateEvalBar(result));
  }

  makeAiMove() {
    if (!this.isBattleMode || this.game.game_over()) return;

    const fenBefore = this.game.fen();
    this.aiManager.getNextMove(fenBefore, (result) => {
      // AI가 준 bestmove가 유효한지 체크하며 이동
      const move = this.game.move(result.bestmove, { sloppy: true });
      if (move) {
        this.board.position(this.game.fen());
        this.afterMove(this.game.fen(), move.san);
      }
    });
  }

  afterMove(fen, san) {
    // 수 둔 후 노트 업데이트 및 승률 바만 갱신 (보드/캔버스 리사이즈는 하지 않음 → 잔상/버벅임 방지)
    this.noteManager.updateNote(fen, san);
    // 승률 바 갱신 (평가 엔진으로 현재 국면 점수 계산)
    this.aiManager.analyze(fen, (result) => UI.updateEvalBar(result));
  }

  undo() {
    this.game.undo();
    if (this.isBattleMode) this.game.undo(); // 배틀 모드면 AI 수까지 두 번 취소

    const currentFen = this.game.fen();
    this.board.position(currentFen);
    return currentFen;
  }
}