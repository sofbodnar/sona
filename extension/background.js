chrome.runtime.onInstalled.addListener(() => {
  console.log('Sona Research Assistant installed');
  
  // Create context menu for highlighted text
  chrome.contextMenus.create({
    id: "askSona",
    title: "Ask Sona about this",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "askSona") {
    // Send selected text to content script for processing
    chrome.tabs.sendMessage(tab.id, {
      action: "explainText",
      selectedText: info.selectionText
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getExplanation") {
    // This will later call our backend API
    fetch('http://localhost:5000/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        context: request.context
      })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, explanation: data.explanation });
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "saveToSession") {
    // Save research data to Chrome storage
    chrome.storage.local.get(['currentSession'], (result) => {
      const session = result.currentSession || { concepts: [], urls: [], timestamp: Date.now() };
      session.concepts.push(request.concept);
      session.urls.push(request.url);
      
      chrome.storage.local.set({ currentSession: session });
    });
  }
});