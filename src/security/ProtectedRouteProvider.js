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
 * ProtectedRoutes allows you to protect a route. (You can use our ProtectedRouteProvider
 * in the same way you would use the standard $routeProvider).
 *
 * You can specify the property _protection_. Angular will then
 * evaluate the user's permission on routeChangeStart. If the user has the required permissions, the route and the location changes.
 * If not, the route-change is prevented and a _$routeChangeError_ event is thrown, which can be handled by your application to e.g. forward to the main view or to display an
 * appropriate message.
 *
 * If you don't want to check for a specific permission, but only check if a user is logged in, set the property _authenticated_ to true.
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
 *         protection: {roles:['ADMIN']}
 *     }),
 *     .when('/profile', {
 *         templateUrl: '/views/settings.html',
 *         controller: 'SettingsCtrl',
 *         protection: true
 *     });
 * ```
 *
 * Note: ProtectedRoute depends on the twigs.security module. Make sure you registered a user loader function (see [AuthorizerProvider](#/api/twigs.security.provider:AuthorizerProvider))
 *
 */
  .provider('ProtectedRoute', function ($routeProvider) {

    var protectionsForRoutes = {};

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
          // explicitly specify collaborator names to inject, since ngAnnotate does not correctly do it.
          'CurrentUser': ['Authorizer', function (Authorizer) {
            return Authorizer.getUser();
          }],
          'isUserAllowedToAccessRoute': ['$q', 'Authorizer', function ($q, Authorizer) {
            return isUserAllowedToAccessRoute($q, Authorizer, route.protection);
          }]
        });
        protectionsForRoutes[path] = route.protection;
      }
      $routeProvider.when(path, route);
      return this;
    };

    function isProtectedRouteConfig(route) {
      if (angular.isUndefined(route.protection)) {
        return false;
      }

      if (route.protection === true) {
        // route is protected -> user must be logged in to access it
        return true;
      }

      if (Object.prototype.toString.call(route.protection) === '[object Array]') {
        throw new Error('Invalid protected route config: protection must be either an object or "true"');
      }

      if (typeof route.protection === 'object') {
        return true;
      }

      throw 'Invalid protected route config: protection must be either an object or "true"';
    }

    function isUserAllowedToAccessRoute($q, Authorizer, protection) {
      var deferred = $q.defer();
      Authorizer.getUser()
        .then(function () {

          if (protection === true) {
            // if protection is specified with "true" (protection:true), we don't have to
            // further evaluate permissions.
            deferred.resolve();
            return;
          }

          Authorizer.hasPermission.call(Authorizer, protection)
            .then(function (result) {
              if (result) {
                deferred.resolve();
              } else {
                deferred.reject(new Error('User is not allowed to access route!'));
              }
            });

        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    this.$get = function () {
      return {};
    };

  }
);
