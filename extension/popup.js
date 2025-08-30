document.addEventListener('DOMContentLoaded', () => {
    loadSessionData();
    
    document.getElementById('newSession').addEventListener('click', startNewSession);
    document.getElementById('exportSession').addEventListener('click', exportSession);
    document.getElementById('viewHistory').addEventListener('click', viewHistory);
});

function loadSessionData() {
    chrome.storage.local.get(['currentSession'], (result) => {
        const session = result.currentSession || { concepts: [], urls: [], timestamp: Date.now() };
        
        document.getElementById('conceptCount').textContent = session.concepts.length;
        document.getElementById('urlCount').textContent = session.urls.length;
        
        const conceptList = document.getElementById('conceptList');
        if (session.concepts.length > 0) {
            conceptList.innerHTML = session.concepts
                .slice(-5) // Show last 5 concepts
                .map(concept => `<div class="concept-item">${concept.text}</div>`)
                .join('');
        }
    });
}

function startNewSession() {
    chrome.storage.local.set({ 
        currentSession: { 
            concepts: [], 
            urls: [], 
            timestamp: Date.now(),
            id: generateSessionId()
        } 
    }, () => {
        loadSessionData();
        showNotification('New research session started!');
    });
}

function exportSession() {
    chrome.storage.local.get(['currentSession'], (result) => {
        const session = result.currentSession || { concepts: [], urls: [], timestamp: Date.now() };
        
        if (session.concepts.length === 0 && session.urls.length === 0) {
            showNotification('No data to export');
            return;
        }
        
        // Create export data
        const exportData = {
            sessionId: session.id || generateSessionId(),
            timestamp: new Date(session.timestamp).toISOString(),
            summary: {
                totalConcepts: session.concepts.length,
                totalUrls: session.urls.length,
                concepts: session.concepts,
                urls: session.urls
            }
        };
        
        // Download as JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        chrome.downloads.download({
            url: url,
            filename: `sona-session-${new Date().toISOString().split('T')[0]}.json`
        });
        
        showNotification('Session exported successfully!');
    });
}

function viewHistory() {
    // This will open a new tab with session history
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function showNotification(message) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4A90E2;
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}