// js/api.js

const PB_URL = 'http://115.68.192.54:8090'; // 내 서버 주소
const COLLECTION_NAME = 'chess'; // 생성한 컬렉션 이름

export async function loadDataByFen(fen) {
    try {
        // fen 필드가 일치하는 레코드 1개를 검색합니다.
        const filter = encodeURIComponent(`fen="${fen}"`);
        const response = await fetch(`${PB_URL}/api/collections/${COLLECTION_NAME}/records?filter=(${filter})`);
        const result = await response.json();

        // 검색 결과가 있으면 첫 번째 항목을, 없으면 빈 값을 반환합니다.
        if (result.items && result.items.length > 0) {
            return result.items[0];
        }
        return null;
    } catch (err) {
        console.error("데이터 로드 실패:", err);
        return null;
    }
}

/**
 * 데이터를 서버에 저장하거나 업데이트합니다.
 * @param {string} fen - 체스판 상태
 * @param {string} move - 둔 수
 * @param {string} note - 메모 내용
 */
export async function saveToServer(fen, move, note) {
    try {
        // 1. 이미 해당 FEN의 데이터가 있는지 먼저 확인합니다.
        const existingRecord = await loadDataByFen(fen);

        const data = { fen, move, note };

        if (existingRecord) {
            // 2-1. 데이터가 있으면 수정(Update - PATCH)합니다.
            await fetch(`${PB_URL}/api/collections/${COLLECTION_NAME}/records/${existingRecord.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("업데이트 완료!");
        } else {
            // 2-2. 데이터가 없으면 새로 생성(Create - POST)합니다.
            await fetch(`${PB_URL}/api/collections/${COLLECTION_NAME}/records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("신규 저장 완료!");
        }
    } catch (err) {
        console.error("서버 저장 실패:", err);
    }
}