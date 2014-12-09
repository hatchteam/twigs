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
       * @name twigs.security.provider:AuthorizerProvider#user
       * @propertyOf twigs.security.provider:AuthorizerProvider
       *
       * @description
       *  The user object
       */
      user = {},

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
       * @name twigs.security.provider:AuthorizerProvider#permissionEvaluatorFunction
       * @propertyOf twigs.security.provider:AuthorizerProvider
       *
       * @description
       *   The evaluator function (register via .registerPermissionEvaluationFunction()
       */
      permissionEvaluatorFunction,

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
     * Registers the evaluation function for evaluating permissions.
     * Permissions service will pass in the users permission, and the needed permissions (arguments)
     *
     * ```javascript
     * AuthorizerProvider.registerPermissionEvaluationFunction(function () {
         *       return function (user, args) {
         *          // decide upon users permissions and args.
         *          // return true or false
         *          return true:
         *      };
         *   });
     * ```
     *
     * @param {function} fn The evaluator function
     */
    this.registerPermissionEvaluationFunction = registerPermissionEvaluationFunction;


    function registerUserLoaderFunction(loaderFunction) {
      userLoaderFunction = loaderFunction;
    }

    function registerPermissionEvaluationFunction(evaluationFunction) {
      permissionEvaluatorFunction = evaluationFunction;
    }

    /**
     * @ngdoc object
     * @name twigs.security.service:Authorizer
     *
     **/
    this.$get = Authorizer;

    function Authorizer($rootScope, $q, $injector, UserObjectSanityChecker) {

      function isAuthenticated() {
        var deferred = $q.defer();

        if (isCurrentlyLoadingUser()) {
          getCurrentUser()
            .then(function () {
              deferred.resolve(true);
            },
            function () {
              deferred.resolve(false);
            });
        } else if (isUserLoaded()) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }

        return deferred.promise;
      }

      function hasPermission() {
        if (angular.isUndefined(permissionEvaluatorFunction)) {
          throw new Error('No PermissionEvaluatorFunction defined! Call AuthorizerProvider.registerPermissionEvaluationFunction(fn) first!');
        }

        var deferred = $q.defer();
        var evalFn = $injector.invoke(permissionEvaluatorFunction);

        if (isCurrentlyLoadingUser()) {
          getCurrentUser()
            .then(function () {
              deferred.resolve(evalFn(user, arguments));
            },
            function () {
              deferred.resolve(false);
            });
        } else if (isUserLoaded()) {
          deferred.resolve(evalFn(user, arguments));
        } else {
          deferred.resolve(false);
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
          var deferred = $q.defer();
          deferred.resolve(user);
          return deferred.promise;
        } else if (isCurrentlyLoadingUser()) {
          return userLoadingPromise;
        } else {
          userLoadingPromise = loadUser()
            .then(function (user) {
              $rootScope.$broadcast('userInitialized');
              return user;
            });

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
         * 'isAuthenticated()' will return false
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
         *  Will not trigger a userLoad. If loading of user is pending, will wait for promise to be resolved/rejected.
         *
         * @param {object[]} arguments Any number of parameters. Will be passed on to evaluator function.
         * @returns {promise} Resolves to true if current user has needed permission(s)
         */
        hasPermission: hasPermission,

        /**
         * @ngdoc function
         * @name twigs.security.service:Authorizer#isAuthenticated
         * @methodOf twigs.security.service:Authorizer
         *
         * @description
         *  Will not trigger a userLoad. If loading of user is pending, will wait for promise to be resolved/rejected.
         *
         * @returns {promise} Resolves to true if current user is loaded.
         */
        isAuthenticated: isAuthenticated
      };
    }

  });
