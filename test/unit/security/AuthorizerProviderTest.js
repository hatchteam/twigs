'use strict';

describe('AuthorizerProvider', function () {


  var AuthorizerProvider;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', []);

    fakeModule.config(function (_AuthorizerProvider_) {
      AuthorizerProvider = _AuthorizerProvider_;
    });
    // Initialize module injector
    angular.mock.module('twigs.security', 'testApp');

    // Kickstart the injectors previously registered with calls to angular.mock.module
    inject(function () {
    });
  });

  it('allows to register a user loader', function () {
    expect(AuthorizerProvider).toBeDefined();
    expect(AuthorizerProvider.registerUserLoaderFunction).toBeDefined();
    AuthorizerProvider.registerUserLoaderFunction(angular.foo);
  });

  it('allows to register a permission evaluation function', function () {
    expect(AuthorizerProvider).toBeDefined();
    expect(AuthorizerProvider.registerPermissionEvaluator).toBeDefined();
    AuthorizerProvider.registerPermissionEvaluator(angular.foo);
  });


});
