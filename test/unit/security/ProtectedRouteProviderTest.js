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


describe('ProtectedRouteProvider', function () {

  var ProtectedRouteProvider, AuthorizerProvider, $location, $route, $rootScope;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', []);

    fakeModule.config(function (_ProtectedRouteProvider_, _AuthorizerProvider_) {
      ProtectedRouteProvider = _ProtectedRouteProvider_;
      AuthorizerProvider = _AuthorizerProvider_;
    });
    // Initialize ht.flow module injector
    angular.mock.module('twigs.protectedRoutes', 'testApp');

    // Kickstart the injectors previously registered with calls to angular.mock.module
    inject(function () {
    });
  });

  beforeEach(inject(function (_$location_, _$route_, _$rootScope_) {
    $location = _$location_;
    $route = _$route_;
    $rootScope = _$rootScope_;
  }));


  describe('Route configurations', function () {

    it('allows to setup a standard Route', function () {
      ProtectedRouteProvider.when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });

      expect($route.routes['/main'].controller).toBe('MainCtrl');
    });

    it('allows to setup a protected Route', function () {
      ProtectedRouteProvider.when('/protected', {
        templateUrl: 'views/protected.html',
        controller: 'ProtectedCtrl',
        protection: {roles: ['ADMIN']}
      });

      var configViaService = $route.routes['/protected'];
      expect(configViaService.controller).toBe('ProtectedCtrl');
      expect(configViaService.resolve).toBeDefined();
      expect(configViaService.resolve.isUserAllowedToAccessRoute).toBeDefined();
    });

    it('allows to setup a protected Route with a resolve (resolve gets extended, not overwritten!)', function () {
      ProtectedRouteProvider.when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          'some': function myFunction() {
            return true;
          }
        },
        protection: {roles: ['ADMIN']}
      });

      var configViaService = $route.routes['/main'];
      expect(configViaService.resolve).toBeDefined();
      expect(configViaService.resolve.isUserAllowedToAccessRoute).toBeDefined();
      expect(configViaService.resolve.some).toBeDefined();
      expect(configViaService.templateUrl).toBe('views/main.html');
    });

    it('allows to setup a protected Route with protection:true)', function () {
      ProtectedRouteProvider.when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        protection: true
      });
      var configViaService = $route.routes['/main'];
      expect(configViaService.resolve).toBeDefined();
      expect(configViaService.resolve.isUserAllowedToAccessRoute).toBeDefined();
      expect(configViaService.templateUrl).toBe('views/main.html');
    });

    it('throws if "protection" is set to false', function () {

      expect(function () {
        ProtectedRouteProvider.when('/main2', {
          templateUrl: 'views/main2.html',
          controller: 'MainCtrl2',
          protection: false
        });
      }).toThrow();

    });

    it('throws if "protection" is set to a string', function () {
      expect(function () {
        ProtectedRouteProvider.when('/main', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl',
          protection: 'somethingElse'
        });
      }).toThrow();

    });

    it('allows to setup multiple protected Routes', function () {
      ProtectedRouteProvider
        .when('/main', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl',
          protection: {roles: ['ADMIN']}
        })
        .when('/some', {
          templateUrl: 'views/some.html',
          controller: 'SomeCtrl',
          protection: {roles: ['USER', 'ADMIN']}
        });
    });

    it('throws on invalid "neededRoles"', function () {
      function settingUp() {
        ProtectedRouteProvider.when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl',
          protection: 'Not an Array'
        });
      }

      expect(settingUp).toThrow();
    });

  });


  describe('Route changes', function () {

    function givenValidUnprotectedRouteConfig() {
      ProtectedRouteProvider
        .when('/', {
          controller: 'MainCtrl'
        })
        .when('/some', {
          controller: 'SomeCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    }

    it('changes on unprotected route', function (done) {
      givenValidUnprotectedRouteConfig();

      $rootScope.$on('$routeChangeSuccess', function () {
        done();
      });

      $location.path('/some');
      $rootScope.$digest();
      expect($location.path()).toBe('/some');

    });


  });


});
