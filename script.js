/**
 * ONE STOP ANIME - PREMIUM LOYALTY PACK OPENING
 * Immersive TCG Pack Opening Experience with User Accounts
 * 
 * Multi-stage animation system with sound design
 */

// ============================================
// REWARD CONFIGURATION
// ============================================

const REWARDS = {
    common: {
        name: "Starter's Blessing",
        rarity: "COMMON",
        icon: "⭐",
        art: "🎫",
        description: "Every collector starts somewhere. Enjoy a discount on your next purchase!",
        reward: "5% OFF",
        codePrefix: "OSA-C",
        probability: 0.40,
        color: "#9CA3AF",
        glowColor: "rgba(156, 163, 175, 0.5)"
    },
    uncommon: {
        name: "Collector's Fortune",
        rarity: "UNCOMMON",
        icon: "⭐⭐",
        art: "🎁",
        description: "The cards are in your favor! A worthy reward for a true collector.",
        reward: "10% OFF",
        codePrefix: "OSA-U",
        probability: 0.30,
        color: "#10B981",
        glowColor: "rgba(16, 185, 129, 0.5)"
    },
    rare: {
        name: "Rare Pull",
        rarity: "RARE",
        icon: "💎",
        art: "💫",
        description: "You've pulled something special! The TCG gods smile upon you.",
        reward: "15% OFF",
        codePrefix: "OSA-R",
        probability: 0.18,
        color: "#3B82F6",
        glowColor: "rgba(59, 130, 246, 0.5)"
    },
    ultraRare: {
        name: "Ultra Rare Discovery",
        rarity: "ULTRA RARE",
        icon: "🔥",
        art: "🎴",
        description: "Incredible! You've unlocked an Ultra Rare reward. A free booster pack awaits!",
        reward: "FREE BOOSTER PACK",
        codePrefix: "OSA-UR",
        probability: 0.10,
        color: "#EF4444",
        glowColor: "rgba(239, 68, 68, 0.6)"
    },
    secretRare: {
        name: "Secret Rare Jackpot",
        rarity: "SECRET RARE",
        icon: "👑",
        art: "🏆",
        description: "LEGENDARY PULL! You've hit the jackpot with a Secret Rare reward!",
        reward: "$50 STORE CREDIT",
        codePrefix: "OSA-SR",
        probability: 0.02,
        color: "rainbow",
        glowColor: "rgba(255, 215, 0, 0.7)"
    }
};

// Animation timing constants
const TIMING = {
    CHARGE_DURATION: 1500,
    CHARGE_INTENSE_START: 1000,
    TEAR_DURATION: 800,
    CARD_RISE_DELAY: 300,
    REVEAL_DURATION: 1800,
    CONFETTI_WAVE_DELAY: 400
};

// Storage keys
const STORAGE_KEYS = {
    ACCOUNTS: 'osa_accounts',
    SESSION: 'osa_session',
    LEGACY: 'oneStopAnimeLoyalty'
};

// State management
let currentScreen = 'landing';
let userData = {};
let earnedReward = null;
let packState = 'sealed'; // sealed, charging, torn, revealed
let chargeTimeout = null;
let audioContext = null;
let currentUser = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initAudioContext();
    initSakuraParticles();
    initCardTilt();
    initPasswordStrength();
    checkSession();
    migrateLegacyData();
});

function initAudioContext() {
    // Create audio context on first user interaction
    document.addEventListener('click', () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, { once: true });
}

function initSakuraParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const petalCount = 25;

    for (let i = 0; i < petalCount; i++) {
        createSakuraPetal(container, i);
    }
}

function createSakuraPetal(container, index) {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';

    // Random positioning and timing
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDelay = (Math.random() * 15) + 's';
    petal.style.animationDuration = (12 + Math.random() * 8) + 's';

    // Vary petal sizes
    const size = 8 + Math.random() * 8;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';

    // Vary opacity
    petal.style.setProperty('--petal-opacity', 0.4 + Math.random() * 0.4);

    container.appendChild(petal);
}

function initCardTilt() {
    document.addEventListener('mousemove', handleCardTilt);
    document.addEventListener('touchmove', handleCardTiltTouch);
}

function handleCardTilt(e) {
    const card = document.querySelector('.reward-card:not(.revealing)');
    if (!card || currentScreen !== 'reveal') return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;

    const rotateX = deltaY * -12;
    const rotateY = deltaX * 12;

    const inner = card.querySelector('.card-inner');
    if (inner) {
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

function handleCardTiltTouch(e) {
    if (e.touches.length > 0) {
        handleCardTilt({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
}

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('password-strength');
    if (!strengthBar) return;

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = ['weak', 'fair', 'good', 'strong', 'excellent'];
    const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

    if (password.length === 0) {
        strengthBar.innerHTML = '';
        return;
    }

    const levelIndex = Math.min(strength - 1, 4);
    strengthBar.innerHTML = `
        <div class="strength-bar" style="--strength: ${(strength / 5) * 100}%; --color: ${colors[Math.max(0, levelIndex)]}">
            <div class="strength-fill"></div>
        </div>
        <span class="strength-label" style="color: ${colors[Math.max(0, levelIndex)]}">${labels[Math.max(0, levelIndex)]}</span>
    `;
}

// ============================================
// ACCOUNT MANAGEMENT SYSTEM
// ============================================

function getAccounts() {
    try {
        const accounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        return accounts ? JSON.parse(accounts) : {};
    } catch (e) {
        return {};
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

function hashPassword(password) {
    // Simple hash for client-side use (NOT cryptographically secure)
    // For production, use a proper auth service
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36);
}

function createAccount(name, email, password, phone, favorite) {
    const accounts = getAccounts();
    const emailLower = email.toLowerCase();

    if (accounts[emailLower]) {
        return { success: false, error: 'An account with this email already exists' };
    }

    const memberId = generateMemberId();
    const account = {
        name,
        email: emailLower,
        passwordHash: hashPassword(password),
        phone: phone || '',
        favorite: favorite || '',
        memberId,
        createdAt: new Date().toISOString(),
        rewards: [],
        packsOpened: 0
    };

    accounts[emailLower] = account;
    saveAccounts(accounts);

    return { success: true, account };
}

function login(email, password) {
    const accounts = getAccounts();
    const emailLower = email.toLowerCase();
    const account = accounts[emailLower];

    if (!account) {
        return { success: false, error: 'No account found with this email' };
    }

    if (account.passwordHash !== hashPassword(password)) {
        return { success: false, error: 'Incorrect password' };
    }

    // Create session
    currentUser = account;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
        email: emailLower,
        loginTime: new Date().toISOString()
    }));

    return { success: true, account };
}

function logout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    updateUIForAuthState();
    showLanding();
    showToast('Logged out successfully! 👋');
}

function checkSession() {
    try {
        const session = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (session) {
            const { email } = JSON.parse(session);
            const accounts = getAccounts();
            if (accounts[email]) {
                currentUser = accounts[email];
                updateUIForAuthState();
                return true;
            }
        }
    } catch (e) {
        console.log('Session check failed:', e);
    }
    return false;
}

function isLoggedIn() {
    // Check Netlify Identity first
    if (typeof netlifyIdentity !== 'undefined') {
        const netlifyUser = netlifyIdentity.currentUser();
        if (netlifyUser) return true;
    }
    // Fallback to local user
    return currentUser !== null;
}

function getCurrentUser() {
    return currentUser;
}

function updateCurrentUser(updates) {
    if (!currentUser) return;

    const accounts = getAccounts();
    const email = currentUser.email;

    currentUser = { ...currentUser, ...updates };
    accounts[email] = currentUser;
    saveAccounts(accounts);
}

function addRewardToHistory(reward) {
    if (!currentUser) return;

    const rewardEntry = {
        ...reward,
        earnedAt: new Date().toISOString()
    };

    const newRewards = [...(currentUser.rewards || []), rewardEntry];
    const newPacksOpened = (currentUser.packsOpened || 0) + 1;

    updateCurrentUser({
        rewards: newRewards,
        packsOpened: newPacksOpened
    });
}

function migrateLegacyData() {
    // Migrate data from the old storage format
    try {
        const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY);
        if (legacy && !currentUser) {
            const data = JSON.parse(legacy);
            if (data.user && data.user.email) {
                console.log('Legacy data found for:', data.user.name);
                // Don't auto-create account, just log
            }
        }
    } catch (e) {
        // Ignore migration errors
    }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function updateUIForAuthState() {
    const welcomeBack = document.getElementById('welcome-back');
    const welcomeName = document.getElementById('welcome-name');
    const landingActions = document.getElementById('landing-actions');
    const loggedInActions = document.getElementById('logged-in-actions');

    if (isLoggedIn()) {
        welcomeBack?.classList.remove('hidden');
        if (welcomeName) welcomeName.textContent = currentUser.name;
        landingActions?.classList.add('hidden');
        loggedInActions?.classList.remove('hidden');
    } else {
        welcomeBack?.classList.add('hidden');
        landingActions?.classList.remove('hidden');
        loggedInActions?.classList.add('hidden');
    }
}

function updateDashboard() {
    if (!currentUser) return;

    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-member-id').textContent = currentUser.memberId;
    document.getElementById('packs-opened').textContent = currentUser.packsOpened || 0;
    document.getElementById('total-rewards').textContent = (currentUser.rewards || []).length;

    // Render reward history
    const rewardsList = document.getElementById('rewards-list');
    const noRewards = document.getElementById('no-rewards');
    const rewards = currentUser.rewards || [];

    if (rewards.length === 0) {
        noRewards?.classList.remove('hidden');
        rewardsList.innerHTML = '';
        rewardsList.appendChild(noRewards);
    } else {
        noRewards?.classList.add('hidden');
        rewardsList.innerHTML = rewards
            .slice()
            .reverse()
            .map(reward => `
                <div class="reward-item ${reward.key || 'common'}">
                    <div class="reward-item-icon">${reward.icon || '⭐'}</div>
                    <div class="reward-item-details">
                        <span class="reward-item-name">${reward.name || 'Reward'}</span>
                        <span class="reward-item-value">${reward.reward}</span>
                        <span class="reward-item-code">${reward.code}</span>
                    </div>
                    <div class="reward-item-date">${formatDate(reward.earnedAt)}</div>
                </div>
            `)
            .join('');
    }
}

function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return 'Unknown';
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId.replace('-screen', '');
    }
}

function showLanding() {
    updateUIForAuthState();
    showScreen('landing-screen');
}

function showLogin() {
    // Prefer Netlify Identity if available
    if (typeof netlifyIdentity !== 'undefined') {
        netlifyIdentity.open('login');
        return;
    }

    // Fallback to local login screen
    showScreen('login-screen');
    // Focus email input after animation
    setTimeout(() => {
        const emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.focus();
    }, 500);
}

function showSignup() {
    // Prefer Netlify Identity if available
    if (typeof netlifyIdentity !== 'undefined') {
        netlifyIdentity.open('signup');
        return;
    }

    // Fallback to local signup screen
    showScreen('signup-screen');
    // Focus first input after animation
    setTimeout(() => {
        const firstInput = document.querySelector('#signup-form input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 500);
}

function showDashboard() {
    if (!isLoggedIn()) {
        showLogin();
        return;
    }
    updateDashboard();
    showScreen('dashboard-screen');
}

function showOpening() {
    if (!isLoggedIn()) {
        showLogin();
        return;
    }

    // Determine reward before opening
    earnedReward = determineReward();
    earnedReward.code = generatePromoCode(earnedReward.codePrefix);

    // Get user info from Netlify or local
    if (typeof netlifyIdentity !== 'undefined' && netlifyIdentity.currentUser()) {
        const netlifyUser = netlifyIdentity.currentUser();
        earnedReward.memberId = netlifyUser.user_metadata?.member_id || generateMemberId();
        earnedReward.memberName = netlifyUser.user_metadata?.full_name ||
            netlifyUser.user_metadata?.name ||
            netlifyUser.email?.split('@')[0] || 'Trainer';
    } else if (currentUser) {
        earnedReward.memberId = currentUser.memberId;
        earnedReward.memberName = currentUser.name;
    } else {
        earnedReward.memberId = generateMemberId();
        earnedReward.memberName = 'Trainer';
    }

    showScreen('opening-screen');
    resetPackState();
}

function showReveal() {
    showScreen('reveal-screen');
    animateCardReveal();

    // Save reward to user's history
    if (isLoggedIn() && earnedReward) {
        // Check if using Netlify Identity
        if (typeof netlifyIdentity !== 'undefined' && netlifyIdentity.currentUser()) {
            // Save to Netlify (async)
            if (typeof addRewardToNetlify === 'function') {
                addRewardToNetlify(earnedReward);
            }
        } else {
            // Save to local storage
            addRewardToHistory(earnedReward);
        }
    }
}

function resetPackState() {
    packState = 'sealed';
    const packSealed = document.getElementById('pack-sealed');
    const packTorn = document.getElementById('pack-torn');
    const tapHint = document.getElementById('tap-hint');

    if (packSealed) {
        packSealed.style.display = 'flex';
        packSealed.classList.remove('charging', 'charging-intense');
    }
    if (packTorn) {
        packTorn.classList.add('hidden');
    }
    if (tapHint) {
        tapHint.textContent = 'Hold the pack to charge, then release!';
        tapHint.style.display = 'block';
    }
}

// ============================================
// FORM HANDLING
// ============================================

function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    const errorEl = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    // Validate inputs
    if (!email || !password) {
        errorText.textContent = 'Please enter both email and password';
        errorEl.classList.remove('hidden');
        return false;
    }

    // Attempt login
    const result = login(email, password);

    if (result.success) {
        errorEl.classList.add('hidden');
        form.reset();
        updateUIForAuthState();
        showDashboard();
        showToast(`Welcome back, ${result.account.name}! 🌸`);
    } else {
        errorText.textContent = result.error;
        errorEl.classList.remove('hidden');
    }

    return false;
}

async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form['confirm-password'].value;
    const phone = form.phone.value.trim();
    const favorite = form.favorite.value;
    const terms = form.terms.checked;

    const errorEl = document.getElementById('signup-error');
    const errorText = document.getElementById('signup-error-text');

    // Validation
    if (!name) {
        errorText.textContent = 'Please enter your name';
        errorEl.classList.remove('hidden');
        return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorText.textContent = 'Please enter a valid email address';
        errorEl.classList.remove('hidden');
        return false;
    }

    if (!password || password.length < 6) {
        errorText.textContent = 'Password must be at least 6 characters';
        errorEl.classList.remove('hidden');
        return false;
    }

    if (password !== confirmPassword) {
        errorText.textContent = 'Passwords do not match';
        errorEl.classList.remove('hidden');
        return false;
    }

    if (!terms) {
        errorText.textContent = 'Please agree to the terms';
        errorEl.classList.remove('hidden');
        return false;
    }

    // Create local account
    const result = createAccount(name, email, password, phone, favorite);

    if (!result.success) {
        errorText.textContent = result.error;
        errorEl.classList.remove('hidden');
        return false;
    }

    // Submit to Netlify Forms
    try {
        const formData = new FormData(form);
        formData.delete('password');
        formData.delete('confirm-password');

        await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        });
    } catch (e) {
        console.log('Netlify form submission error (non-critical):', e);
    }

    // Log in the new user
    login(email, password);
    errorEl.classList.add('hidden');
    form.reset();
    updateUIForAuthState();

    // Store user data for the pack opening
    userData = {
        name,
        email,
        phone,
        favorite,
        memberId: result.account.memberId
    };

    // Proceed to pack opening
    showOpening();
    showToast(`Account created! Welcome, ${name}! 🌸`);

    return false;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function determineReward() {
    const roll = Math.random();
    let cumulative = 0;

    for (const [key, reward] of Object.entries(REWARDS)) {
        cumulative += reward.probability;
        if (roll <= cumulative) {
            return { ...reward, key };
        }
    }

    return { ...REWARDS.common, key: 'common' };
}

function generateMemberId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `#${timestamp}${random}`.substring(0, 10);
}

function generatePromoCode(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = prefix + '-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================
// PACK OPENING - MULTI-STAGE ANIMATION
// ============================================

let isHolding = false;
let holdStartTime = 0;

// Set up pack interaction
document.addEventListener('DOMContentLoaded', () => {
    const packContainer = document.getElementById('pack-container');
    if (packContainer) {
        // Mouse events
        packContainer.addEventListener('mousedown', startPackCharge);
        packContainer.addEventListener('mouseup', releasePackCharge);
        packContainer.addEventListener('mouseleave', cancelPackCharge);

        // Touch events
        packContainer.addEventListener('touchstart', startPackCharge, { passive: true });
        packContainer.addEventListener('touchend', releasePackCharge);
        packContainer.addEventListener('touchcancel', cancelPackCharge);
    }
});

function startPackCharge(e) {
    if (packState !== 'sealed') return;

    isHolding = true;
    holdStartTime = Date.now();

    const packSealed = document.getElementById('pack-sealed');
    if (packSealed) {
        packSealed.classList.add('charging');
    }

    // Play charge sound
    playSound('charge');

    // Start energy particles
    startEnergyParticles();

    // Schedule intense charging
    chargeTimeout = setTimeout(() => {
        if (isHolding && packSealed) {
            packSealed.classList.remove('charging');
            packSealed.classList.add('charging-intense');
            playSound('chargeIntense');
        }
    }, TIMING.CHARGE_INTENSE_START);

    // Update hint
    const tapHint = document.getElementById('tap-hint');
    if (tapHint) {
        tapHint.textContent = 'Keep holding... energy building!';
    }
}

function releasePackCharge(e) {
    if (!isHolding || packState !== 'sealed') return;

    const holdDuration = Date.now() - holdStartTime;
    isHolding = false;

    clearTimeout(chargeTimeout);

    const packSealed = document.getElementById('pack-sealed');
    if (packSealed) {
        packSealed.classList.remove('charging', 'charging-intense');
    }

    // Need to hold for at least 500ms to open
    if (holdDuration >= 500) {
        tearPack();
    } else {
        // Reset hint
        const tapHint = document.getElementById('tap-hint');
        if (tapHint) {
            tapHint.textContent = 'Hold longer to charge the pack!';
        }
        stopEnergyParticles();
    }
}

function cancelPackCharge() {
    if (!isHolding) return;

    isHolding = false;
    clearTimeout(chargeTimeout);

    const packSealed = document.getElementById('pack-sealed');
    if (packSealed) {
        packSealed.classList.remove('charging', 'charging-intense');
    }

    stopEnergyParticles();
}

let energyParticleInterval = null;

function startEnergyParticles() {
    const container = document.getElementById('pack-container');
    if (!container) return;

    energyParticleInterval = setInterval(() => {
        if (!isHolding) return;

        const particle = document.createElement('div');
        particle.className = 'energy-particle';

        // Random position around pack
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 50;
        const startX = container.offsetWidth / 2 + Math.cos(angle) * distance;
        const startY = container.offsetHeight / 2 + Math.sin(angle) * distance;

        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';

        // Random color
        const colors = ['#FF2D8A', '#00D4FF', '#A855F7', '#FFD700'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = `0 0 10px ${particle.style.background}`;

        container.appendChild(particle);

        // Animate toward center
        const targetX = container.offsetWidth / 2;
        const targetY = container.offsetHeight / 2;

        particle.animate([
            {
                left: startX + 'px',
                top: startY + 'px',
                opacity: 1,
                transform: 'scale(1)'
            },
            {
                left: targetX + 'px',
                top: targetY + 'px',
                opacity: 0,
                transform: 'scale(0)'
            }
        ], {
            duration: 600,
            easing: 'ease-in'
        }).onfinish = () => particle.remove();

    }, 50);
}

function stopEnergyParticles() {
    if (energyParticleInterval) {
        clearInterval(energyParticleInterval);
        energyParticleInterval = null;
    }
}

function tearPack() {
    packState = 'torn';
    stopEnergyParticles();

    // Play tear sound
    playSound('tear');

    // Create burst effect
    createTearBurst();

    // Hide sealed, show torn
    const packSealed = document.getElementById('pack-sealed');
    const packTorn = document.getElementById('pack-torn');
    const tapHint = document.getElementById('tap-hint');

    if (packSealed) {
        packSealed.style.display = 'none';
    }

    if (packTorn) {
        packTorn.classList.remove('hidden');
    }

    if (tapHint) {
        tapHint.textContent = 'Tap the card to reveal your reward!';
    }

    // Set up card click
    const cardBack = document.getElementById('reward-card-back');
    if (cardBack) {
        cardBack.onclick = () => {
            playSound('whoosh');
            showReveal();
        };
    }
}

function createTearBurst() {
    const container = document.getElementById('confetti');
    if (!container) return;

    const colors = ['#FF2D8A', '#00D4FF', '#A855F7', '#FFD700', '#FFFFFF', '#10B981'];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'burst-particle';
        particle.style.position = 'fixed';
        particle.style.left = '50%';
        particle.style.top = '45%';
        particle.style.width = (4 + Math.random() * 8) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        particle.style.boxShadow = `0 0 10px ${particle.style.background}`;

        container.appendChild(particle);

        // Burst animation
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = 150 + Math.random() * 250;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        particle.animate([
            {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 1
            },
            {
                transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`,
                opacity: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }).onfinish = () => particle.remove();
    }
}

// ============================================
// CARD REVEAL ANIMATION
// ============================================

function animateCardReveal() {
    const card = document.getElementById('reward-card');
    const cardFrame = document.querySelector('.card-frame');

    if (!card || !cardFrame || !earnedReward) return;

    // Set card content
    document.getElementById('card-name').textContent = earnedReward.name;
    document.getElementById('rarity-icon').textContent = earnedReward.icon;
    document.getElementById('card-art').textContent = earnedReward.art;
    document.getElementById('card-type').textContent = 'LOYALTY REWARD';
    document.getElementById('card-rarity').textContent = earnedReward.rarity;
    document.getElementById('card-rarity').style.color =
        earnedReward.color === 'rainbow' ? '#FFD700' : earnedReward.color;
    document.getElementById('card-description').textContent = earnedReward.description;
    document.getElementById('reward-value').textContent = earnedReward.reward;
    document.getElementById('promo-code').textContent = earnedReward.code;
    document.getElementById('member-name').textContent = currentUser?.name || userData?.name || 'Trainer';
    document.getElementById('member-id').textContent = currentUser?.memberId || userData?.memberId || '#000001';

    // Set rarity class
    const rarityClass = earnedReward.key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cardFrame.className = 'card-frame ' + rarityClass;

    // Start reveal animation
    card.classList.add('revealing');

    // Play reveal sound based on rarity
    playRevealSound(earnedReward.key);

    // Flash effect for rare+
    if (['rare', 'ultraRare', 'secretRare'].includes(earnedReward.key)) {
        setTimeout(() => createRevealFlash(earnedReward.glowColor), 400);
    }

    // Special effects for secret rare
    if (earnedReward.key === 'secretRare') {
        card.classList.add('secret-rare-reveal');
        setTimeout(() => screenShake(), 500);
    }

    // Confetti for uncommon+
    const confettiRarities = ['uncommon', 'rare', 'ultraRare', 'secretRare'];
    if (confettiRarities.includes(earnedReward.key)) {
        const intensity = confettiRarities.indexOf(earnedReward.key) + 1;
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => launchConfetti(earnedReward.color), 600 + (i * TIMING.CONFETTI_WAVE_DELAY));
        }
    }

    // Remove revealing class after animation
    setTimeout(() => {
        card.classList.remove('revealing');
    }, TIMING.REVEAL_DURATION);
}

function createRevealFlash(color = 'rgba(255, 255, 255, 0.8)') {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 40%, ${color}, transparent 70%);
        pointer-events: none;
        z-index: 999;
    `;
    document.body.appendChild(flash);

    flash.animate([
        { opacity: 0.9 },
        { opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).onfinish = () => flash.remove();
}

function screenShake() {
    document.body.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(3px)' },
        { transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

function launchConfetti(color = '#FF2D8A') {
    const container = document.getElementById('confetti');
    if (!container) return;

    const colors = color === 'rainbow'
        ? ['#FFD700', '#FF2D8A', '#3B82F6', '#10B981', '#A855F7', '#FFFFFF']
        : ['#FF2D8A', '#00D4FF', '#A855F7', '#FFD700', '#10B981', color, '#FFFFFF'];

    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (5 + Math.random() * 10) + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        confetti.style.animationDelay = (Math.random() * 0.6) + 's';
        confetti.style.animationDuration = (2.5 + Math.random() * 2) + 's';

        container.appendChild(confetti);

        // Trigger animation
        requestAnimationFrame(() => confetti.classList.add('active'));

        // Cleanup
        setTimeout(() => confetti.remove(), 5000);
    }
}

// ============================================
// SOUND DESIGN
// ============================================

function playSound(type) {
    if (!audioContext) return;

    try {
        switch (type) {
            case 'charge':
                playSynthSound(200, 0.1, 'sine', 0.2);
                break;
            case 'chargeIntense':
                playSynthSound(400, 0.15, 'sawtooth', 0.15);
                break;
            case 'tear':
                playNoiseSound(0.2, 0.1);
                playSynthSound(80, 0.15, 'square', 0.3);
                break;
            case 'whoosh':
                playSweepSound(600, 200, 0.3, 0.15);
                break;
        }
    } catch (e) {
        // Audio not supported
    }
}

function playRevealSound(rarity) {
    if (!audioContext) return;

    try {
        switch (rarity) {
            case 'common':
                playSynthSound(440, 0.2, 'sine', 0.2);
                break;
            case 'uncommon':
                playChord([440, 554, 659], 0.3, 0.15);
                break;
            case 'rare':
                playChord([523, 659, 784], 0.4, 0.2);
                playSweepSound(400, 1200, 0.5, 0.1);
                break;
            case 'ultraRare':
                playChord([523, 659, 784, 1047], 0.5, 0.25);
                playSweepSound(300, 1500, 0.6, 0.15);
                break;
            case 'secretRare':
                playChord([523, 659, 784, 1047, 1319], 0.6, 0.3);
                playSweepSound(200, 2000, 0.8, 0.2);
                setTimeout(() => playChord([659, 784, 988, 1175], 0.4, 0.2), 300);
                break;
        }
    } catch (e) {
        // Audio not supported
    }
}

function playSynthSound(frequency, duration, type = 'sine', volume = 0.2) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playSweepSound(startFreq, endFreq, duration, volume = 0.1) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playChord(frequencies, duration, volume = 0.1) {
    frequencies.forEach((freq, i) => {
        setTimeout(() => {
            playSynthSound(freq, duration, 'sine', volume / frequencies.length);
        }, i * 30);
    });
}

function playNoiseSound(duration, volume = 0.1) {
    if (!audioContext) return;

    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + duration);
}

// ============================================
// USER ACTIONS
// ============================================

function copyCode() {
    if (!earnedReward) return;

    const code = earnedReward.code;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('Promo code copied! 📋');
            playSound('whoosh');
        }).catch(() => {
            fallbackCopy(code);
        });
    } else {
        fallbackCopy(code);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showToast('Promo code copied! 📋');
    } catch (e) {
        showToast('Code: ' + text);
    }

    document.body.removeChild(textarea);
}

function shareReward() {
    if (!earnedReward) return;

    const shareText = `🎴 I just joined One Stop Anime's Loyalty Program and pulled a ${earnedReward.rarity} reward! 🌸\n\nMy reward: ${earnedReward.reward}\n\nJoin the collector's circle: https://onestopanime.netlify.app/`;

    if (navigator.share) {
        navigator.share({
            title: 'One Stop Anime - Loyalty Reward',
            text: shareText,
            url: 'https://onestopanime.netlify.app/'
        }).catch(() => {
            copyShareText(shareText);
        });
    } else {
        copyShareText(shareText);
    }
}

function copyShareText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Share text copied! 📤');
        });
    }
}

function showToast(message) {
    // Remove existing
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    // Hide after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.showLanding = showLanding;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.showDashboard = showDashboard;
window.showOpening = showOpening;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.togglePassword = togglePassword;
window.tearPack = tearPack;
window.copyCode = copyCode;
window.shareReward = shareReward;
window.logout = logout;
