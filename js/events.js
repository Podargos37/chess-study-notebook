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

    // 1. AI 대결 버튼 클릭
    $('#aiBattleBtn').on('click', function(e) {
        e.stopPropagation();
        $('#sidePopup').toggleClass('hidden');
        console.log("AI Battle 버튼 클릭됨, 팝업 상태:", !$('#sidePopup').hasClass('hidden'));
    });

    // 2. 팝업 내부 클릭 시 닫히지 않게 보호
    $('#sidePopup').on('click', function(e) {
        e.stopPropagation();
    });

    // 3. 진영 선택 버튼 클릭
    $('.side-select-btn').on('click', function() {
        const side = $(this).data('side');
        const selectedEngine = $('#engineSelect').val(); // 선택된 엔진 파일명 (예: lozza.js)

        // 엔진 파일명을 함께 전달
        handlers.onStartBattle(side, selectedEngine);

        $('#sidePopup').addClass('hidden');
    });

    // 4. 배경 클릭 시 팝업 닫기
    $(document).on('click', function() {
        $('#sidePopup').addClass('hidden');
    });
}