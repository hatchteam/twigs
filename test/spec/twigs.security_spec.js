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

'use strict';

describe('Service & Provider: Permissions ', function () {

    var
        PermissionsProvider,
        Permissions,
        $rootScope,
        dummyUserPermissions = {
           'stocks':['read','delete','update']
        },
        dummyUserObject = {
            username: 'admin',
            roles: ['ADMIN', 'USER'],
            permissions: dummyUserPermissions
        };

    beforeEach(function () {
        // Initialize the service provider by injecting it to a fake module's config block
        var fakeModule = angular.module('testApp', []);

        fakeModule.config(function (_PermissionsProvider_) {
            PermissionsProvider = _PermissionsProvider_;
        });
        // Initialize module injector
        angular.mock.module('twigs.security', 'testApp');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(function () {
        });
    });

    beforeEach(inject(function (_Permissions_, _$rootScope_) {
        Permissions = _Permissions_;
        $rootScope = _$rootScope_;
    }));

    describe('PermissionsProvider', function () {

        it('allows to register a user loader', function () {
            expect(PermissionsProvider).toBeDefined();
            expect(PermissionsProvider.registerUserLoader).toBeDefined();
            PermissionsProvider.registerUserLoader(function ($q) {
                return function () {
                    var deferred = $q.defer();
                    deferred.resolve(dummyUserObject);
                    return deferred.promise;
                };
            });
        });

        it('allows to register a permission evaluation function', function () {
            expect(PermissionsProvider).toBeDefined();
            expect(PermissionsProvider.registerPermissionEvaluationFunction).toBeDefined();
            PermissionsProvider.registerPermissionEvaluationFunction(function () {
                return function (user, args) {
                    dump(user, args);

                    return false;
                };
            });
        });


    });

    describe('Permissions', function () {

        it('allows to clear the security context', function () {
            expect(Permissions).toBeDefined();
            expect(Permissions.clearSecurityContext).toBeDefined();
            Permissions.clearSecurityContext();
        });

        it('cannot get the user without a loader', function () {
            expect(Permissions).toBeDefined();
            expect(Permissions.getUser).toBeDefined();

            function gettingUser() {
                Permissions.getUser();
            }

            expect(gettingUser).toThrow();
        });

        var userLoderInvocationCount;

        function hasRegisteredUserLoader() {
            userLoderInvocationCount = 0;
            PermissionsProvider.registerUserLoader(function ($q) {
                return function () {
                    userLoderInvocationCount++;
                    var newDeferred = $q.defer();
                    newDeferred.resolve(dummyUserObject);
                    return newDeferred.promise;
                };
            });
        }


        function hasLoadedUser() {
            Permissions.getUser();
            $rootScope.$apply();
        }

        it('allows to get the user when a loader is registered (will load user on first invocation)', function () {
            hasRegisteredUserLoader();

            var userObject;

            Permissions.getUser().then(function (data) {
                userObject = data;
            });

            expect(userLoderInvocationCount).toEqual(1);

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            expect(userObject).toBe(dummyUserObject);
        });


        it('does not allow insane user object', function () {
            PermissionsProvider.registerUserLoader(function ($q) {
                return function () {
                    var newDeferred = $q.defer();
                    newDeferred.resolve({
                        some: 'insane',
                        obj: 'damn'
                    });
                    return newDeferred.promise;
                };
            });

            var userObject, error;

            Permissions.getUser()
                .then(function (data) {
                    userObject = data;
                })
                .catch(function (err) {
                    error = err;
                });

            expect(userLoderInvocationCount).toEqual(1);

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            expect(userObject).toBeUndefined();
            expect(error).toBeDefined();
        });

        it('it returns running promise on subsequent calls', function () {
            hasRegisteredUserLoader();

            var userObject, userObject2;

            Permissions.getUser().then(function (data) {
                userObject = data;
            });

            Permissions.getUser().then(function (data) {
                userObject2 = data;
            });

            // still only one invocation of our loader
            expect(userLoderInvocationCount).toEqual(1);

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            expect(userObject).toBe(dummyUserObject);
            expect(userObject2).toBe(dummyUserObject);
        });

        it('returns loaded user on subsequent calls', function () {
            hasRegisteredUserLoader();

            var userObject, userObject2;

            Permissions.getUser().then(function (data) {
                userObject = data;
            });

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            expect(userObject).toBe(dummyUserObject);

            Permissions.getUser().then(function (data) {
                userObject2 = data;
            });

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            // still only one invocation of our loader
            expect(userLoderInvocationCount).toEqual(1);

            expect(userObject2).toBe(dummyUserObject);
        });

        it('invokes loader again, after clearing context', function () {
            hasRegisteredUserLoader();

            var userObject, userObject2;

            Permissions.getUser().then(function (data) {
                userObject = data;
            });

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            expect(userObject).toBe(dummyUserObject);
            Permissions.clearSecurityContext();

            Permissions.getUser().then(function (data) {
                userObject2 = data;
            });

            // promises are resolved/dispatched only on next $digest cycle !!!
            $rootScope.$apply();

            // invoked again, since we cleared the context
            expect(userLoderInvocationCount).toEqual(2);

            expect(userObject2).toBe(dummyUserObject);
        });

        it('returns false on isAuthenticated if no user is loaded', function () {
            hasRegisteredUserLoader();
            expect(Permissions.isAuthenticated()).toBe(false);
        });

        it('returns true on isAuthenticated after user is loaded', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            expect(Permissions.isAuthenticated()).toBe(true);
        });

        it('returns false on isAuthenticated after clearing context', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            Permissions.clearSecurityContext();

            expect(Permissions.isAuthenticated()).toBe(false);
        });


        it('returns true on hasRole if user has given role', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            expect(Permissions.hasRole('ADMIN')).toBe(true);
            expect(Permissions.hasRole('USER')).toBe(true);
        });

        it('returns false on hasRole if user does not have given role', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            expect(Permissions.hasRole('TESTER')).toBe(false);
        });

        it('returns false on hasRole if security context is cleared', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            Permissions.clearSecurityContext();

            expect(Permissions.hasRole('ADMIN')).toBe(false);
        });


        it('calls evaluator function and passes in permissions', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            PermissionsProvider.registerPermissionEvaluationFunction(function () {
                return function (permissions, args) {
                    // Permissions service will pass in the users permissions
                    expect(permissions).toEqual(dummyUserPermissions);

                    // Permissions service will pass in the arguments
                    expect(args[0]).toBe('some');
                    expect(args[1]).toBe('arguments');
                    return false;
                };
            });

            expect(Permissions.hasPermission('some', 'arguments')).toBe(false);
        });


        it('calls evaluator function, returns true', function () {
            hasRegisteredUserLoader();
            hasLoadedUser();

            PermissionsProvider.registerPermissionEvaluationFunction(function () {
                return function (permissions, args) {
                    return true;
                };
            });

            expect(Permissions.hasPermission()).toBe(true);
        });


    });


});
