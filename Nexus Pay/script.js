document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // DOM CACHE
    // =========================================================
    const root = document.documentElement;
    const body = document.body;

    const preloader = document.getElementById('preloader');
    const toastStack = document.getElementById('toastStack');

    const themeToggle = document.getElementById('themeToggle');
    const authAction = document.getElementById('authAction');
    const registerAction = document.getElementById('registerAction');
    const cabinetButton = document.getElementById('cabinetButton');
    const heroCabinetButton = document.getElementById('heroCabinetButton');
    const cabinetAction = document.getElementById('cabinetAction');
    const mobileCabinetButton = document.getElementById('mobileCabinetButton');

    const modal = document.getElementById('authModal');
    const closeModalBtn = document.getElementById('closeModal');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const ring = document.querySelector('.cursor-ring');
    const dot = document.querySelector('.cursor-dot');

    const revealItems = document.querySelectorAll('.reveal');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const magneticItems = document.querySelectorAll('.magnetic');
    const tiltCards = document.querySelectorAll('[data-tilt]');
    const lightSurfaces = document.querySelectorAll('[data-light]');
    const orderButtons = document.querySelectorAll('.order-card-btn');

    const heroBalance = document.getElementById('heroBalance');
    const cabinetBalance = document.getElementById('cabinetBalance');
    const cabinetAuthStatus = document.getElementById('cabinetAuthStatus');
    const cabinetBadge = document.getElementById('cabinetBadge');
    const cabinetOrdersCount = document.getElementById('cabinetOrdersCount');
    const heroOrdersCount = document.getElementById('heroOrdersCount');
    const cabinetThemeLabel = document.getElementById('cabinetThemeLabel');
    const orderedCardsList = document.getElementById('orderedCardsList');

    const openAuthButtons = document.querySelectorAll('[data-auth-open]');
    const scrollButtons = document.querySelectorAll('[data-scroll-to]');
    const orderCardButtons = document.querySelectorAll('[data-card-id] .order-card-btn');

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // =========================================================
    // STORAGE KEYS AND DEFAULT STATE
    // =========================================================
    const STORAGE_KEYS = {
        isLoggedIn: 'isLoggedIn',
        userBalance: 'userBalance',
        orderedCards: 'orderedCards',
        theme: 'nexus-theme'
    };

    const DEFAULT_STATE = {
        isLoggedIn: false,
        userBalance: 1250000,
        orderedCards: []
    };

    const CARDS = {
        'ultra-black-premium': {
            title: 'Ultra Black Premium',
            price: 50000,
            priceLabel: '50 000 ₽ / год'
        },
        'nexus-youth': {
            title: 'Nexus Youth',
            price: 0,
            priceLabel: '0 ₽ обслуживание'
        },
        'nexus-giga-gold': {
            title: 'Nexus Giga Gold',
            price: 15000,
            priceLabel: '15 000 ₽ / год'
        }
    };

    // =========================================================
    // STATE HELPERS
    // =========================================================
    function loadState() {
        const isLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
        const balanceRaw = localStorage.getItem(STORAGE_KEYS.userBalance);
        const orderedRaw = localStorage.getItem(STORAGE_KEYS.orderedCards);

        return {
            isLoggedIn,
            userBalance: Number.isFinite(Number(balanceRaw)) ? Number(balanceRaw) : DEFAULT_STATE.userBalance,
            orderedCards: Array.isArray(JSON.parse(orderedRaw || '[]')) ? JSON.parse(orderedRaw || '[]') : DEFAULT_STATE.orderedCards
        };
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEYS.isLoggedIn, String(state.isLoggedIn));
        localStorage.setItem(STORAGE_KEYS.userBalance, String(state.userBalance));
        localStorage.setItem(STORAGE_KEYS.orderedCards, JSON.stringify(state.orderedCards));
    }

    function formatMoney(value) {
        return `₽ ${new Intl.NumberFormat('ru-RU').format(value)}`;
    }

    function isOrdered(cardId) {
        return state.orderedCards.includes(cardId);
    }

    // =========================================================
    // INITIAL STATE
    // =========================================================
    let state = loadState();
    let pendingAction = null;

    // =========================================================
    // THEME
    // =========================================================
    function applyTheme(theme) {
        const resolved = theme === 'light' ? 'light' : 'dark';
        root.setAttribute('data-theme', resolved);
        localStorage.setItem(STORAGE_KEYS.theme, resolved);
        themeToggle.textContent = resolved === 'dark' ? '☾' : '☀';
        cabinetThemeLabel.textContent = resolved === 'dark' ? 'Dark' : 'Light';
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    applyTheme(savedTheme || 'dark');

    themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
        showToast('Тема переключена', `Интерфейс переведён в режим ${root.getAttribute('data-theme')}.`);
    });

    // =========================================================
    // UI RENDERING
    // =========================================================
    function renderBalance() {
        const formatted = formatMoney(state.userBalance);
        heroBalance.textContent = formatted;
        cabinetBalance.textContent = formatted;
    }

    function renderAuthState() {
        const loggedIn = state.isLoggedIn;

        cabinetAuthStatus.textContent = loggedIn ? 'Авторизован' : 'Гость';
        cabinetBadge.textContent = loggedIn ? 'ONLINE' : 'OFFLINE';
        authAction.textContent = loggedIn ? 'Выйти' : 'Войти';
        authAction.dataset.authMode = loggedIn ? 'logout' : 'login';
        cabinetButton.textContent = 'Кабинет';

        registerAction.style.opacity = loggedIn ? '0.55' : '1';
        registerAction.style.pointerEvents = loggedIn ? 'none' : 'auto';
        registerAction.title = loggedIn ? 'Регистрация недоступна в активной сессии' : 'Открыть регистрацию';
        registerAction.setAttribute('aria-disabled', loggedIn ? 'true' : 'false');
    }

    function renderOrdersCount() {
        const count = state.orderedCards.length;
        heroOrdersCount.textContent = String(count);
        cabinetOrdersCount.textContent = String(count);
    }

    function renderOrderedCardsList() {
        if (!state.orderedCards.length) {
            orderedCardsList.innerHTML = `
                <div class="ordered-empty">
                    Пока ничего не заказано. Выберите карту в следующем блоке.
                </div>
            `;
            return;
        }

        orderedCardsList.innerHTML = state.orderedCards.map((cardId) => {
            const card = CARDS[cardId];
            if (!card) return '';

            return `
                <div class="ordered-card">
                    <div>
                        <h4>${card.title}</h4>
                        <p>${card.priceLabel}</p>
                    </div>
                    <div class="ordered-card__badge">Заказано</div>
                </div>
            `;
        }).join('');
    }

    function renderOrderButtons() {
        orderCardButtons.forEach((button) => {
            const cardEl = button.closest('[data-card-id]');
            const cardId = cardEl ? cardEl.dataset.cardId : null;

            if (!cardId) return;

            const ordered = isOrdered(cardId);
            button.textContent = ordered ? 'Заказано' : 'Заказать';
            button.classList.toggle('is-ordered', ordered);
            button.disabled = ordered;
        });
    }

    function renderCabinet() {
        renderBalance();
        renderAuthState();
        renderOrdersCount();
        renderOrderedCardsList();
        renderOrderButtons();
    }

    // =========================================================
    // TOASTS
    // =========================================================
    function showToast(title, message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;

        toastStack.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 2600);

        setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    // =========================================================
    // AUTH MODAL
    // =========================================================
    function setAuthMode(mode) {
        const isLogin = mode === 'login';

        loginForm.classList.toggle('active', isLogin);
        registerForm.classList.toggle('active', !isLogin);
        loginTab.classList.toggle('active', isLogin);
        registerTab.classList.toggle('active', !isLogin);
    }

    function openModal(mode = 'login', action = null) {
        if (action) pendingAction = action;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        body.classList.add('modal-open');
        setAuthMode(mode);
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        body.classList.remove('modal-open');
    }

    function finishLoginFlow() {
        state.isLoggedIn = true;
        saveState();
        renderCabinet();
        closeModal();
        showToast('Доступ открыт', 'Личный кабинет активирован. Состояние сохранено в браузере.');

        if (!pendingAction) return;

        const action = pendingAction;
        pendingAction = null;

        setTimeout(() => {
            if (action.type === 'order') {
                orderCard(action.cardId, true);
            }

            if (action.type === 'cabinet') {
                document.getElementById('cabinet').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 180);
    }

    function logout() {
        state.isLoggedIn = false;
        saveState();
        renderCabinet();
        showToast('Сессия завершена', 'Вы вышли из кабинета. Заказы и баланс остались в памяти браузера.');
    }

    // =========================================================
    // ORDER LOGIC
    // =========================================================
    function orderCard(cardId, skipAuthCheck = false) {
        const card = CARDS[cardId];
        if (!card) return;

        if (!state.isLoggedIn && !skipAuthCheck) {
            openModal('login', { type: 'order', cardId });
            return;
        }

        if (isOrdered(cardId)) {
            showToast('Карта уже заказана', card.title);
            return;
        }

        if (state.userBalance < card.price) {
            showToast('Недостаточно средств', `Для оформления "${card.title}" не хватает ${formatMoney(card.price - state.userBalance)}.`);
            return;
        }

        state.userBalance -= card.price;
        state.orderedCards.push(cardId);
        saveState();
        renderCabinet();

        showToast('Карта заказана', `${card.title} успешно оформлена.`);
    }

    // =========================================================
    // VALIDATION
    // =========================================================
    function validateForm(form) {
        const inputs = Array.from(form.querySelectorAll('input'));
        let isValid = true;

        inputs.forEach((input) => {
            const value = input.value.trim();

            let inputValid = true;
            if (!value) {
                inputValid = false;
            }

            if (input.type === 'email' && value) {
                inputValid = /^\S+@\S+\.\S+$/.test(value);
            }

            if (input.type === 'password' && form.id === 'registerForm' && value) {
                inputValid = value.length >= 6;
            }

            if (!inputValid) {
                isValid = false;
                input.classList.add('shake');
                input.setAttribute('aria-invalid', 'true');

                setTimeout(() => {
                    input.classList.remove('shake');
                }, 450);
            } else {
                input.setAttribute('aria-invalid', 'false');
            }
        });

        return isValid;
    }

    // =========================================================
    // AUTH FORM SUBMISSIONS
    // =========================================================
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateForm(loginForm)) return;

        finishLoginFlow();
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateForm(registerForm)) return;

        finishLoginFlow();
    });

    // =========================================================
    // BUTTONS AND NAVIGATION
    // =========================================================
    openAuthButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const mode = button.dataset.authOpen || 'login';
            openModal(mode);
        });
    });

    registerAction.addEventListener('click', () => {
        if (state.isLoggedIn) return;
        openModal('register');
    });

    authAction.addEventListener('click', () => {
        if (state.isLoggedIn) {
            logout();
            return;
        }

        openModal('login');
    });

    cabinetButton.addEventListener('click', () => {
        if (!state.isLoggedIn) {
            openModal('login', { type: 'cabinet' });
            return;
        }

        document.getElementById('cabinet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    heroCabinetButton.addEventListener('click', () => {
        if (!state.isLoggedIn) {
            openModal('login', { type: 'cabinet' });
            return;
        }

        document.getElementById('cabinet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    mobileCabinetButton.addEventListener('click', () => {
        if (!state.isLoggedIn) {
            openModal('login', { type: 'cabinet' });
            return;
        }

        document.getElementById('cabinet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    scrollButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.scrollTo;
            const target = document.getElementById(targetId);

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    orderCardButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('[data-card-id]');
            if (!card) return;

            orderCard(card.dataset.cardId);
        });
    });

    // =========================================================
    // MODAL CLOSING
    // =========================================================
    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    loginTab.addEventListener('click', () => setAuthMode('login'));
    registerTab.addEventListener('click', () => setAuthMode('register'));

    // =========================================================
    // FAQ ACCORDION
    // =========================================================
    faqQuestions.forEach((question) => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            faqQuestions.forEach((otherQuestion) => {
                const otherItem = otherQuestion.closest('.faq-item');
                const otherAnswer = otherItem.querySelector('.faq-answer');

                otherQuestion.classList.remove('active');
                otherQuestion.setAttribute('aria-expanded', 'false');
                otherItem.classList.remove('open');
                otherAnswer.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('open');
                question.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
        });
    });

    // =========================================================
    // SCROLL REVEAL
    // =========================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.18 });

    revealItems.forEach((item) => observer.observe(item));

    // =========================================================
    // CURSOR ANIMATION
    // =========================================================
    if (finePointer && !prefersReducedMotion) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        let ringX = mouseX;
        let ringY = mouseY;
        let dotX = mouseX;
        let dotY = mouseY;

        document.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        const cursorFrame = () => {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            dotX += (mouseX - dotX) * 0.4;
            dotY += (mouseY - dotY) * 0.4;

            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(cursorFrame);
        };

        requestAnimationFrame(cursorFrame);
    }

    // =========================================================
    // RIPPLE EFFECT
    // =========================================================
    const rippleTargets = document.querySelectorAll(
        '.btn-neon, .btn-outline, .btn-text, .theme-btn, .toggle-btn, .close-btn, .mobile-tabbar__item'
    );

    rippleTargets.forEach((el) => {
        el.addEventListener('pointerdown', (event) => {
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

            el.appendChild(ripple);
            setTimeout(() => ripple.remove(), 580);
        });
    });

    // =========================================================
    // MAGNETIC EFFECT
    // =========================================================
    magneticItems.forEach((element) => {
        let active = false;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let rafId = null;

        const strength = element.classList.contains('btn-neon') ? 0.18 : 0.12;

        const animate = () => {
            currentX += (targetX - currentX) * 0.18;
            currentY += (targetY - currentY) * 0.18;

            element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

            const finished = Math.abs(targetX - currentX) < 0.02 && Math.abs(targetY - currentY) < 0.02;
            if (active || !finished) {
                rafId = requestAnimationFrame(animate);
            } else {
                element.style.transform = 'translate3d(0, 0, 0)';
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        element.addEventListener('pointermove', (event) => {
            const rect = element.getBoundingClientRect();
            const offsetX = event.clientX - rect.left - rect.width / 2;
            const offsetY = event.clientY - rect.top - rect.height / 2;

            targetX = offsetX * strength;
            targetY = offsetY * strength;

            if (!active) {
                active = true;
                if (!rafId) rafId = requestAnimationFrame(animate);
            }
        });

        element.addEventListener('pointerleave', () => {
            active = false;
            targetX = 0;
            targetY = 0;
            if (!rafId) rafId = requestAnimationFrame(animate);
        });
    });

    // =========================================================
    // 3D TILT CARDS
    // =========================================================
    function attachTilt(card) {
        let targetRX = 0;
        let targetRY = 0;
        let currentRX = 0;
        let currentRY = 0;
        let hovering = false;
        let raf = null;

        const animate = () => {
            currentRX += (targetRX - currentRX) * 0.14;
            currentRY += (targetRY - currentRY) * 0.14;

            card.style.transform = `perspective(1100px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) translate3d(0, 0, 0)`;

            const stable = Math.abs(targetRX - currentRX) < 0.02 && Math.abs(targetRY - currentRY) < 0.02;
            if (hovering || !stable) {
                raf = requestAnimationFrame(animate);
            } else {
                card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
                cancelAnimationFrame(raf);
                raf = null;
            }
        };

        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;

            targetRY = (px - 0.5) * 10;
            targetRX = (0.5 - py) * 10;

            hovering = true;
            if (!raf) raf = requestAnimationFrame(animate);
        });

        card.addEventListener('pointerleave', () => {
            hovering = false;
            targetRX = 0;
            targetRY = 0;
            if (!raf) raf = requestAnimationFrame(animate);
        });
    }

    // =========================================================
    // LIGHT FOLLOW FOR SURFACES
    // =========================================================
    function attachLightFollow(surface) {
        surface.addEventListener('pointermove', (event) => {
            const rect = surface.getBoundingClientRect();
            const x = `${event.clientX - rect.left}px`;
            const y = `${event.clientY - rect.top}px`;
            surface.style.setProperty('--mx', x);
            surface.style.setProperty('--my', y);
        });
    }

    tiltCards.forEach(attachTilt);
    lightSurfaces.forEach(attachLightFollow);

    // =========================================================
    // HEADER / HERO STATE INIT
    // =========================================================
    renderCabinet();

    // =========================================================
    // PRELOADER
    // =========================================================
    window.addEventListener('load', () => {
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.remove();
        }, 700);
    });

    // =========================================================
    // PUBLIC TOAST AFTER INIT IF RESTORED SESSION
    // =========================================================
    if (state.isLoggedIn) {
        showToast('Сессия восстановлена', 'Кабинет и баланс загружены из localStorage.');
    }
});