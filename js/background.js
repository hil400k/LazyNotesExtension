chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    var storageKey = 'firebase:session::lazynotes';
    if (response === 'user-setted') {
        chrome.storage.local.get(storageKey, function (item) {console.info(item);
            if (!localStorage[storageKey]) {
                localStorage[storageKey] = item[storageKey];
                chrome.storage.local.remove(storageKey);
            }
        });
    }
});
