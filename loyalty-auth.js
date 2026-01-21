/**
 * ONE STOP ANIME - Loyalty Pack Netlify Identity Authentication
 * Handles authentication and reward persistence for the loyalty pack experience
 */

// ============================================
// CONFIGURATION
// ============================================

const LOYALTY_CONFIG = {
    MAIN_SITE_URL: 'onestopanime/index.html',
    STORAGE_KEY_LEGACY: 'osa_accounts',
    STORAGE_KEY_SESSION: 'osa_session',
    DEFAULT_AVATAR: '🌸'
};

// ============================================
// STATE
// ============================================

let netlifyUser = null;
let isNetlifyReady = false;
let authReadyCallbacks = [];

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize Netlify Identity for loyalty pack
 */
function initNetlifyAuth() {
    if (typeof netlifyIdentity === 'undefined') {
        console.log('Netlify Identity not available, using local storage fallback');
        isNetlifyReady = true;
        runAuthReadyCallbacks();
        return;
    }

    // Initialize the widget
    netlifyIdentity.init({
        container: '#netlify-modal',
        locale: 'en'
    });

    // Check for existing user
    netlifyUser = netlifyIdentity.currentUser();

    // Set up event listeners
    netlifyIdentity.on('init', user => {
        netlifyUser = user;
        isNetlifyReady = true;
        syncNetlifyToLocal();
        runAuthReadyCallbacks();
    });

    netlifyIdentity.on('login', user => {
        netlifyUser = user;
        syncNetlifyToLocal();
        netlifyIdentity.close();
        showToast(`Welcome, ${getNetlifyUserName()}! 🌸`);

        // Refresh UI state
        updateUIForAuthState();
    });

    netlifyIdentity.on('logout', () => {
        netlifyUser = null;
        currentUser = null;
        localStorage.removeItem(LOYALTY_CONFIG.STORAGE_KEY_SESSION);
        updateUIForAuthState();
        showToast('Logged out successfully! 👋');
    });

    netlifyIdentity.on('error', err => {
        console.error('Netlify auth error:', err);
        showToast('Authentication error. Please try again.');
    });

    // If we have a Netlify user, sync their data
    if (netlifyUser) {
        syncNetlifyToLocal();
    }
}

/**
 * Register callback for when auth is ready
 */
function onNetlifyAuthReady(callback) {
    if (isNetlifyReady) {
        callback(netlifyUser);
    } else {
        authReadyCallbacks.push(callback);
    }
}

function runAuthReadyCallbacks() {
    authReadyCallbacks.forEach(cb => cb(netlifyUser));
    authReadyCallbacks = [];
}

// ============================================
// NETLIFY USER HELPERS
// ============================================

function getNetlifyUserName() {
    if (!netlifyUser) return 'Guest';
    return netlifyUser.user_metadata?.full_name ||
        netlifyUser.user_metadata?.name ||
        netlifyUser.email?.split('@')[0] ||
        'Trainer';
}

function getNetlifyUserEmail() {
    return netlifyUser?.email || '';
}

function getNetlifyMemberId() {
    if (!netlifyUser) return null;
    return netlifyUser.user_metadata?.member_id || null;
}

function getNetlifyRewards() {
    if (!netlifyUser) return [];
    return netlifyUser.user_metadata?.rewards || [];
}

function getNetlifyPacksOpened() {
    if (!netlifyUser) return 0;
    return netlifyUser.user_metadata?.packs_opened || 0;
}

/**
 * Sync Netlify user data to local currentUser object
 */
function syncNetlifyToLocal() {
    if (!netlifyUser) return;

    // Create or update local user representation
    const memberId = getNetlifyMemberId() || generateMemberId();

    currentUser = {
        name: getNetlifyUserName(),
        email: getNetlifyUserEmail(),
        memberId: memberId,
        rewards: getNetlifyRewards(),
        packsOpened: getNetlifyPacksOpened(),
        isNetlify: true
    };

    // Ensure member ID is set in Netlify
    if (!getNetlifyMemberId()) {
        updateNetlifyUserData({ member_id: memberId });
    }
}

/**
 * Update Netlify user metadata
 */
async function updateNetlifyUserData(updates) {
    if (!netlifyUser) {
        console.log('No Netlify user, cannot update metadata');
        return false;
    }

    try {
        const token = await netlifyUser.jwt();

        // Merge with existing metadata
        const currentMetadata = netlifyUser.user_metadata || {};
        const newMetadata = { ...currentMetadata, ...updates };

        // Update via Netlify Identity API
        const response = await fetch('/.netlify/identity/user', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: newMetadata
            })
        });

        if (response.ok) {
            // Refresh user data
            await netlifyUser.update({ data: newMetadata });
            netlifyUser = netlifyIdentity.currentUser();
            syncNetlifyToLocal();
            return true;
        } else {
            console.error('Failed to update Netlify user data:', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Error updating Netlify user data:', error);
        return false;
    }
}

/**
 * Add reward to Netlify user's history
 */
async function addRewardToNetlify(reward) {
    if (!netlifyUser) return false;

    const rewards = getNetlifyRewards();
    const packsOpened = getNetlifyPacksOpened();

    const rewardEntry = {
        ...reward,
        earnedAt: new Date().toISOString()
    };

    const success = await updateNetlifyUserData({
        rewards: [...rewards, rewardEntry],
        packs_opened: packsOpened + 1
    });

    if (success) {
        // Also update local currentUser
        if (currentUser) {
            currentUser.rewards = [...rewards, rewardEntry];
            currentUser.packsOpened = packsOpened + 1;
        }
    }

    return success;
}

// ============================================
// AUTH UI FUNCTIONS
// ============================================

/**
 * Open Netlify login modal
 */
function openNetlifyLogin() {
    if (typeof netlifyIdentity !== 'undefined') {
        netlifyIdentity.open('login');
    } else {
        // Fallback to local login screen
        showLogin();
    }
}

/**
 * Open Netlify signup modal  
 */
function openNetlifySignup() {
    if (typeof netlifyIdentity !== 'undefined') {
        netlifyIdentity.open('signup');
    } else {
        // Fallback to local signup screen
        showSignup();
    }
}

/**
 * Logout from Netlify
 */
function netlifyLogout() {
    if (typeof netlifyIdentity !== 'undefined' && netlifyUser) {
        netlifyIdentity.logout();
    } else {
        // Fallback to local logout
        logout();
    }
}

/**
 * Check if using Netlify auth
 */
function isNetlifyAuth() {
    return typeof netlifyIdentity !== 'undefined' && netlifyUser !== null;
}

// ============================================
// OVERRIDE LOCAL AUTH FUNCTIONS
// ============================================

// Store original functions
const _originalLogin = typeof login === 'function' ? login : null;
const _originalLogout = typeof logout === 'function' ? logout : null;
const _originalAddRewardToHistory = typeof addRewardToHistory === 'function' ? addRewardToHistory : null;

/**
 * Enhanced login that prefers Netlify Identity
 */
function enhancedLogin(email, password) {
    if (typeof netlifyIdentity !== 'undefined') {
        // Use Netlify Identity
        netlifyIdentity.open('login');
        return { success: true, pending: true };
    } else if (_originalLogin) {
        // Fallback to local
        return _originalLogin(email, password);
    }
    return { success: false, error: 'No auth method available' };
}

/**
 * Enhanced logout that handles Netlify
 */
function enhancedLogout() {
    if (isNetlifyAuth()) {
        netlifyLogout();
    } else if (_originalLogout) {
        _originalLogout();
    }
}

/**
 * Enhanced add reward that syncs to Netlify
 */
async function enhancedAddRewardToHistory(reward) {
    if (isNetlifyAuth()) {
        const success = await addRewardToNetlify(reward);
        if (success) {
            console.log('Reward saved to Netlify Identity');
        }
        return success;
    } else if (_originalAddRewardToHistory) {
        _originalAddRewardToHistory(reward);
        return true;
    }
    return false;
}

// ============================================
// INITIALIZATION HOOK
// ============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNetlifyAuth();

    // Wait for auth to be ready before checking session
    onNetlifyAuthReady((user) => {
        if (user) {
            // User is logged in via Netlify
            updateUIForAuthState();
        }
    });
});

// ============================================
// EXPORT TO GLOBAL SCOPE
// ============================================

window.initNetlifyAuth = initNetlifyAuth;
window.openNetlifyLogin = openNetlifyLogin;
window.openNetlifySignup = openNetlifySignup;
window.netlifyLogout = netlifyLogout;
window.isNetlifyAuth = isNetlifyAuth;
window.addRewardToNetlify = addRewardToNetlify;
window.getNetlifyUserName = getNetlifyUserName;
window.getNetlifyRewards = getNetlifyRewards;
window.getNetlifyPacksOpened = getNetlifyPacksOpened;
window.onNetlifyAuthReady = onNetlifyAuthReady;
