let sonaTooltip = null;
let selectedText = '';

// Initialize content script
function init() {
    // Listen for text selection
    document.addEventListener('mouseup', handleTextSelection);
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'explainText') {
            showSonaPopup(request.selectedText);
        }
    });
}

function handleTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
        selectedText = text;
        showAskSonaButton();
        
        // Save URL to current session
        chrome.runtime.sendMessage({
            action: 'saveToSession',
            url: window.location.href,
            concept: { text: text, timestamp: Date.now() }
        });
    } else {
        hideAskSonaButton();
    }
}

function showAskSonaButton() {
    hideAskSonaButton(); // Remove existing button
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const button = document.createElement('div');
    button.id = 'sona-ask-button';
    button.innerHTML = `
        <div style="
            position: fixed;
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            background: #4A90E2;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        ">
            Ask Sona? 🧠
        </div>
    `;
    
    button.addEventListener('click', () => {
        showSonaPopup(selectedText);
        hideAskSonaButton();
    });
    
    button.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.background = '#357ABD';
    });
    
    button.addEventListener('mouseleave', (e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.background = '#4A90E2';
    });
    
    document.body.appendChild(button);
    
    // Auto-hide after 5 seconds
    setTimeout(hideAskSonaButton, 5000);
}

function hideAskSonaButton() {
    const existingButton = document.getElementById('sona-ask-button');
    if (existingButton) {
        existingButton.remove();
    }
}

function showSonaPopup(text) {
    hideSonaPopup(); // Remove existing popup
    
    // Create loading popup first
    const popup = document.createElement('div');
    popup.id = 'sona-popup';
    popup.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4A90E2; font-size: 16px;">Sona Explanation</h3>
                <button id="sona-close" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                ">×</button>
            </div>
            <div style="border-left: 3px solid #4A90E2; padding-left: 12px; margin-bottom: 15px;">
                <strong style="color: #333;">"${text}"</strong>
            </div>
            <div id="sona-content" style="color: #555; line-height: 1.6;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 16px; height: 16px; border: 2px solid #4A90E2; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    Analyzing with Sona...
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(popup);
    
    // Add event listener for close button
    document.getElementById('sona-close').addEventListener('click', hideSonaPopup);
    
    // Click outside to close
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            hideSonaPopup();
        }
    });
    
    // Request explanation from background script
    chrome.runtime.sendMessage({
        action: 'getExplanation',
        text: text,
        context: getPageContext()
    }, (response) => {
        const content = document.getElementById('sona-content');
        if (response && response.success) {
            content.innerHTML = `
                <div style="margin-bottom: 15px;">
                    ${response.explanation}
                </div>
                <div style="border-top: 1px solid #eee; padding-top: 15px;">
                    <small style="color: #666;">
                        💡 <strong>Related Resources:</strong><br>
                        <a href="#" style="color: #4A90E2; text-decoration: none;">Search YouTube</a> |
                        <a href="#" style="color: #4A90E2; text-decoration: none;">Find Papers</a> |
                        <a href="#" style="color: #4A90E2; text-decoration: none;">More Examples</a>
                    </small>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="color: #e74c3c;">
                    ⚠️ Sorry, I couldn't fetch an explanation right now. The backend server might be down.
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    Make sure the Sona server is running on localhost:5000
                </div>
            `;
        }
    });
}

function hideSonaPopup() {
    const existingPopup = document.getElementById('sona-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
}

function getPageContext() {
    // Get some context about the current page
    return {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        // Get first 500 characters of visible text as context
        pageText: document.body.innerText.slice(0, 500)
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}