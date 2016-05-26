angular.module("app", ['ui.bootstrap', 'firebase', 'cfp.hotkeys', 'monospaced.elastic', 'ngSanitize'])
.config(function(hotkeysProvider) {
    hotkeysProvider.useNgRoute = false;
})
.constant('firebaseUrl', 'https://lazynotes.firebaseio.com')
