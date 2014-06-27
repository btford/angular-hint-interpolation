angular.module('ngHintInterpolations', ['testModule', 'ngRoute'])
  .config(['$provide', '$routeProvider', function($provide, $routeProvider) {
    var ngHintInterpMessages = [];
    $routeProvider.when('/', {
        controller: 'iEyeController',
        controllerAs: 'iCtrl',
        templateUrl: 'components/iEyeDemo.html'
      }).
      otherwise({redirectTo: '/'});
    $provide.decorator('$interpolate', ['$delegate', '$timeout', function($delegate, $timeout) {
      var currentPromises;
      var delayDisplay = function(messages) {
        $timeout.cancel(currentPromises);
        currentPromises = $timeout(function() {
          displayMessages(messages);
        }.bind(this),250)
      }
      var displayMessages = function(messages){
        console.groupCollapsed('Angular Hint: Interpolations');
        messages.forEach(function(error) {
          console.warn(error);
        })
        console.groupEnd();
      }
      var interpolateWrapper = function() {
        var interpolationFn = $delegate.apply(this, arguments);
        if(interpolationFn) {
          var argC = arguments.callee;
          var parts = iEye.getAllParts(arguments[0],argC.startSymbol(),argC.endSymbol());
          var results = [];
          var temp = interpolationFnWrap(interpolationFn,arguments, parts);
          return temp;
        }
      }
      var interpolationFnWrap = function(interpolationFn, interpolationArgs, allParts) {
        return function(){
          var result = interpolationFn.apply(this, arguments);
          var original = interpolationArgs[0];
          var args = arguments[0];
          var found = false;
          var message;
          allParts.forEach(function(part) {
            if(!args.$eval(part) && !found){
              found = true;
              message = part+' was found to be undefined in "'+original.trim()+'".';
            }
          })
          if(message && ngHintInterpMessages.indexOf(message) < 0) {
            ngHintInterpMessages.push(message);
            delayDisplay(ngHintInterpMessages);
          }
          return result;
        };
      }
      angular.extend(interpolateWrapper,$delegate);
      return interpolateWrapper;
    }]);
  }]);
