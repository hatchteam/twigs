'use strict';

/* twigs
 * Copyright (C) 2014, Hatch Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


angular.module('twigs.security', [])


    .service('UserObjectSanityChecker', function () {

        var EXPECTED_PROPERTIES = ['username', 'roles', 'permissions'];

        function _isSaneUserObject(userObject) {
            if (angular.isUndefined(userObject)) {
                return false;
            }

            var allPropertiesFound = true;
            EXPECTED_PROPERTIES.forEach(function (prop) {
                if (angular.isUndefined(userObject[prop])) {
                    allPropertiesFound = false;
                }
            });

            return allPropertiesFound;
        }

        return {
            isSane: _isSaneUserObject
        }
    })

/**
 * @ngdoc object
 * @name twigs.security.provider:PermissionsProvider
 *
 * @description
 *
 **/
    .provider('Permissions', function () {

        var
            /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#user
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  The user object
             */
                user = {},

            /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#userLoader
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  The userLoader function (register via .registerUserLoader()
             */
                userLoader,

            /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#permissionEvaluatorFunction
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *   The evaluator function (register via .registerPermissionEvaluationFunction()
             */
                permissionEvaluatorFunction,

            /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#userLoadingPromise
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  we remember, that we are already loading the user.
             *  A second call to "Permissions.user()" while the first call ist still waiting for a server-response,
             *  will receive the same promise;
             */
                userLoadingPromise;


        /**
         * @ngdoc function
         * @name twigs.security.provider:PermissionsProvider#registerUserLoader
         * @methodOf twigs.security.provider:PermissionsProvider
         *
         * @description
         * Registers the loader function to load the user Object. The given loader function must return
         * a promise which resolves to the user Object.
         * The user object is expected to be of the form:
         *
         * ```javascript
         *  {
         *   username:'John',
         *   roles:['ROLE_1','ROLE_2' ],
         *   permissions:[]
         *  }
         * ```
         *
         * It is valid to resolve to a user object which has additional properties.
         *
         * ```javascript
         * PermissionsProvider.registerUserLoader(function ($q, $resource) {
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
        this.registerUserLoader = function (loader) {
            userLoader = loader;
        };

        /**
         * @ngdoc function
         * @name twigs.security.provider:PermissionsProvider#registerPermissionEvaluationFunction
         * @methodOf twigs.security.provider:PermissionsProvider
         *
         * @description
         * Registers the evaluation function for evaluating permissions.
         * Permissions service will pass in the users permission, and the needed permissions (arguments)
         *
         * ```javascript
         * PermissionsProvider.registerPermissionEvaluationFunction(function () {
         *       return function (permissions, args) {
         *          // decide upon users permissions and args.
         *          // return true or false
         *          return true:
         *      };
         *   });
         * ```
         *
         * @param {function} the evaluator function
         */
        this.registerPermissionEvaluationFunction = function (fn) {
            permissionEvaluatorFunction = fn;
        };

        /**
         * @ngdoc object
         * @name twigs.security.service:Permissions
         *
         **/
        this.$get = function ($rootScope, $q, $injector, UserObjectSanityChecker, $log) {

            function _hasPermission() {
                if (!_isAuthenticated()) {
                    return false;
                }

                var evalFn = $injector.invoke(permissionEvaluatorFunction);
                return evalFn(user.permissions, arguments);
            }

            function _hasRole(roleName) {
                if (!_isAuthenticated()) {
                    return false;
                }

                var hasRole = false;
                user.roles.forEach(function (role) {
                    if (role === roleName) {
                        hasRole = true;
                    }
                });
                return hasRole;
            }

            function _loadUser() {
                if (angular.isUndefined(userLoader)) {
                    throw "No userLoader defined! Call PermissionsProvider.registerUserLoader(fn)  first!";
                }

                var
                    deferred = $q.defer(),
                    loaderFn = $injector.invoke(userLoader);

                loaderFn().then(function (data) {
                    if (!UserObjectSanityChecker.isSane(data)) {
                        deferred.reject("Loaded user object did not pass sanity check!");
                    } else {
                        user = data;
                        deferred.resolve(data);
                    }
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
            }

            function _getCurrentUser() {
                var deferred = $q.defer();
                if (angular.isDefined(user.username)) {
                    deferred.resolve(user);
                } else {
                    if (angular.isUndefined(userLoadingPromise)) {
                        _loadUser()
                            .then(function () {
                                $rootScope.$broadcast('userInitialized');
                                deferred.resolve(user);
                            }).catch(function (error) {
                                deferred.reject(error);
                            });
                        userLoadingPromise = deferred.promise;
                    }
                }
                return userLoadingPromise;
            }

            function _isAuthenticated() {
                return(angular.isDefined(user.username));
            }

            function _clearSecurityContext() {
                user = {};
                userLoadingPromise = undefined;
            }

            return {
                /**
                 * @ngdoc function
                 * @name twigs.security.service:Permissions#getUser
                 * @methodOf twigs.security.service:Permissions
                 *
                 *
                 * @description
                 *  returns a promise, holding the current user. will load the user if necessary.
                 *
                 *  @returns {object} The User object of the currently logged-in user
                 */
                getUser: _getCurrentUser,

                /**
                 * @ngdoc function
                 * @name twigs.security.service:Permissions#clearSecurityContext
                 * @methodOf twigs.security.service:Permissions
                 *
                 * @description
                 * Clears the securityContext. After invocation, no user object is loaded and
                 * 'isAuthenticated()' will return false
                 *
                 */
                clearSecurityContext: _clearSecurityContext,


                /**
                 * @ngdoc function
                 * @name twigs.security.service:Permissions#hasPermission
                 * @methodOf twigs.security.service:Permissions
                 *
                 * @description
                 *  Will call registered evaluator function. Is mostly used in twigs.security directives.
                 *
                 */
                hasPermission: _hasPermission,


                /**
                 * @ngdoc function
                 * @name twigs.security.service:Permissions#hasRole
                 * @methodOf twigs.security.service:Permissions
                 *
                 * @returns {boolean} True if a user has the given role
                 */
                hasRole: _hasRole,

                /**
                 * @ngdoc function
                 * @name twigs.security.service:Permissions#isAuthenticated
                 * @methodOf twigs.security.service:Permissions
                 *
                 * @returns {boolean} True if a user is authenticated, false otherwise
                 */
                isAuthenticated: _isAuthenticated
            };
        };
    });