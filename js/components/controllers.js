angular.module("app")

.controller("MainController", function($scope, AuthService, NotesService) {
    var self = this;

    self.init = function() {
//        self.loginUrl = 'http://localhost:8000/#/login';
//        self.settingsUrl = 'http://localhost:8000/#/settings';
        self.loginUrl = 'https://lazynotes.firebaseapp.com/#/login';
        self.settingsUrl = 'https://lazynotes.firebaseapp.com/#/settings';
        self.userObject = AuthService.$getAuth();
        self.lsButtonMode = true;
        self.notifyControl = {};

        self.lsButtonManage = function() {
            chrome.tabs.create({url: self.loginUrl});
        };
        if (!self.userObject) {

        } else {
            self.lsButtonManage = function() {
                chrome.tabs.create({url: self.settingsUrl});
            };
            self.lsButtonMode = false;
        }

        $scope.$watch(() => self.notifyControl, function (control) {
            if (self.userObject) {
                control.show();
            } else {
                control.show('Please, login to have ability to make a note!');
            }
        }, true);
    };

    self.init();
})
.controller("ListController", function($scope, $filter, NotesService, AuthService, hotkeys) {
    var self = this;

    self.init = function() {
        var dirty = false;

        self.list = [];
        self.shouldBeOpen = true;
        self.logged = AuthService.$getAuth();
        self.ncurrent = NotesService.initNote();
        self.ncurrent.dateOfCreation = NotesService.getCurrentDate();

        self.saveNote = function() {
            var ncurrent = self.ncurrent;

            if (ncurrent.text === '') return;
            $scope.mc.notifyControl.show();
            dirty = false;
            self.ncurrent = NotesService.initNote();
            self.ncurrent.dateOfCreation = NotesService.getCurrentDate();

            NotesService.saveNote(ncurrent).then(function() {
                NotesService.getListPartial()
                    .then(getListPartialSuccess);
            });
        };

        self.updatedNote = function(uid) {
            var note = self.list.filter(function(item) {
                return item.$id == uid;
            })[0];

            if (note.text.length) {
                $scope.mc.notifyControl.show();

                NotesService.updateNote(note).then(function() {
                    NotesService.getListPartial()
                        .then(getListPartialSuccess);
                });
            }
        };

        self.removeNote = function(e) {
            var uid = e.currentTarget.getAttribute('data-uid');

            $scope.mc.notifyControl.show();
            NotesService.removeNote(uid).then(function() {
                NotesService.getListPartial()
                        .then(getListPartialSuccess);
            })
        };

        self.showInstruction = function() {
            $scope.mc.notifyControl.show('Press "Ctrl + Enter" to save note!');
        };

        self.hideNotifier = function() {
            $scope.mc.notifyControl.hide();
        };

        $scope.$watch(() => self.ncurrent.text, function(newValue) {
            if (newValue) {
                dirty = true;
                $scope.mc.notifyControl.show('Press "Ctrl + Enter" to save note!');
            } else if (dirty && !newValue.length) {
                $scope.mc.notifyControl.hide();
            }
        }, true)

        hotkeys.add({
            combo: 'ctrl+enter',
            allowIn: ['TEXTAREA'],
            callback: function(event, hotkey) {
                var tarea = event.target,
                    uid = null;

                if (tarea.nodeName === 'TEXTAREA') {
                    uid = tarea.getAttribute('data-uid');
                    if (uid) {
                        self.updatedNote(uid);
                    } else {
                        self.saveNote();
                    }
                }

            }
        });

        if (self.logged) {
            NotesService.getListPartial()
                .then(getListPartialSuccess);
        }
    };

    self.init();

    function getListPartialSuccess(list) {
        self.list = list;
        self.list.forEach(function(item, i) {
            item.dateToDisplay = getDateToDisplay(item.dateOfEditing);
        });
        self.list = $filter('orderBy')(self.list, 'dateOfEditing', true);
        $scope.mc.notifyControl.hide();
    }

    function getDateToDisplay(timestampDate) {
        var date = new Date(timestampDate),
            hours = date.getHours(),
            minutes = "0" + date.getMinutes(),
            year = date.getFullYear().toString(),
            month = '' + (date.getMonth() + 1),
            day = '' + date.getDate(),
            formattedDateTime = null;

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            formattedDateTime = hours + ':' + minutes.substr(-2) + ' ' + day + ':' + month + ':' + year;

        return {
            fullDate: formattedDateTime,
            time: hours + ':' + minutes.substr(-2),
            date: day + ':' + month + ':' + year
        };
    }


})
