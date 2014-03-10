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

angular.module('twigs.protectedRoutes')

/**
 * @ngdoc object
 * @name twigs.protectedRoutes.provider:ProtectedRouteProvider
 *
 * @description
 * In an application that uses a permission model, we'd like to protect some views from
 * unauthorized access.
 *
 * ProtectedRoutes allows you to define which user-roles are needed to access a route. You can use our ProtectedRouteProvider
 * in the same way you would use the standard $routeProvider.
 *
 * Additionally you can specify the property _neededRoles_. Angular will then
 * evaluate the user's permission on routeChangeStart. If the user has the required roles, the route and the location changes.
 * If not, the route-change is prevented and a _$routeChangeError_ event is thrown, which can be handled by your application to e.g. forward to the main view or to display an
 * appropriate message.
 *
 * ### How to configure protected routes
 * ```javascript
 * var App = angular.module('Main',['twigs.protectedRoutes']);
 *
 * App.config(function (ProtectedRouteProvider) {
 *
 * ProtectedRouteProvider
 *     .when('/home', {
 *         templateUrl: 'views/home.html',
 *         controller: 'HomeCtrl'
 *     })
 *     .when('/settings', {
 *         templateUrl: '/views/settings.html',
 *         controller: 'SettingsCtrl',
 *         neededRoles:['ADMIN']
 *     });
 * ```
 *
 * Note: ProtectedRoute depends on the twigs.security module. Make sure you registered a user loader function (see [PermissionsProvider](#/api/twigs.security.provider:PermissionsProvider))
 *
 */
    .provider('ProtectedRoute', function ($routeProvider) {

        var neededRolesForRoutes = { };

        /**
         * needed to mirror the angular's RouteProvider api !
         */
        this.otherwise = $routeProvider.otherwise;

        /**
         * the when function delegates to the angular routeProvider "when".
         */
        this.when = function (path, route) {
            if (isProtectedRouteConfig(route)) {
                route.resolve = angular.extend(route.resolve || {}, {
                    'hasPermission': function ($q, Permissions) {
                        return isUserAllowedToAccessRoute($q, Permissions, route.neededRoles);
                    }
                });
                neededRolesForRoutes[path] = route.neededRoles;
            }
            $routeProvider.when(path, route);
            return this;
        };

        function isProtectedRouteConfig(route) {
            if (angular.isDefined(route.neededRoles)) {
                if (typeof route.neededRoles === 'object') {
                    return true;
                } else {
                    throw 'Invalid protected route config: neededRoles must be an array';
                }
            }
            return false;
        }

        function isUserAllowedToAccessRoute($q, Permissions, neededRoles) {
            var deferred = $q.defer();
            Permissions.getUser()
                .then(function () {
                    if (userHasAllRoles(neededRoles, Permissions)) {
                        deferred.resolve({});
                    } else {
                        deferred.reject(new Error('missing_roles'));
                    }
                }, function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function userHasAllRoles(neededRoles, Permissions) {
            var allRoles = true;
            angular.forEach(neededRoles, function (neededRole) {
                if (!allRoles) {
                    return;
                }
                if (!Permissions.hasRole(neededRole)) {
                    allRoles = false;
                }
            });
            return allRoles;
        }

        this.$get = function () {
            return {};
        };

    }

);

