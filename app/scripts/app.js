/*global jQuery:false*/
'use strict';

/**
 * @ngdoc overview
 * @name pppApp
 * @description
 * # pppApp
 *
 * Main module of the application.
 */
var mainModule = angular.module('gcbCreatorApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.sortable',
    'mgcrea.ngStrap.helpers.dimensions',
    'mgcrea.ngStrap.scrollspy',
    'mgcrea.ngStrap.affix',
    'LocalStorageModule'
]);

// Configuramos namespace del localstorage
mainModule.config(function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('gcbls');
});

mainModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
    })
    .when('/instrucciones', {
      templateUrl: 'views/instructions.html',
      controller: 'InstructionsCtrl',
      reloadOnSearch: false
    })
    .when('/actividad', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .when('/examen', {
      templateUrl: 'views/assesment.html',
      controller: 'AssesmentCtrl'
    })
    .when('/custom-activity', {
      templateUrl: 'views/custom-activity.html',
      controller: 'CustomActivityCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
}]);

//Add this to have access to a global variable
mainModule.run(function ($rootScope) {
    $rootScope.vista = { state: true }; //global variable
    
    $rootScope.ChangeVista = function(st){
        $rootScope.vista.state = st;
    }
});



mainModule.directive('contenteditable', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          //element.html($sce.getTrustedHtml(ngModel.$viewValue)); // NO SE DEBE HACER ESTO, PIERDE EL FORMATO
            element.html(ngModel.$viewValue);
        };

        // Listen for change events to enable binding
        element.on('blur', function() {
          scope.$apply(read);
        });
            
        //read(); // NO SE DEBE INICIALIZAR

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if ( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  }]);


mainModule.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () { 
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});



//******* FILTROS
mainModule.filter('unsafe',['$sce',  function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}]);

mainModule.filter('isUndefined', function() {
    return function(val) {
        return (val === undefined);
    };
});


//*********************  ANIMACIONES
// Animacion de las preguntas sd

mainModule.animation('.question-wrapper', function() {
    return {
        enter : function(element, done) { 
            jQuery(element).css({ 'opacity': 0 });
            jQuery(element).animate({'opacity': 1 }, 400, done);
        },

        /*leave : function(element, done) {
            jQuery(element).css({'opacity': 1 });
            jQuery(element).animate({'opacity': 0 }, 400, done);
        }*/
    };
});

mainModule.controller('HeaderController',['$scope','$location',  function ($scope, $location) {
    
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
}]);
