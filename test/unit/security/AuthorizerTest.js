'use strict';

describe('Authorizer', function () {

  var
    AuthorizerProvider,
    Authorizer,
    $rootScope,
    userLoderInvocationCount,
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

  });

  beforeEach(inject(function (_Authorizer_, _$rootScope_) {
    Authorizer = _Authorizer_;
    $rootScope = _$rootScope_;
    userLoderInvocationCount = 0;
  }));

  function hasResolvingRegisteredUserLoader() {
    AuthorizerProvider.registerUserLoaderFunction(function ($q) {
      return function () {
        userLoderInvocationCount++;
        var newDeferred = $q.defer();
        newDeferred.resolve(dummyUserObject);
        return newDeferred.promise;
      };
    });
  }

  function hasRejectingRegisteredUserLoader() {
    AuthorizerProvider.registerUserLoaderFunction(function ($q) {
      return function () {
        userLoderInvocationCount++;
        var newDeferred = $q.defer();
        newDeferred.reject();
        return newDeferred.promise;
      };
    });
  }

  function hasAlwaysTruePermissionEvaluationFunction() {
    AuthorizerProvider.registerPermissionEvaluationFunction(function () {
      return function () {
        return true;
      };
    });
  }

  describe('#getUser()', function () {

    it('throws if no loaderFunction is registered', function () {
      expect(function gettingUser() {
        Authorizer.getUser();
      }).toThrowError('No UserLoaderFunction defined! Call AuthorizerProvider.registerUserLoaderFunction(fn) first!');
    });

    it('starts loading user if not already on it', function () {
      hasResolvingRegisteredUserLoader();
      Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);
    });

    it('does not start loading user again if already on it', function () {
      hasResolvingRegisteredUserLoader();

      Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);

      Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);

    });

    it('returns pending promise on second call', function () {
      hasResolvingRegisteredUserLoader();

      var promiseOne = Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);

      var promiseTwo = Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);
      expect(promiseOne).toBe(promiseTwo);

    });

    it('rejects currently pending getUser() when clearing security context', function (done) {
      hasResolvingRegisteredUserLoader();

      var promiseOne = Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);

      promiseOne.then(function () {
        done('This first promise should be rejected when calling clearSecurityContext()');
      }, function () {
        // this is expected.
        done();
      });

      Authorizer.clearSecurityContext();
      $rootScope.$apply();
    });

    it('Loads user again after clearing security context', function () {
      hasResolvingRegisteredUserLoader();

      var promiseOne = Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(1);

      Authorizer.clearSecurityContext();

      var promiseTwo = Authorizer.getUser();
      expect(userLoderInvocationCount).toBe(2);
      expect(promiseOne).not.toBe(promiseTwo);

    });

    it('correctly resolves with user from userLoaderFunction', function (done) {
      hasResolvingRegisteredUserLoader();

      Authorizer.getUser().then(function (user) {
        expect(user).toBe(dummyUserObject);
        done();
      });

      expect(userLoderInvocationCount).toBe(1);

      $rootScope.$apply();
    });

    it('returns loaded user on second call', function () {
      hasResolvingRegisteredUserLoader();
      var firstUserResult = undefined, secondUserResult = undefined;

      Authorizer.getUser()
        .then(function (user) {
          firstUserResult = user;
        });
      expect(userLoderInvocationCount).toBe(1);

      $rootScope.$apply();

      Authorizer.getUser()
        .then(function (user) {
          secondUserResult = user
        });
      $rootScope.$apply();

      expect(userLoderInvocationCount).toBe(1);

      expect(firstUserResult).toBe(dummyUserObject);
      expect(firstUserResult).toBe(secondUserResult);

    });

    it('does not allow insane user object', function (done) {

      // register a custom userLoaderFunction that will resolve to a invalid user object
      AuthorizerProvider.registerUserLoaderFunction(function ($q) {
        return function () {
          var newDeferred = $q.defer();
          newDeferred.resolve({
            some: 'insane',
            obj: 'damn'
          });
          return newDeferred.promise;
        };
      });


      Authorizer.getUser()
        .then(function () {
          done('This should not be resolved!')
        })
        .catch(function (err) {
          expect(err).toBeDefined();
          done();
        });

      $rootScope.$apply();

    });

  });


  describe('#clearSecurityContext()', function () {

    it('allows to clear the security context', function () {
      expect(Authorizer.clearSecurityContext).toBeDefined();
      Authorizer.clearSecurityContext();
    });

  });


  describe('#isAuthenticated()', function () {

    it('returns a promise', function () {
      hasResolvingRegisteredUserLoader();

      var authenticatedPromise = Authorizer.isAuthenticated();
      expect(authenticatedPromise).not.toBeUndefined();
      expect(authenticatedPromise.then).not.toBeUndefined();
    });

    it('resolves to true, if user was loaded', function (done) {
      hasResolvingRegisteredUserLoader();

      Authorizer.getUser()
        .finally(function () {

          Authorizer.isAuthenticated()
            .then(function (authenticated) {
              expect(userLoderInvocationCount).toBe(1);
              expect(authenticated).toBe(true);
              done();
            });

        });

      $rootScope.$apply();

    });

    it('resolves to false, if user could not be loaded', function (done) {

      hasRejectingRegisteredUserLoader();

      Authorizer.getUser()
        .finally(function () {
          Authorizer.isAuthenticated()
            .then(function (authenticated) {
              expect(userLoderInvocationCount).toBe(1);
              expect(authenticated).toBe(false);
              done();
            });

        });

      $rootScope.$apply();

    });

    it('resolves to false, if user was not loaded', function () {
      hasResolvingRegisteredUserLoader();

      var isAuthenticated = undefined;

      Authorizer.isAuthenticated()
        .then(function (authenticated) {
          isAuthenticated = authenticated;
        });

      $rootScope.$apply();
      expect(userLoderInvocationCount).toBe(0);
      expect(isAuthenticated).toBe(false);

    });

  });


  describe('#hasPermission()', function () {


    it('returns a promise', function () {
      hasResolvingRegisteredUserLoader();
      hasAlwaysTruePermissionEvaluationFunction();

      var permissionPromise = Authorizer.hasPermission();
      expect(permissionPromise).not.toBeUndefined();
      expect(permissionPromise.then).not.toBeUndefined();
    });

    it('should throw if no evaluator function is registered', function () {

      expect(function () {
        Authorizer.hasPermission();
      }).toThrowError('No PermissionEvaluatorFunction defined! Call AuthorizerProvider.registerPermissionEvaluationFunction(fn) first!');

    });

    it('should return true if user is loaded and permissions are given', function (done) {
      hasResolvingRegisteredUserLoader();
      hasAlwaysTruePermissionEvaluationFunction();

      Authorizer.getUser()
        .finally(function () {
          Authorizer.hasPermission()
            .then(function (result) {
              expect(result).toBe(true);
              done();
            });
        });

      $rootScope.$apply();
    });

    it('should invoke evaluationFunction with correct arguments', function (done) {
      hasResolvingRegisteredUserLoader();

      var evaluationFunctionCalled = false, customArgObjectOne = {name: 'one'}, customArgObjectTwo = {name: 'two'};

      AuthorizerProvider.registerPermissionEvaluationFunction(function () {
        return function (user, args) {
          expect(user).toBe(dummyUserObject);
          expect(args[0]).toBe(customArgObjectOne);
          expect(args[1]).toBe(customArgObjectTwo);

          evaluationFunctionCalled = true;
          return true;
        };
      });

      Authorizer.getUser()
        .finally(function () {
          Authorizer.hasPermission(customArgObjectOne, customArgObjectTwo)
            .then(function (result) {
              expect(evaluationFunctionCalled).toBe(true);
              expect(result).toBe(true);
              done();
            });
        });

      $rootScope.$apply();
    });

  });

});
