'use strict';

describe('Controller: InstructionsCtrl', function () {

  // load the controller's module
  beforeEach(module('gcbCreatorApp'));

  var InstructionsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InstructionsCtrl = $controller('InstructionsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
