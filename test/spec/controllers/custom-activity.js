'use strict';

describe('Controller: CustomActivityCtrl', function () {

  // load the controller's module
  beforeEach(module('gcbCreatorApp'));

  var CustomActivityCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CustomActivityCtrl = $controller('CustomActivityCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
