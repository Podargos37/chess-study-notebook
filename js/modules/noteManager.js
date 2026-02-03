// js/modules/noteManager.js
import { loadDataByFen, saveToServer } from '../api.js';

export class NoteManager {
    constructor($noteArea, game) {
        this.$noteArea = $noteArea;
        this.game = game;
        this.saveTimer = null;
    }

    /**
     * 특정 FEN의 데이터를 서버에서 가져와 텍스트 영역에 뿌려줍니다.
     * app.js의 onUndo 등에서 호출되므로 반드시 정의되어야 합니다.
     */
    async loadDataByFen(fen) {
        try {
            const data = await loadDataByFen(fen);
            if (data) {
                this.$noteArea.val(data.note);
            } else {
                this.$noteArea.val("");
            }
            return data;
        } catch (err) {
            console.error("NoteManager 로드 실패:", err);
            return null;
        }
    }

    async init() {
        const currentFen = this.game.fen();
        await this.loadDataByFen(currentFen);
    }

    async updateNote(fen, san) {
        // 수 이동 시에도 동일하게 데이터를 불러옵니다.
        await this.loadDataByFen(fen);
    }

    saveCurrentNote(fen, note) {
        if (this.saveTimer) clearTimeout(this.saveTimer);

        this.saveTimer = setTimeout(async () => {
            await saveToServer(fen, "", note);
        }, 500); // 0.5초 디바운싱 저장
    }
}