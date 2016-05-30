chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    var storageKeys = [
        'firebase:session::lazynotes',
        'settings'
    ];

    if (response === 'user-setted') {
        chrome.storage.local.get(storageKeys, function (items) {
            storageKeys.forEach(function(item, i) {
                if (!localStorage[item]) {
                    localStorage[item] = items[item];
                    chrome.storage.local.remove(item);
                }
            })
        });
    }
});
