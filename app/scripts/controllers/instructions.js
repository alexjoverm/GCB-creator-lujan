'use strict';

/**
 * @ngdoc function
 * @name gcbCreatorApp.controller:InstructionsCtrl
 * @description
 * # InstructionsCtrl
 * Controller of the gcbCreatorApp
 */
angular.module('gcbCreatorApp').controller('InstructionsCtrl', ['$scope','$location','$anchorScroll','$rootScope', function ($scope, $location, $anchorScroll, $rootScope) {
    
    $scope.scrollTo= function (id){ 
        $rootScope.ChangeVista(false);
        $location.hash(id);
        $anchorScroll();
    };
    
}]);
