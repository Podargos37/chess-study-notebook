// js/modules/noteManager.js
// PocketBase 서버와 통신하여 체스 노트를 관리합니다.
import { loadDataByFen, saveToServer } from '../api.js';

export class NoteManager {
    constructor($noteArea, game) {
        this.$noteArea = $noteArea;
        this.game = game; // 현재 체스 게임 인스턴스
        this.saveTimer = null;
    }

    /**
     * 초기화 시 현재 판 상태의 노트를 서버에서 불러옵니다.
     */
    async init() {
        const currentFen = this.game.fen();
        const data = await loadDataByFen(currentFen);

        if (data) {
            this.$noteArea.val(data.note);
        } else {
            this.$noteArea.val("");
        }
    }

    /**
     * 수(Move)가 변경되었을 때 호출되어 해당 위치의 노트를 가져옵니다.
     * @param {string} fen - 현재 판 상태
     * @param {string} san - 둔 수 (예: "e4")
     */
    async updateNote(fen, san) {
        const data = await loadDataByFen(fen);

        if (data) {
            this.$noteArea.val(data.note);
        } else {
            this.$noteArea.val("");
            // 둔 수 정보를 포함해 서버에 빈 노트를 미리 생성할 수도 있습니다.
            // saveToServer(fen, san, "");
        }
    }

    /**
     * 사용자가 노트를 입력할 때 실시간으로 서버에 저장합니다. (디바운싱 적용)
     */
    saveCurrentNote(fen, text) {
        // 현재 화면의 move 정보를 가져오기 위한 로직이 필요할 수 있습니다.
        const history = this.game.history({ verbose: true });
        const lastMove = history.length > 0 ? history[history.length - 1].san : "";

        clearTimeout(this.saveTimer);
        // 1초 동안 입력이 없으면 서버에 저장합니다.
        this.saveTimer = setTimeout(() => {
            saveToServer(fen, lastMove, text);
        }, 1000);
    }
}