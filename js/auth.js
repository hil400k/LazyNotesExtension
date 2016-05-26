(function(){
    window.onhashchange = function() {
        var userObject = localStorage['firebase:session::lazynotes'] || null;
        chrome.storage.local.set({'firebase:session::lazynotes': userObject});
        chrome.runtime.sendMessage('user-setted');
    };
}());
