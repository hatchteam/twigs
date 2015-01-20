'use strict';

describe('MenuPermissionService', function () {

  var MenuProvider, ProtectedRouteProvider, MenuPermissionService, $q, $rootScope;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', function () {
    });

    fakeModule.config(function (_MenuProvider_, _ProtectedRouteProvider_) {
      MenuProvider = _MenuProvider_;
      ProtectedRouteProvider = _ProtectedRouteProvider_;
    });

    angular.mock.module('twigs.menu', 'twigs.protectedRoutes', 'testApp');

  });

  var mockUserShouldBeLoggedIn = true;

  beforeEach(module(function ($provide) {
    mockUserShouldBeLoggedIn = true;

    $provide.value('Authorizer', {
      hasPermission: function (permissionsToCheck) {
        var deferred = $q.defer();

        if (mockUserShouldBeLoggedIn === false) {
          deferred.resolve(false);
        } else {

          if (!permissionsToCheck || typeof permissionsToCheck !== 'object') {
            throw new Error('No permission object to check!');
          }

          // check for roles
          deferred.resolve(permissionsToCheck.roles[0] === 'ADMIN');
        }

        return deferred.promise;
      },
      isLoggedIn: function () {
        var deferred = $q.defer();
        deferred.resolve(mockUserShouldBeLoggedIn);
        return deferred.promise;
      }
    });
  }));

  beforeEach(inject(function (_MenuPermissionService_, _$q_, _$rootScope_) {
    MenuPermissionService = _MenuPermissionService_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('Should correctly filter menu: one topItem allowed, one topItem forbidden', function (done) {

    var menu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
      .addItem('refdata', {
        link: '/refdata/users',
        iconClass: 'glyphicon glyphicon-person'
      })
      .addItem('logout', {
        link: '/dologout',
        iconClass: 'glyphicon glyphicon-logout'
      })
      .addItem('forbidden', {
        link: '/forbidden',
        iconClass: 'glyphicon glyphicon-logout'
      });

    ProtectedRouteProvider
      .when('/refdata/users', {
        templateUrl: 'views/refdata/users.html',
        controller: 'UsersCtrl',
        // user possesses this role
        protection: {roles: ['ADMIN']}
      })
      .when('/forbidden', {
        templateUrl: 'forbidden.html',
        controller: 'ForbiddenCtrl',
        // user does not possess this role
        protection: {roles: ['RESTRICTED']}
      })
      .otherwise({
        redirectTo: '/'
      });

    MenuPermissionService.filterMenuForRouteRestrictions(menu)
      .then(function (filteredMenu) {
        expect(filteredMenu.items.length).toBe(2);
        expect(filteredMenu.items[0].link).toBe('/refdata/users');
        expect(filteredMenu.items[1].link).toBe('/dologout');
        done();
      });

    $rootScope.$apply();

  });

  it('Should correctly filter menu: topItem forbidden, subItem allowed', function (done) {

    /**
     *  allowed sub-Items do not make forbidden top-item visible!
     *  (user has to ensure, top-item has at least same visibility/access like it's sub-items...)
     */

    var menu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html");

    menu
      .createSubMenu('A', {
        link: '/a'
      })
      .addItem('a1', {
        link: '/a/1'
      })
      .addItem('a2', {
        link: '/a/2'
      });

    ProtectedRouteProvider
      .when('/a', {
        protection: {roles: ['RESTRICTED']}
      })
      .when('/a1', {
        protection: {roles: ['ADMIN']}
      })
      .when('/a2', {
        protection: {roles: ['RESTRICTED']}
      });

    MenuPermissionService.filterMenuForRouteRestrictions(menu)
      .then(function (filteredMenu) {
        expect(filteredMenu.items.length).toBe(0);
        done();
      });

    $rootScope.$apply();

  });

  it('Should correctly filter menu: topItem allowed, subItem forbidden', function (done) {

    var menu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html");

    menu
      .createSubMenu('A', {
        link: '/a'
      })
      .addItem('a1', {
        link: '/a/1'
      })
      .addItem('a2', {
        link: '/a/2'
      });

    ProtectedRouteProvider
      .when('/a', {
        protection: {roles: ['ADMIN']}
      })
      .when('/a/1', {
        protection: {roles: ['ADMIN']}
      })
      .when('/a/2', {
        protection: {roles: ['RESTRICTED']}
      });

    MenuPermissionService.filterMenuForRouteRestrictions(menu)
      .then(function (filteredMenu) {
        expect(filteredMenu.items.length).toBe(1);
        expect(filteredMenu.items[0].name).toBe('A');

        // a2 no longer in menu
        expect(filteredMenu.items[0].items.length).toBe(1);
        expect(filteredMenu.items[0].items[0].name).toBe('a1');

        done();
      });

    $rootScope.$apply();

  });

  it('Should correctly filter menu: item "protection" set to true', function (done) {

    var menu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html");

    mockUserShouldBeLoggedIn = false;

    menu.addItem('a1', {
      link: '/a/1'
    });

    ProtectedRouteProvider.when('/a/1', {
      protection: true
    });

    MenuPermissionService.filterMenuForRouteRestrictions(menu)
      .then(function (filteredMenu) {
        expect(filteredMenu.items.length).toBe(0);

        done();
      });

    $rootScope.$apply();

  });

  it('Should correctly filter menu: item "protection" set to true, user is logged in', function (done) {

    var menu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html");

    mockUserShouldBeLoggedIn = true;

    menu.addItem('a1', {
      link: '/a/1'
    });

    ProtectedRouteProvider.when('/a/1', {
      protection: true
    });

    MenuPermissionService.filterMenuForRouteRestrictions(menu)
      .then(function (filteredMenu) {
        expect(filteredMenu.items.length).toBe(1);

        done();
      });

    $rootScope.$apply();

  });


});
