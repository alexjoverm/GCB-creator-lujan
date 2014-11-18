'use strict';

/**
 * @ngdoc function
 * @name pppApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pppApp
 */
angular.module('gcbCreatorApp')
  .controller('AboutCtrl',['$scope',  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
