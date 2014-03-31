"use strict";

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

angular.module('twigs.menu', [])
/**
 * Provider for programmatical creation and update of application menus.
 */
    .provider('Menu', function Menu() {
        var menus = {}, userLoadedEventName;

        var serviceInstance = {
            createMenu: function (menuName, templateUrl) {
                var menu = new RootMenuItem(menuName, templateUrl);
                menus[menuName] = menu;
                return menu;
            },
            menu: function (menuName) {
                return menus[menuName];
            },
            removeMenu: function (menuName) {
                delete menus[menuName];
            },
            getUserLoadedEventName: function(){
                return userLoadedEventName;
            },
            setUserLoadedEventName: function(_userLoadedEventName){
                userLoadedEventName= _userLoadedEventName;
            }
        };

        this.$get = function () {
            return serviceInstance;
        };

        /**
         * Creates new menu in the system. If menu with specified menuName already exists,
         * it will be overwritten with new menu. In order to prevent accidental overwrites
         * when you are not sure if menu already exists, you can use getOrCreateMenu.
         * @param {string} menuName name of the menu
         * @returns {SubMenuItem} root instance for the new menu.
         */
        this.createMenu = function (menuName, templateUrl) {
            return serviceInstance.createMenu(menuName, templateUrl);
        };

        /**
         * Creates new menu in the system if there is no existing menu with specified menuName.
         * Otherwise, it doesn't make any changes.
         * @param {string} menuName name of the menu
         * @returns {SubMenuItem} root instance for the menu.
         */
        this.getOrCreateMenu = function (menuName) {
            return serviceInstance.getOrCreateMenu(menuName);
        };

        /**
         * Returns root SubMenuItem instance for the menu with the specified menuName if it exists;
         * otherwise, returns undefined.
         * @param {string} menuName name of the menu
         * @returns {SubMenuItem} root instance for the menu.
         */
        this.menu = function (menuName) {
            return serviceInstance.menu(menuName);
        };

        /**
         * Removes menu with the specified menuName from the system.
         * @param menuName name of the menu
         */
        this.removeMenu = function (menuName) {
            serviceInstance.removeMenu(menuName);
        };

        this.userLoadedEventName = function(userLoadedEventName){
            serviceInstance.setUserLoadedEventName(userLoadedEventName);
        }

        function validateMenuLink(linkFromConfig) {
            if (angular.isUndefined(linkFromConfig) || linkFromConfig.length < 1) {
                return linkFromConfig;
            }
            if (isExternalLink(linkFromConfig)) {
                return linkFromConfig;
            }
            if (linkFromConfig.charAt(0) !== "/") {
                throw "please use routes in menu configuration: " + linkFromConfig;
            }
            return linkFromConfig;
        }

        function isExternalLink(linkFromConfig) {
            return linkFromConfig.substring(0, 4) === 'http';
        }

        //MenuItem SuperClass
        function MenuItem(name){
            this.name = name;
        }
        //inherit methods of MenuItem
        RootMenuItem.prototype = new MenuItem(name);
        SubMenuItem.prototype = new MenuItem(name);

        /**
         * Creates new RootMenuItem instance.
         * @param name name of the Menu
         * @constructor
         * @param templateUrl the html template used by the twigs-menu directive
         */
        function RootMenuItem(name, templateUrl){
            this.constructor(name);
            this.templateUrl = templateUrl;
            this.items = [];
        }

        /**
         * Creates new SubMenuItem instance.
         * @param name name of the item
         * @constructor
         * @param options item options
         */
        function SubMenuItem(name, options) {
            this.constructor(name);
            this.items = [];

            var _options = options || {};
            this.text = _options.text || name;
            this.link = validateMenuLink(_options.link);
            this.pxRoute = _options.pxRoute;
            this.iconClass = _options.iconClass;
        }

        /**
         * Adds new item with the specified itemName to the list of the child items.
         * @param {string} itemName name of the menu item. Name should be unique in the context of
         * the whole menu (not just among direct siblings). This restriction is not strictly
         * enforced, but functionality of some of the SubMenuItem methods depend on it.
         * @param {object} itemOptions optional parameter should be used for the configuration of
         * the menu item and can contain same fields as SubMenuItem
         * @returns {SubMenuItem} current instance
         */
        MenuItem.prototype.addItem = function (itemName, itemOptions) {
            this._createAndAddItem(itemName, itemOptions);
            return this;
        };

        /**
         * Adds new submenu with the specified menuName to the list of the child items.
         * @param {string} menuName name of the submenu. Name should be unique in the context of
         * the whole menu (not just among direct siblings). This restriction is not strictly
         * enforced, but functionality of some of the SubMenuItem methods depend on it.
         * @param {object} menuOptions optional parameter should be used for the configuration of
         * the submenu and can contain same fields as SubMenuItem
         * @returns {SubMenuItem} instance for the new submenu
         */
        MenuItem.prototype.createSubMenu = function (menuName, menuOptions) {
            return this._createAndAddItem(menuName, menuOptions);
        };

        /**
         * Finds the item with the specified itemName among all descendants of the current
         * instance (not just among direct child items).
         * @param {string} itemName name of the item to find
         * @returns {SubMenuItem} instance for the requested item if exists; otherwise undefined
         */
        MenuItem.prototype.findItem = function (itemName) {
            // TODO: Maybe think of another visiting strategy
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.name === itemName) {
                    return item;
                }
                var subItem = item.findItem(itemName);
                if (subItem) {
                    return subItem;
                }
            }
            return null; // or maybe throw exception?
        };

        /**
         * Removes the item with the specified itemName from system. System will try to find
         * and remove first item among all descendants of the current instance (not just among
         * direct child items).
         * @param {string} itemName name of the item to remove
         * @returns {boolean} true if item was removed; otherwise false
         */
        MenuItem.prototype.removeItem = function (itemName) {
            // TODO: Maybe think of another visiting strategy
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.name === itemName) {
                    this.items.splice(i, 1);
                    return true;
                }
                if (item.removeItem(itemName)) {
                    return true;
                }
            }
            return false;
        };

        MenuItem.prototype._createAndAddItem = function (itemName, itemOptions) {
            var item = new SubMenuItem(itemName, itemOptions);
            this.items.push(item);
            return item;
        };
    })

    .service('MenuPermissionService', function($route, $injector, $log){
        var isSubMenuItemAllowed, filterMenuForRouteRestrictions, filterMenuRecursively, Permissions;

        try{
            //inject permissions if module exists, otherwise all SubMenuItems are allowed
            Permissions = $injector.get('Permissions');
        }catch(err){
            $log.debug("twigs.menu is used without permission filtering. Include twigs.security in your app if you wish to filter twigs.menu according to user roles.");
        }

        isSubMenuItemAllowed = function(SubMenuItem, Permissions){
            var hasRoles = true;
            var SubMenuItemRoute = $route.routes[SubMenuItem.link];
            if(angular.isUndefined(SubMenuItemRoute)){
                //if therre is no route match for SubMenuItem.link dont filter the SubMenuItem
                return true;
            }
            angular.forEach( SubMenuItemRoute.neededRoles, function(neededRole){
                var hasNeededRole = Permissions.hasRole(neededRole);
                if(!hasNeededRole){
                    hasRoles = false;
                    return false;
                }
            });
            return hasRoles;
        };

        filterMenuRecursively = function(menu, Permissions){
            if (angular.isDefined(menu.items) && menu.items.length > 0) {
                var ok = [];
                angular.forEach(menu.items, function (SubMenuItem) {
                    if (isSubMenuItemAllowed(SubMenuItem, Permissions)) {
                        var oldSubMenuItemSubItemsCount = SubMenuItem.items.length;
                        var newSubMenuItem = filterMenuRecursively(SubMenuItem, Permissions);
                        if(newSubMenuItem.items.length !== 0 || oldSubMenuItemSubItemsCount === 0){
                            //only push this item if it has no submenu or it has a submenu and the submenu items are visible
                            ok.push(SubMenuItem);
                        }
                    }
                });
                menu.items = ok;
            }
            return menu;
        };

        filterMenuForRouteRestrictions = function(menu) {
            if(angular.isUndefined(Permissions)){
                return menu;
            }
            if(angular.isUndefined(menu)){
                return;
            }

            return filterMenuRecursively(menu, Permissions);
        };

        return {
            isSubMenuItemAllowed: isSubMenuItemAllowed,
            filterMenuForRouteRestrictions: filterMenuForRouteRestrictions
        };
    })

    .directive('twigsMenu', function ($rootScope, $location, $log, Menu, MenuPermissionService) {
        return {
            restrict: 'E',
            controller: function ($scope) {
            },
            link : function(scope, element, attrs){

                function setActiveMenuEntryRecursively(path, menu){
                    var subItemFound;

                    if(angular.isDefined(menu.items) && menu.items.length > 0){
                        angular.forEach(menu.items, function (item) {
                            if(setActiveMenuEntryRecursively(path, item) === true){
                                subItemFound = true;
                                item.active = true;
                                return false;
                            }
                        });
                        menu.active = subItemFound;

                        if(subItemFound === false){
                            //check if root menu item should be active
                            menu.active = (menu.link === path);
                        }

                    } else {
                        return menu.link === path;
                    }
                }
                function deactivateAllMenuItems(menu){
                    menu.active = false;
                    if(angular.isDefined(menu.items) && menu.items.length > 0){
                        angular.forEach(menu.items, function (item) {
                            deactivateAllMenuItems(item);
                        });
                    } else {
                        menu.active = false;
                    }
                }

                var menu = angular.copy(Menu.menu(attrs.menuName));
                scope.menu = MenuPermissionService.filterMenuForRouteRestrictions(menu);

                //refilter menu on userInit if menu filtering is required
                if(angular.isDefined(Menu.getUserLoadedEventName())){
                    scope.$on(Menu.getUserLoadedEventName(), function(){
                        var menu = angular.copy(Menu.menu(attrs.menuName));
                        scope.menu = MenuPermissionService.filterMenuForRouteRestrictions(menu);
                    });
                }else{
                    $log.debug("twigs.menu has no user initialized event registered. This may cause problems when using twigs.menu permission filtering");
                }

                deactivateAllMenuItems(scope.menu);
                setActiveMenuEntryRecursively($location.path(), scope.menu);

                $rootScope.$on('$routeChangeSuccess', function () {
                    deactivateAllMenuItems(scope.menu);
                    setActiveMenuEntryRecursively($location.path(), scope.menu);
                });
            },
            templateUrl: function(element, attrs){
                return Menu.menu(attrs.menuName).templateUrl
            }
        };
    });