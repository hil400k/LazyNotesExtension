angular.module("app", ['ui.bootstrap', 'firebase', 'monospaced.elastic'])
.constant('firebaseUrl', 'https://lazynotes.firebaseio.com')
.controller("MainController", function($scope, AuthService, NotesService) {
    var self = this;

    self.init = function() {
        self.loginUrl = 'http://localhost:8000/#/login';
        self.settingsUrl = 'http://localhost:8000/#/settings';
        self.userObject = AuthService.$getAuth();
        self.lsButtonMode = true;
        self.notifyControl = {};

        self.lsButtonManage = function() {
            chrome.tabs.create({url: self.loginUrl});
        };
        if (!self.userObject) {
//            self.lsButtonManage();
        } else {
            self.lsButtonManage = function() {
                chrome.tabs.create({url: self.settingsUrl});
            };
            self.lsButtonMode = false;
        }

        $scope.$watch(() => self.notifyControl, function (control) {
            control.show();
        }, true);

    };

    self.init();
})
.controller("ListController", function($scope, NotesService, AuthService) {
    var self = this;

    self.init = function() {
        self.list = [];
        self.shouldBeOpen = true;
        self.ncurrent = NotesService.initNote();
        self.ncurrent.dateOfCreation = NotesService.getCurrentDate();

        self.saveNote = function() {

        };


        NotesService.getListPartial()
            .then(function(list) {
            self.list = list;
            self.list.forEach(function(item, i) {
                item.dateToDisplay = getDateToDisplay(item.dateOfEditing);
            });
            $scope.mc.notifyControl.hide();
        })
    };
    
    if (AuthService.$getAuth()) {
        self.init();
    };

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

        return formattedDateTime;
    }
})
.service("AuthService", function($firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);

    return $firebaseAuth(ref);
})
.service("NotesService", function(AuthService, firebaseUrl, $firebaseArray) {
    var ns = {};
    
    if (AuthService.$getAuth()) {
        var uid = AuthService.$getAuth().uid;
        var ref = new Firebase(firebaseUrl);
        var notesRef = ref.child('notes');
        var notesArr = notesRef.child(uid + '-notes');

        ns.getListPartial = function() {
            return $firebaseArray(notesArr.orderByChild('dateOfEditing').limitToFirst(2)).$loaded();
        };

        ns.ncurrent = {};

        ns.initNote = function() {
            ns.ncurrent = {
                dateOfCreation: null,
                text: '',
                tags: '', // user default tag
                priority: 1,
                dateOfEditing: null,
                editingsCount: 0,
                sourceUrl: null
            };

            return ns.ncurrent;
        };

        ns.getCurrentDate = function() {
            var now     = new Date();
            var year    = now.getFullYear();
            var month   = now.getMonth()+1;
            var day     = now.getDate();
            var hour    = now.getHours();
            var minute  = now.getMinutes();
            if(month.toString().length == 1) {
                var month = '0'+month;
            }
            if(day.toString().length == 1) {
                var day = '0'+day;
            }
            if(hour.toString().length == 1) {
                var hour = '0'+hour;
            }
            if(minute.toString().length == 1) {
                var minute = '0'+minute;
            }
            var dateTime = hour + ':' + minute + ' ' + day + ':' + month + ':' + year;
             return dateTime;
        };
    } else {
        return null;
    }

    return ns;
})
.directive("notify", function() {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            control: '='
        },
        link: function(scope, elem, attrs) {
            var loader = elem.children().eq(0),
                message = elem.children().eq(1);

            scope.control.show = function(message) {
                if (message) {
                    loader.css({
                        display: 'none'
                    });
                    message.text(message);
                } else {
                    loader.css({
                        display: 'block'
                    });
                }
                elem.css({
                    display: 'block'
                });
            };

            scope.control.hide = function() {
                elem.css({
                    display: 'none'
                });
            };
        }
    }
})
.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
      element.bind('blur', function() {
        scope.$apply(model.assign(scope, false));
      })
    }
  };
})
.directive('noteInput', function() {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            handler: '&'
        },
        link: function(scope, elem, attrs) {
            elem.on('blur', scope.handler);
        }
    }
})
