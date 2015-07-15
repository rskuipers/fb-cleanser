var messageNamespace = 'fbcleanser';

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.from !== messageNamespace) {
        return;
    }

    switch (msg.subject) {
        case 'showPageAction':
            chrome.pageAction.show(sender.tab.id);
            break;
        case 'disabledPageAction':
            chrome.pageAction.setIcon({"tabId": sender.tab.id, "path": "icon-disabled.png"});
            break;
        case 'enabledPageAction':
            chrome.pageAction.setIcon({"tabId": sender.tab.id, "path": "icon-enabled.png"});
            break;
    }
});

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {
        from: messageNamespace,
        subject: 'toggle'
    });
});
