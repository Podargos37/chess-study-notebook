// js/api.js
import 'https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.umd.js';

export const PB_URL = 'https://115.68.192.54.nip.io';
export const pb = new PocketBase(PB_URL);
const COLLECTION_NAME = 'chess';

/**
 * 로그인한 사용자의 특정 FEN 노트를 가져옵니다.
 */
export async function loadDataByFen(fen) {
    if (!pb.authStore.isValid) return null; // 로그인 안 되어 있으면 중단

    try {
        const userId = pb.authStore.model.id;
        // 특정 FEN이면서 + 작성자가 나(userId)인 레코드 1개만 찾기
        const record = await pb.collection(COLLECTION_NAME).getFirstListItem(
            `fen="${fen}" && user="${userId}"`
        );
        return record;
    } catch (err) {
        // 데이터가 없는 경우(404)는 에러가 아니라 정상적인 상황임
        if (err.status !== 404) {
            console.error("데이터 로드 실패:", err);
        }
        return null;
    }
}

/**
 * 내 계정에 노트를 저장하거나 수정합니다.
 */
export async function saveToServer(fen, move, note) {
    if (!pb.authStore.isValid) return;

    try {
        const userId = pb.authStore.model.id;
        const existingRecord = await loadDataByFen(fen);

        // 필드명을 반드시 PocketBase 관리자 페이지의 이름과 똑같이 맞추세요.
        const data = {
            "fen": fen,
            "move": move || "", // undefined 방지
            "note": note || "", // undefined 방지
            "user": userId      // Relation 필드 (유저 ID)
        };

        if (existingRecord) {
            await pb.collection(COLLECTION_NAME).update(existingRecord.id, data);
            console.log("업데이트 완료!");
        } else {
            // 신규 생성 시 에러가 난다면 여기를 확인해야 합니다.
            await pb.collection(COLLECTION_NAME).create(data);
            console.log("신규 저장 완료!");
        }
    } catch (err) {
        // [중요] 에러의 진짜 이유를 콘솔에 상세히 찍습니다.
        console.error("서버 저장 실패 상세 데이터:", err.data);
        throw err;
    }
}
// --- 인증 관련 함수들 ---
export async function login(email, password) {
    try {
        // PocketBase는 이 한 줄로 DB 확인 + 로그인 처리를 동시에 합니다.
        const authData = await pb.collection('users').authWithPassword(email, password);
        console.log("로그인 성공:", authData);
        location.reload(); // 성공 시 페이지 새로고침
        return authData;
    } catch (err) {
        console.error("로그인 에러 상세:", err);
        alert("로그인 실패: " + err.message);
        throw err;
    }
}

export function logout() {
    pb.authStore.clear();
    location.reload();
}

export function getCurrentUser() {
    return pb.authStore.model;
}

export const pocketbase = pb; // 다른 곳에서 쓸 수 있게 내보냄