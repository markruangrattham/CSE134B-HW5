let isAuthenticated = false;
let graveKeyCount = 0;
let graveKeyTimeout = null;
let tapCount = 0;
let tapTimeout = null;
const password = 'markAdmin';

function showMessage(text, isSuccess = true) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isSuccess ? 'var(--accent)' : '#dc2626'};
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: ${isSuccess ? 'fadeInOut' : 'shake'} 2s ease-in-out;
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

function unlockAdmin() {
    const dropdown = document.getElementById('admin-dropdown');
    const summary = document.querySelector('.nav-dropdown-toggle');
    
    if (isAuthenticated) return; 
    
    isAuthenticated = true;
    dropdown.removeAttribute('hidden');
    summary.style.animation = 'pulse 0.5s ease-in-out';
    showMessage('HACKER MODE ACTIVATED!', true);
}

function checkPassword() {
    const userPassword = prompt('Please enter your password:');
    
    if (userPassword === password) {
        unlockAdmin();
    } else {
        showMessage('FRUAD ALERT!', false);
    }
    
    graveKeyCount = 0;
}

// Desktop: Grave key triple press
document.addEventListener('keydown', (e) => {
    if (isAuthenticated) return;
    
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        
        graveKeyCount++;
        
        if (graveKeyTimeout) {
            clearTimeout(graveKeyTimeout);
        }
        
        graveKeyTimeout = setTimeout(() => {
            graveKeyCount = 0;
        }, 2000);
        
        if (graveKeyCount >= 3) {
            graveKeyCount = 0;
            clearTimeout(graveKeyTimeout);
            checkPassword();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('footer');
    
    if (footer) {
        footer.addEventListener('touchstart', (e) => {
            if (isAuthenticated) return;
            
            tapCount++;
            
            if (tapTimeout) {
                clearTimeout(tapTimeout);
            }
            
            tapTimeout = setTimeout(() => {
                tapCount = 0;
            }, 2000);
            
            if (tapCount >= 3) {
                tapCount = 0;
                clearTimeout(tapTimeout);
                e.preventDefault();
                checkPassword();
            }
        }, { passive: false });
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-52%, -50%); }
        20%, 40%, 60%, 80% { transform: translate(-48%, -50%); }
    }
`;
document.head.appendChild(style);

  
