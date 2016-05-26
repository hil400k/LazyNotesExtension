angular.module("app")

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

            scope.control.show = function(msg) {
                if (msg) {
                    loader.css({
                        display: 'none'
                    });
                    message.text(msg);
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
        link: function(scope, elem, attrs) {console.info('hello');
            elem.on('blur', scope.handler);
        }
    }
})
