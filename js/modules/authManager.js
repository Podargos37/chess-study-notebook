// js/modules/authManager.js
import { login, logout, getCurrentUser, pb } from '../api.js';

let isSignupMode = false;

/**
 * 로그인/회원가입 UI 및 이벤트 초기화
 */
export function initAuth() {
    $(document).ready(function () {
        const user = getCurrentUser();

        const $loginBtn = $('#loginBtn');
        const $logoutBtn = $('#logoutBtn');
        const $userDisplay = $('#userDisplay');
        const $loginModal = $('#loginModal');

        if (user) {
            $loginBtn.hide();
            $logoutBtn.show();
            $userDisplay.text(`${user.email}님`).show();
        } else {
            $loginBtn.show();
            $logoutBtn.hide();
            $userDisplay.hide();
        }

        $(document).on('click', '#loginBtn', function () {
            $loginModal.removeClass('hidden').css('display', 'flex');
        });

        $(document).on('click', '#closeModal', function () {
            $loginModal.addClass('hidden').hide();
        });

        $(document).on('click', '#doLogin', async function () {
            const email = $('#emailInput').val();
            const pass = $('#passInput').val();

            if (!email || !pass) return alert('입력창을 채워주세요.');

            $(this).text('로그인 중...').prop('disabled', true);
            try {
                await login(email, pass);
            } catch (e) {
                $(this).text('로그인하기').prop('disabled', false);
            }
        });

        $logoutBtn.on('click', logout);
    });

    $(document).on('click', '#toggleAuthMode', function () {
        isSignupMode = !isSignupMode;

        if (isSignupMode) {
            $('#modalTitle').text('SIGN UP');
            $('#doLogin').hide();
            $('#doSignup').show();
            $(this).text('이미 계정이 있나요? 로그인');
        } else {
            $('#modalTitle').text('LOGIN');
            $('#doLogin').show();
            $('#doSignup').hide();
            $(this).text('계정이 없으신가요? 회원가입');
        }
    });

    $(document).on('click', '#doSignup', async function () {
        const email = $('#emailInput').val();
        const pass = $('#passInput').val();

        if (!email || !pass) return alert('이메일과 비밀번호를 입력해주세요.');

        try {
            const data = {
                email: email,
                password: pass,
                passwordConfirm: pass,
                emailVisibility: true
            };

            await pb.collection('users').create(data);

            alert('회원가입 성공! 가입하신 정보로 로그인해주세요.');
            $('#toggleAuthMode').click();
        } catch (err) {
            console.error('가입 에러:', err);
            alert('가입 실패: ' + err.message);
        }
    });
}
