// js/modules/noteManager.js
// 노트 데이터와 서버 통신을 전담
import { loadData, saveToServer } from '../api.js';

export class NoteManager {
    constructor($noteArea) {
        this.$noteArea = $noteArea;
        this.moveTree = {};
        this.saveTimer = null;
    }

    async init() {
        this.moveTree = await loadData(this.$noteArea);
    }

    updateNote(fen, san) {
        if (!this.moveTree[fen]) {
            this.moveTree[fen] = { move: san, note: "" };
        }
        this.$noteArea.val(this.moveTree[fen].note);
        saveToServer(this.moveTree);
    }

    saveCurrentNote(fen, text) {
        if (!this.moveTree[fen]) this.moveTree[fen] = { move: "", note: "" };
        this.moveTree[fen].note = text;

        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => saveToServer(this.moveTree), 1000);
    }

    getNote(fen) {
        return this.moveTree[fen]?.note || "";
    }
}