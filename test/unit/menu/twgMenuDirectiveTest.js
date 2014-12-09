'use strict';

describe('twgMenu Directive', function () {
  var MenuProvider, Menu, ProtectedRouteProvider;

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

  var $compile, $q, $scope, $httpBackend, $rootScope, $location, $document;

  beforeEach(module(function ($provide) {
    $provide.value('Authorizer', {
      hasPermission: function (args) {
        var deferred = $q.defer();
        deferred.resolve(args[0].roles[0] === 'ADMIN');
        return deferred.promise;
      }
    });
  }));

  beforeEach(inject(function (_Menu_, _$httpBackend_, _$q_, _$rootScope_, _$compile_, _$location_, _$document_) {
    Menu = _Menu_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $location = _$location_;
    $document = _$document_;

    $httpBackend.whenGET('views/menu/mainMenuTemplate.html').respond(
      '<div class="list-group">' +
      '<a x-ng-repeat="menuItem in menu.items" ' +
      'class="list-group-item" ' +
      'x-ng-href="#{{menuItem.link}}"' +
      'x-ng-class="{active: menuItem.active}">{{menuItem.text}}</a>' +
      '</div>');

    $httpBackend.whenGET('views/menu/secondaryNavigation.html').respond(
      '<div class="list-group">' +
      '<div x-ng-if="menuItem.items.length > 0" x-ng-repeat="menuItem in menu.items"><span class="menuItem" ng-class="{active: menuItem.active}">{{menuItem.text}}</span>' +
      '<ul class="submenu">' +
      '<li x-ng-repeat="subMenuItem in menuItem.items">' +
      '<a href="#{{subMenuItem.link}}" class="list-group-item" ng-class="{active: subMenuItem.active}">{{subMenuItem.text}}</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>');

    $httpBackend.whenGET('overrideTemplate.html').respond('<div>overridden</div>');
  }));

  function whenCompiling(element) {
    var compiledElement = $compile(element)($scope);
    $scope.$digest();
    return compiledElement;
  }

  it('displays main menu and filters menuItems depending on users role', function () {
    MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
      .addItem('allowed', {
        link: '/allowed'
      })
      .addItem('forbidden', {
        link: '/forbidden'
      });

    ProtectedRouteProvider
      .when('/allowed', {
        // user possesses this role
        protection: [{roles: ['ADMIN']}]
      })
      .when('/forbidden', {
        // user does not possess this role
        protection: [{roles: ['RESTRICTED']}]
      });

    var el = angular.element('<div><twg-menu menu-name="main_menu"></twigs-menu></div>');
    var element = whenCompiling(el);

    $httpBackend.flush();

    var linkElements = element.find('a.list-group-item');
    expect(linkElements.length).toBe(1);
    expect(linkElements[0].hash).toBe('#/allowed');
    expect(linkElements[0].innerText).toBe('allowed');
  });

  it('filters menuItems recursively depending on users role', function () {
    var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
    tabMenu.createSubMenu('secondaryNavigation_dataImport')
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage'
      });
    tabMenu.createSubMenu('secondaryNavigation_dataExport')
      .addItem('secondaryNavigation_dataExport_claim', {
        link: '/export/claim'
      })
      .addItem('secondaryNavigation_dataExport_damage', {
        link: '/export/damage'
      });

    ProtectedRouteProvider
      .when('/import/claim', {
        protection: [{roles: ['RESTRICTED']}]
      })
      .when('/import/damage', {
        protection: [{roles: ['RESTRICTED']}]
      })
      .when('/export/claim', {
        protection: [{roles: ['RESTRICTED']}]
      })
      .when('/export/damage', {
        protection: [{roles: ['ADMIN']}]
      });

    var el = angular.element('<div><twg-menu menu-name="secondaryNavigation"></twigs-menu></div>');
    var element = whenCompiling(el);

    $httpBackend.flush();

    var linkElements = element.find('a.list-group-item');
    expect(linkElements.length).toBe(1);
    expect(linkElements[0].hash).toBe('#/export/damage');
    expect(linkElements[0].innerText).toBe('secondaryNavigation_dataExport_damage');
  });

  function simulateRouteChange(path) {
    $location.path(path);
    $rootScope.$broadcast('$routeChangeSuccess');
    $rootScope.$apply();
  }

  //checks if, when a child menu item is active due to the browsers current path and the menu items link, all parent items of the active child item are set active.
  it('sets menu tree active recursively depending on current route', function () {
    var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
    tabMenu.createSubMenu('secondaryNavigation_dataImport')
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim',
        iconClass: 'glyphicon glyphicon-file'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage',
        iconClass: 'glyphicon glyphicon-file'
      });
    tabMenu.createSubMenu('secondaryNavigation_dataExport')
      .addItem('secondaryNavigation_dataExport_claim', {
        link: '/export/claim',
        iconClass: 'glyphicon glyphicon-file'
      })
      .addItem('secondaryNavigation_dataExport_damage', {
        link: '/export/damage',
        iconClass: 'glyphicon glyphicon-file'
      });

    var el = angular.element('<div><twg-menu menu-name="secondaryNavigation"></twigs-menu></div>');
    var element = whenCompiling(el);
    $httpBackend.flush();

    simulateRouteChange('/import/damage');

    var menuElements = element.find('span.menuItem');
    var submenuElements = element.find('a.list-group-item');

    //test if active is added to selected route tree
    expect(menuElements[0].classList.contains('active')).toBeTruthy("expected element to be active: " + menuElements[0].innerText);
    expect(submenuElements[1].classList.contains('active')).toBeTruthy("expected element to be active: " + submenuElements[1].innerText);

    //test if active is removed on route change
    simulateRouteChange('/export/claim');
    expect(menuElements[0].classList.contains('active')).toBeFalsy("expected element to be active: " + menuElements[0].innerText);
    expect(submenuElements[1].classList.contains('active')).toBeFalsy("expected element to be active: " + submenuElements[1].innerText);
  });

  it('should override provider template with template in directive template-url', function () {
    MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html')
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim',
        iconClass: 'glyphicon glyphicon-file'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage',
        iconClass: 'glyphicon glyphicon-file'
      });

    var el = angular.element('<div><twg-menu menu-name="secondaryNavigation" template-url="overrideTemplate.html"></twigs-menu></div>');
    var element = whenCompiling(el);

    $httpBackend.flush();

    var div = element.find('div');
    expect(div[0].innerText).toBe('overridden');
  });

});
