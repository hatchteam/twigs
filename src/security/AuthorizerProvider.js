'use strict';

angular.module('twigs.security')


/**
 * @ngdoc object
 * @name twigs.security.provider:AuthorizerProvider
 *
 * @description
 *
 **/
  .provider('Authorizer', function () {

    var

      /**
       * @ngdoc property
       * @name twigs.security.provider:AuthorizerProvider#userLoaderFunction
       * @propertyOf twigs.security.provider:AuthorizerProvider
       *
       * @description
       *  The userLoader function (register via .registerUserLoaderFunction()
       */
      userLoaderFunction,

      /**
       * @ngdoc property
       * @name twigs.security.provider:AuthorizerProvider#permissionEvaluator
       * @propertyOf twigs.security.provider:AuthorizerProvider
       *
       * @description
       *   The evaluator function (register via .registerPermissionEvaluator()
       */
      permissionEvaluator;


    /**
     * @ngdoc function
     * @name twigs.security.provider:AuthorizerProvider#registerUserLoader
     * @methodOf twigs.security.provider:AuthorizerProvider
     *
     * @description
     * Registers the loader function to load the user Object. The given loader function must return
     * a promise which resolves to the user Object.
     * The user object is expected to be of the form:
     *
     * ```javascript
     *  {
         *   username:'John',
         *   permissions:[]
         *  }
     * ```
     *
     * It is valid to resolve to a user object which has additional properties.
     *
     * ```javascript
     * AuthorizerProvider.registerUserLoader(function ($q, $resource) {
         *       return function () {
         *           var deferred = $q.defer();
         *           $resource('/users/current').get({},
         *               function (data) {
         *                  return deferred.resolve(data);
         *              }, function () {
         *                  return deferred.reject();
         *               });
         *
         *          return deferred.promise;
         *      };
         *   });
     * ```
     *
     * @param {function} loader The user loader function
     */
    this.registerUserLoaderFunction = registerUserLoaderFunction;

    /**
     * @ngdoc function
     * @name twigs.security.provider:AuthorizerProvider#registerPermissionEvaluationFunction
     * @methodOf twigs.security.provider:AuthorizerProvider
     *
     * @description
     * Registers the permission evaluator for evaluating permissions.
     * Your evaluator must return a evaluation function.
     * Authorizer will pass in the user object, and the needed permissions (arguments)
     *
     * ```javascript
     * AuthorizerProvider.registerPermissionEvaluationFunction(function (SomeCollaborator) {
         *       return function (user, args) {
         *          // decide upon users permissions and args.
         *          // return true or false
         *
         *          // SomeCollaborator.foo()
         *
         *          return true:
         *      };
         *   });
     * ```
     *
     * @param {function} fn The evaluator function
     */
    this.registerPermissionEvaluator = registerPermissionEvaluator;


    function registerUserLoaderFunction(loaderFunction) {
      userLoaderFunction = loaderFunction;
    }

    function registerPermissionEvaluator(evaluator) {
      permissionEvaluator = evaluator;
    }

    /**
     * @ngdoc object
     * @name twigs.security.service:Authorizer
     *
     **/
    this.$get = Authorizer;

    function Authorizer($rootScope, $q, $injector, UserObjectSanityChecker) {

      var
        /**
         * @ngdoc property
         * @name twigs.security.provider:AuthorizerProvider#user
         * @propertyOf twigs.security.provider:AuthorizerProvider
         *
         * @description
         *  The user object
         */
        user = {},
        /**
         * @ngdoc property
         * @name twigs.security.provider:AuthorizerProvider#userLoadingPromise
         * @propertyOf twigs.security.provider:AuthorizerProvider
         *
         * @description
         *  we remember, that we are already loading the user.
         *  A second call to "Authorizer.getUser()" while the first call ist still waiting for a server-response,
         *  will receive the same promise;
         */
        userLoadingPromise;


      function isLoggedIn() {
        var deferred = $q.defer();

        if (isCurrentlyLoadingUser()) {
          getCurrentUser()
            .then(function () {
              deferred.resolve(true);
            }, function () {
              deferred.resolve(false);
            });
        } else if (isUserLoaded()) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }

        return deferred.promise;
      }

      function hasPermission(permission) {
        if (angular.isUndefined(permissionEvaluator)) {
          throw new Error('No PermissionEvaluator defined! Call AuthorizerProvider.registerPermissionEvaluator(fn) first!');
        }

        if (!permission || typeof permission !== 'object') {
          throw new Error('No permission object to check!');
        }

        if (Object.prototype.toString.call(permission) === '[object Array]') {
          throw new Error('Permission to check must be an object, but array given!');
        }

        var deferred = $q.defer();
        var evalFn = $injector.invoke(permissionEvaluator);

        if (isUserLoaded()) {
          // if user is already loaded, invoke evaluatorFunction
          deferred.resolve(evalFn(user, permission));
        } else {
          // if user is not yet loaded or is currently loading, wait for promise
          getCurrentUser()
            .then(function () {
              deferred.resolve(evalFn(user, permission));
            },
            function () {
              deferred.resolve(false);
            });
        }

        return deferred.promise;
      }

      function loadUser() {
        if (angular.isUndefined(userLoaderFunction)) {
          throw new Error('No UserLoaderFunction defined! Call AuthorizerProvider.registerUserLoaderFunction(fn) first!');
        }

        var
          deferred = $q.defer(),
          loaderFn = $injector.invoke(userLoaderFunction);

        loaderFn()
          .then(function (data) {
            if (!UserObjectSanityChecker.isSane(data)) {
              deferred.reject(new Error('Loaded user object did not pass sanity check!'));
            } else {
              user = data;
              $rootScope.$broadcast('userLoaded');
              deferred.resolve(data);
            }
          }, function () {
            deferred.reject();
          });

        return deferred.promise;
      }

      function isCurrentlyLoadingUser() {
        // We cannot use Promise.isPending() , since angular promise ($q) does not yet support it
        return ( angular.isDefined(userLoadingPromise) && angular.isUndefined(user.username));
      }

      function isUserLoaded() {
        return angular.isDefined(user.username);
      }

      function getCurrentUser() {
        if (isUserLoaded()) {
          return $q.when(user);
        } else if (isCurrentlyLoadingUser()) {
          return userLoadingPromise;
        } else {
          userLoadingPromise = loadUser();
          return userLoadingPromise;
        }
      }

      function clearSecurityContext() {
        user = {};
        userLoadingPromise = undefined;
        $rootScope.$broadcast('userCleared');
      }

      return {
        /**
         * @ngdoc function
         * @name twigs.security.service:Authorizer#getUser
         * @methodOf twigs.security.service:Authorizer
         *
         *
         * @description
         *  returns a promise, holding the current user. will load the user if necessary.
         *  Will broadcast the event "userLoaded" ont he $rootScope as soon as the user was successfully loaded from the backend.
         *
         *  @returns {object} The User object of the currently logged-in user
         */
        getUser: getCurrentUser,

        /**
         * @ngdoc function
         * @name twigs.security.service:Authorizer#clearSecurityContext
         * @methodOf twigs.security.service:Authorizer
         *
         * @description
         * Clears the securityContext. After invocation, no user object is loaded and
         * 'isLoggedIn()' will resolve to false.
         *
         * Will broadcast the event "userCleared" ont he $rootScope.
         *
         */
        clearSecurityContext: clearSecurityContext,

        /**
         * @ngdoc function
         * @name twigs.security.service:Authorizer#hasPermission
         * @methodOf twigs.security.service:Authorizer
         *
         * @description
         *  Will call registered evaluator function. Is mostly used in twigs.security directives.
         *
         * @param {object} permission Object that specifies the permissions to check. Will be passed on to evaluator function.
         * @returns {promise} Resolves to true if current user has needed permission(s)
         */
        hasPermission: hasPermission,

        /**
         * @ngdoc function
         * @name twigs.security.service:Authorizer#isLoggedIn
         * @methodOf twigs.security.service:Authorizer
         *
         * @description
         *  Checks whether a user was successfully loaded from the backend. If a userLoad is currently pending, this will wait for the promise
         *  to be resolved or rejected.
         *  This Will not trigger a userLoad by itself!
         *
         * @returns {promise} Resolves to true if a user is loaded.
         */
        isLoggedIn: isLoggedIn
      };
    }

  });
