describe('twgProtected', function () {

  var
    AuthorizerProvider,
    Authorizer,
    $rootScope,
    $scope,
    $q,
    $compile;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', []);

    fakeModule.config(function (_AuthorizerProvider_) {
      AuthorizerProvider = _AuthorizerProvider_;
    });
    // Initialize module injector
    angular.mock.module('twigs.security', 'testApp');

  });

  beforeEach(inject(function (_Authorizer_, _$rootScope_, _$compile_, _$q_) {
    Authorizer = _Authorizer_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $q = _$q_;

    $scope = $rootScope.$new();

    hasResolvingRegisteredUserLoader();
  }));

  function hasResolvingRegisteredUserLoader() {
    var dummyUserPermissions = {
      'stocks': ['read', 'delete', 'update']
    };

    var dummyUserObject = {
      username: 'admin',
      roles: ['ADMIN', 'USER'],
      permissions: dummyUserPermissions
    };

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

  describe('with twg-protected-hide set', function () {

    describe('with twg-protected true', function () {

      it('should hide element if no user is logged in', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve();
        var deferredGetUser = $q.defer();
        deferredGetUser.reject();

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="true" twg-protected-hide></div></div>');
        var compiledElement = whenCompiling(element);

        // twg-protected is set to "true", so no permissions need to be evaluated
        expect(Authorizer.hasPermission).not.toHaveBeenCalled();
        expect(Authorizer.getUser).toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).hasClass('ng-hide')).toBe(true);
      });

      it('should not hide element if no user is logged in', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve();
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="true" twg-protected-hide></div></div>');
        var compiledElement = whenCompiling(element);

        // twg-protected is set to "true", so no permissions need to be evaluated
        expect(Authorizer.hasPermission).not.toHaveBeenCalled();
        expect(Authorizer.getUser).toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('with twg-protected object', function () {

      it('should hide element if permissions not granted', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve(false);
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="{some:\'object\'}" twg-protected-hide></div></div>');
        var compiledElement = whenCompiling(element);

        expect(Authorizer.hasPermission).toHaveBeenCalled();
        expect(Authorizer.getUser).not.toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).hasClass('ng-hide')).toBe(true);
      });

      it('should not hide element if permissions are granted', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve(true);
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="{some:\'object\'}" twg-protected-hide></div></div>');
        var compiledElement = whenCompiling(element);

        expect(Authorizer.hasPermission).toHaveBeenCalled();
        expect(Authorizer.getUser).not.toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).hasClass('ng-hide')).toBe(false);
      });

    });

  });


  describe('with twg-protected-disable set', function () {

    describe('with twg-protected true', function () {

      it('should disable element if no user is logged in', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve();
        var deferredGetUser = $q.defer();
        deferredGetUser.reject();

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><input id="testElement" twg-protected="true" twg-protected-disable /></div>');
        var compiledElement = whenCompiling(element);

        // twg-protected is set to "true", so no permissions need to be evaluated
        expect(Authorizer.hasPermission).not.toHaveBeenCalled();
        expect(Authorizer.getUser).toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).attr('disabled')).toBe('disabled');
      });

      it('should not hide element if no user is logged in', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve();
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="true" twg-protected-disable></div></div>');
        var compiledElement = whenCompiling(element);

        // twg-protected is set to "true", so no permissions need to be evaluated
        expect(Authorizer.hasPermission).not.toHaveBeenCalled();
        expect(Authorizer.getUser).toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).attr('disabled')).toBeUndefined();
      });

    });

    describe('with twg-protected object', function () {

      it('should hide element if permissions not granted', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve(false);
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="{some:\'object\'}" twg-protected-disable></div></div>');
        var compiledElement = whenCompiling(element);

        expect(Authorizer.hasPermission).toHaveBeenCalled();
        expect(Authorizer.getUser).not.toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).attr('disabled')).toBe('disabled');
      });

      it('should not hide element if permissions are granted', function () {
        var deferredHasPermission = $q.defer();
        deferredHasPermission.resolve(true);
        var deferredGetUser = $q.defer();
        deferredGetUser.resolve({username: 'admin'});

        spyOn(Authorizer, 'hasPermission').and.returnValue(deferredHasPermission.promise);
        spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

        var element = angular.element('<div class="content"><div id="testElement" twg-protected="{some:\'object\'}" twg-protected-disable></div></div>');
        var compiledElement = whenCompiling(element);

        expect(Authorizer.hasPermission).toHaveBeenCalled();
        expect(Authorizer.getUser).not.toHaveBeenCalled();

        var testElement = compiledElement.find('#testElement');
        expect(testElement.eq(0).attr('disabled')).toBeUndefined();
      });

    });
  });


  describe('reevaluate on twg-protected attribute change', function () {

    it('should first show then hide element', function () {
      var deferredGetUser = $q.defer();
      deferredGetUser.resolve({username: 'admin'});

      spyOn(Authorizer, "hasPermission").and.callFake(function (permissionObject) {
        var deferredHasPermission = $q.defer();
        if (permissionObject.role === 'ADMIN') {
          deferredHasPermission.resolve(false);
        } else {
          deferredHasPermission.resolve(true);
        }
        return deferredHasPermission.promise;
      });

      spyOn(Authorizer, 'getUser').and.returnValue(deferredGetUser.promise);

      $scope.protection = {role: 'ADMIN'};

      var element = angular.element('<div class="content"><div id="testElement" twg-protected="protection" twg-protected-hide></div></div>');
      var compiledElement = whenCompiling(element);

      expect(Authorizer.hasPermission).toHaveBeenCalled();
      expect(Authorizer.getUser).not.toHaveBeenCalled();

      var testElement = compiledElement.find('#testElement');
      expect(testElement.eq(0).hasClass('ng-hide')).toBe(true);


      $scope.protection = {role: 'User'};

      $scope.$apply();

      // called again, second time permissions are given, hi
      expect(Authorizer.hasPermission.calls.count()).toBe(2);
      testElement = compiledElement.find('#testElement');
      expect(testElement.eq(0).hasClass('ng-hide')).toBe(false);


    });

  });

});

