describe('twgSecureShow', function () {

  var
    AuthorizerProvider,
    Authorizer,
    $rootScope,
    $scope,
    $compile,
    dummyUserPermissions = {
      'stocks': ['read', 'delete', 'update']
    },
    dummyUserObject = {
      username: 'admin',
      roles: ['ADMIN', 'USER'],
      permissions: dummyUserPermissions
    };

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

  beforeEach(inject(function (_Authorizer_, _$rootScope_, _$compile_) {
    Authorizer = _Authorizer_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;

    $scope = $rootScope.$new();

    hasResolvingRegisteredUserLoader();
  }));

  function hasResolvingRegisteredUserLoader() {
    AuthorizerProvider.registerUserLoaderFunction(function ($q) {
      return function () {
        var newDeferred = $q.defer();
        newDeferred.resolve(dummyUserObject);
        return newDeferred.promise;
      };
    });
  }


  function whenCompiling(element) {
    var compiledElement = $compile(element)($scope);
    $scope.$digest();
    return compiledElement;
  }

  it('hides element if hasPermission returns false', function () {

    spyOn(Authorizer, 'hasPermission').and.returnValue(false);

    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show="hasPermission(\'super\')"></div> </div>');
    var compiledElement = whenCompiling(element);

    expect(Authorizer.hasPermission).toHaveBeenCalledWith('super');
    expect(Authorizer.hasPermission.calls.count()).toBe(1);

    var testElement = compiledElement.find('#testElement');
    expect(testElement.eq(0).hasClass('ng-hide')).toBe(true);
  });

  it('shows element if hasPermission returns true', function () {

    spyOn(Authorizer, 'hasPermission').and.returnValue(true);

    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show="hasPermission(\'super\')"></div> </div>');
    var compiledElement = whenCompiling(element);

    expect(Authorizer.hasPermission).toHaveBeenCalledWith('super');
    expect(Authorizer.hasPermission.calls.count()).toBe(1);

    var testElement = compiledElement.find('#testElement');
    expect(testElement.eq(0).hasClass('ng-hide')).toBe(false);
  });

  it('shows element if isAuthenticated returns true', function () {

    spyOn(Authorizer, 'isAuthenticated').and.returnValue(true);

    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show="isAuthenticated()"></div> </div>');
    var compiledElement = whenCompiling(element);

    expect(Authorizer.isAuthenticated).toHaveBeenCalled();
    expect(Authorizer.isAuthenticated.calls.count()).toBe(1);

    var testElement = compiledElement.find('#testElement');
    expect(testElement.eq(0).hasClass('ng-hide')).toBe(false);
  });

  it('hides element if isAuthenticated returns false', function () {

    spyOn(Authorizer, 'isAuthenticated').and.returnValue(false);

    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show="isAuthenticated()"></div> </div>');
    var compiledElement = whenCompiling(element);

    expect(Authorizer.isAuthenticated).toHaveBeenCalled();
    expect(Authorizer.isAuthenticated.calls.count()).toBe(1);

    var testElement = compiledElement.find('#testElement');
    expect(testElement.eq(0).hasClass('ng-hide')).toBe(true);
  });


  it('throws if expression is invalid: empty', function () {
    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show=""></div> </div>');
    expect(function () {
      whenCompiling(element);
    }).toThrow('Invalid permission expression: cannot be empty string or undefined ()');
  });

  it('throws if expression is invalid: unknown expression', function () {
    var element = angular.element('<div class="content"> <div id="testElement" twg-secure-show="someThingElse"></div> </div>');
    expect(function () {
      whenCompiling(element);
    }).toThrow('Invalid permission expression: someThingElse');
  });

});

