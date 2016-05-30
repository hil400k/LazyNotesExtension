(function(){
    window.onhashchange = function() {
        var userObject = localStorage['firebase:session::lazynotes'] || null,
            settings = localStorage['settings'] || null;

        chrome.storage.local.set({'firebase:session::lazynotes': userObject});
        chrome.storage.local.set({'settings': settings});

        chrome.runtime.sendMessage('user-setted');
    };
}());
