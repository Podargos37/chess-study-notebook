// js/api.js
export function loadData($noteArea) {
    return fetch('http://localhost:5000/api/load')
        .then(res => res.json())
        .then(data => {
            $noteArea.val(data['start']?.note || "");
            return data;
        })
        .catch(err => console.error("서버 연결 실패:", err));
}

export function saveToServer(moveTree) {
    fetch('http://localhost:5000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moveTree)
    });
}