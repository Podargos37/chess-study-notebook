export function initEventListeners(handlers) {
    // 키보드 이벤트
    $(window).on('keydown', (e) => {
        if ($(e.target).is('textarea, input')) return;
        if (e.key === 'ArrowLeft') handlers.onUndo();
    });

    // 버튼 이벤트
    $('#undoBtn').on('click', handlers.onUndo);
    $('#flipBtn').on('click', handlers.onFlip);

    // 리사이즈 이벤트
    $(window).on('resize', handlers.onResize);
}