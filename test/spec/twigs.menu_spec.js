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

describe('Service & Provider: Menu', function () {
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

    describe('Menu Provider', function () {

        beforeEach(inject(function (_Menu_) {
            Menu = _Menu_;
        }));

        it('allows to register new main menu', function () {
            expect(MenuProvider).toBeDefined();

            var mainMenu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
                .addItem('main_menu_refdata', {
                    link: '/refdata/users',
                    text: 'Reference Data',
                    iconClass: 'glyphicon glyphicon-person'
                })
                .addItem('main_menu_logout', {
                    link: '/dologout',
                    text: 'Logout',
                    iconClass: 'glyphicon glyphicon-logout'
                });

            expect(mainMenu).toBeDefined();
            expect(mainMenu.name).toBe('main_menu');
            expect(mainMenu.templateUrl).toBe('views/menu/mainMenuTemplate.html');
            expect(mainMenu.items.length).toBe(2);

            expect(mainMenu.items[0].name).toBe('main_menu_refdata');
            expect(mainMenu.items[0].text).toBe('Reference Data');
            expect(mainMenu.items[0].link).toBe('/refdata/users');
            expect(mainMenu.items[0].options.iconClass).toBe('glyphicon glyphicon-person');
            expect(mainMenu.items[0].items.length).toBe(0);

            expect(mainMenu.items[1].name).toBe('main_menu_logout');
            expect(mainMenu.items[1].text).toBe('Logout');
            expect(mainMenu.items[1].link).toBe('/dologout');
            expect(mainMenu.items[1].options.iconClass).toBe('glyphicon glyphicon-logout');
            expect(mainMenu.items[1].items.length).toBe(0);
        });
    });

    describe('Menu Directive', function () {
        var $compile, $scope, $httpBackend, $rootScope, $location, $document;

        beforeEach(module(function ($provide) {
            $provide.value('Permissions', {
                hasRole: function (role) {
                    if (role === 'ADMIN') {
                        return true;
                    }
                    return false;
                }
            });
        }));

        beforeEach(inject(function (_Menu_, _$httpBackend_, _$rootScope_, _$compile_, _$location_, _$document_) {
            Menu = _Menu_;
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
        }));

        function whenCompiling(element) {
            var compiledElement = $compile(element)($scope);
            $scope.$digest();
            return compiledElement;
        }

        it('displays main menu and filters menuItems depending on users role', function () {
            var mainMenu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
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
                    //user posesses this role
                    neededRoles: ['ADMIN']})
                .when('/forbidden', {
                    templateUrl: 'forbidden.html',
                    controller: 'ForbiddenCtrl',
                    //user does not posess this role
                    neededRoles: ['RESTRICTED']
                }).otherwise({
                    redirectTo: '/'
                });

            var el = angular.element('<div><twg-menu menu-name="main_menu"></twigs-menu></div>');
            var element = whenCompiling(el);

            $httpBackend.flush();

            var linkElements = element.find('a.list-group-item');
            expect(linkElements.length).toBe(2);
            expect(linkElements[0].hash).toBe('#/refdata/users');
            expect(linkElements[1].hash).toBe('#/dologout');
            expect(linkElements[0].innerText).toBe('refdata');
            expect(linkElements[1].innerText).toBe('logout');
        });

        it('filters menuItems recursively depending on users role', function () {
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

            ProtectedRouteProvider
                .when('/import/claim', {
                    templateUrl: 'views/import/claim.html',
                    controller: 'UsersCtrl',
                    neededRoles: ['RESTRICTED']})  //user does not posess this role
                .when('/import/damage', {
                    templateUrl: 'views/import/damage.html',
                    controller: 'ForbiddenCtrl',
                    neededRoles: ['RESTRICTED']  //user does not posess this role
                })
                .when('/export/claim', {
                    templateUrl: 'views/export/claim.html',
                    controller: 'UsersCtrl',
                    neededRoles: ['RESTRICTED']})  //user does not posess this role
                .when('/export/damage', {
                    templateUrl: 'views/export/damage.html',
                    controller: 'ForbiddenCtrl',
                    neededRoles: ['ADMIN']  //user does posesses this role
                }).otherwise({
                    redirectTo: '/'
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
    });

    describe('Menu Service', function () {
        var MenuPermissionService;
        beforeEach(inject(function (_MenuPermissionService_) {
            MenuPermissionService = _MenuPermissionService_;
        }));

        it('should setActiveMenuEntryRecursively', function () {
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

            MenuPermissionService.setActiveMenuEntryRecursively('/import/claim', tabMenu);

            expect(tabMenu.active).toBeTruthy();
            expect(tabMenu.items[0].active).toBeTruthy();
            expect(tabMenu.items[0].items[0].active).toBeTruthy();

            expect(tabMenu.items[0].items[1].active).toBeFalsy();
        });

        it('should setActiveMenuEntryRecursively root item', function () {
            var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
            tabMenu.createSubMenu('secondaryNavigation_dataImport', {link:'/import'})
                .addItem('secondaryNavigation_dataImport_claim', {
                    link: '/import/claim',
                    iconClass: 'glyphicon glyphicon-file'
                })
                .addItem('secondaryNavigation_dataImport_damage', {
                    link: '/import/damage',
                    iconClass: 'glyphicon glyphicon-file'
                });

            MenuPermissionService.setActiveMenuEntryRecursively('/import', tabMenu);
            expect(tabMenu.active).toBeTruthy();
            expect(tabMenu.items[0].active).toBeTruthy();

            expect(tabMenu.items[0].items[1].active).toBeFalsy();
            expect(tabMenu.items[0].items[0].active).toBeFalsy();
        });

        it('should setActiveMenuEntryRecursively nested page', function () {
            var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
            tabMenu.createSubMenu('secondaryNavigation_dataImport', {link:'/import'})
                .addItem('secondaryNavigation_dataImport_claim', {
                    link: '/import/claim',
                    iconClass: 'glyphicon glyphicon-file',
                    activeRoute: '/import/claim(/.*)?'
                })
                .addItem('secondaryNavigation_dataImport_damage', {
                    link: '/import/damage',
                    iconClass: 'glyphicon glyphicon-file'
                });

            MenuPermissionService.setActiveMenuEntryRecursively('/import/claim/new', tabMenu);
            expect(tabMenu.active).toBeTruthy();
            expect(tabMenu.items[0].active).toBeTruthy();

            expect(tabMenu.items[0].items[0].active).toBeTruthy();
            expect(tabMenu.items[0].items[1].active).toBeFalsy();
        });
    });

});