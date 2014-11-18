'use strict';

describe('Controller: AssesmentCtrl', function () {

  // load the controller's module
  beforeEach(module('gcbCreatorApp'));

  var AssesmentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssesmentCtrl = $controller('AssesmentCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
