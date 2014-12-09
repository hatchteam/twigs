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

/**
 * @ngdoc object
 * @name twigs.menu.provider:MenuProvider
 *
 * @description
 * MenuProvider can be used to define menus globally which can later be used in multiple views.
 *
 * The currently active menu item is determined over the current window location and the link defined for each menu item.
 * If the link of a menu item matches the current path, the property menuItem.active will be true for that item.
 *
 * Menus can be filtered using the functionality of twigs.ProtectedRouteProvider. If the link of a menu item matches
 * with the link of a protected route and the current users role does not meet the needed roles to access that route,
 * the menu item will be removed from the menu.
 * Therefore twigs.ProtectedRouteProvider must be included in your application and configured as described under [ProtectedRouteProvider](#/api/twigs.menu.provider:ProtectedRouteProvider)
 *
 * ### Usage
 * You need to specify a config block to create a new Menu and you need to create a html template for the Menu content.
 *
 * MenuProvider.createMenu(... creates a new Menu with the given name and html template.
 * Menuitems or submenus can be added to this menu, nested as much as you like.
 *
 * ```javascript
 * angular.module('myApp').config(function (MenuProvider) {
 *       var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html')
 *       .addItem('main_menu_home', {
 *           text : 'Home',
 *           link: '/home',
 *           iconClass: 'fa fa-desktop fa-lg'
 *       });
 *
 *      var settingsMenu = mainMenu.createSubMenu('main_menu_settings',
 *          {link: '/settings/ac',text : 'Settings-Menu', iconClass: 'fa fa-lock fa-lg'});
 *
 *       settingsMenu.addItem('main_menu_settings_users', {
 *          text : 'Users',
 *          link: '/settings/ac/users'
 *       }).addItem('main_menu_settings_roles', {
 *          text : 'Roles',
 *          link: '/settings/ac/roles'
 *      });
 * });
 * ```
 * The html template 'views/mainMenu.html' referenced by MenuProvider.createMenu(...
 * Here you can iterate over all menu.items.
 * ```html
 * <ul>
 *      <li class="openable" ng-class="{'active': menuItem.active}"
 *          x-ng-repeat="menuItem in menu.items">
 *           <a x-ng-href="#{{menuItem.link}}">
 *              <span class="menu-icon">
 *                <i x-ng-class="menuItem.options.iconClass"></i>
 *               </span>
 *              <span class="text">
 *                {{menuItem.text}}
 *              </span>
 *              <span class="menu-hover"></span>
 *          </a>
 *      </li>
 * </ul>
 * ```
 *
 * The directive used in every one of your pages where the menu should be displayed:
 * ```html
 * <twg-menu menu-name="main_menu"></twg-menu>
 * ```
 *
 * ### A more complex example with nested menus:
 * Each menu item can contain a list of menu item children. Each parent menu / children menu structure is nothing else than a menu item with a list of menu items as menu.items property.
 * ```javascript
 * MenuProvider.userLoadedEventName('userInitialized'); //for details see below
 * var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html')
 * .addItem('main_menu_home', {
 *           text : 'Home',
 *           link: '/home',
 *           iconClass: 'fa fa-desktop fa-lg'
 *       });
 *
 * var settingsMenu = mainMenu.createSubMenu('main_menu_settings',
 *      {link: '/settings/ac',text : 'Settings-Menu', iconClass: 'fa fa-lock fa-lg'});
 *
 * settingsMenu.addItem('main_menu_settings_users', {
 *      text : 'Users',
 *      link: '/settings/ac/users',
 *      activeRoute: '/settings/ac/users(/.*)?' // for example navigating to
 *                                              // #/settings/ac/users/new also marks this
 *                                              // menu item active
 *   }).addItem('main_menu_settings_roles', {
 *       text : 'Roles',
 *       link: '/settings/ac/roles'
 *   });
 *
 * var ordersMenu = mainMenu.createSubMenu('main_menu_orders',
 *      {link: '/orders/', text : 'Orders', iconClass: 'fa fa-lock fa-lg'});
 *
 * ordersMenu.addItem('main_menu_orders_new_order', {
 *      text : 'New Order',
 *      link: '/orders/new'
 *   }).addItem('main_menu_orders_overview', {
 *       text : 'Order Overview',
 *       link: '/orders/overview'
 *   });
 * ```
 * The corresponding html template:
 * ```html
 * <ul>
 *      <li class="openable" ng-class="{'active': menuItem.active}"
 *          x-ng-repeat="menuItem in menu.items">
 *          <a x-ng-href="#{{menuItem.link}}">
 *              <span class="menu-icon">
 *                  <i x-ng-class="menuItem.options.iconClass"></i>
 *              </span>
 *              <span class="text">
 *                  {{menuItem.text}}
 *              </span>
 *              <span class="menu-hover"></span>
 *          </a>
 *
 *          <ul class="submenu" x-ng-if="menuItem.items.length > 0">
 *              <li x-ng-repeat="subMenuItem in menuItem.items"
 *                  ng-class="{'active': subMenuItem.active}">
 *                  <a href="#{{subMenuItem.link}}">
 *                          <span class="submenu-label">{{subMenuItem.text}}</span>
 *                   </a>
 *              </li>
 *          </ul>
 *      </li>
 * </ul>
 * ```
 *
 * See [twgMenu](#/api/twigs.menu.directive:twgMenu) for more information on how to use the twgMenu directive in your views.
 */

/**
 * @ngdoc directive
 * @name twigs.menu.directive:twgMenu
 * @element ANY
 * @attribute menu-name the name of the menu to be rendered (defined on the MenuProvider.createMenu(...  )
 * @attribute template-url (optional) the template to be used when rendering the menu
 *
 * @description
 * In many web applications you will need navigations or menus which are present on all or multiple html pages. TwgMenu allows you
 * to define those menues globally so that you only need to include a directive referencing the menu in your html page.
 *
 * TwgMenu registers each route change and ensures that correspondent menu entry is marked active as well as parent menu items if the menu is collapsable.
 *
 * TwgMenu can filter menu items with links referencing restricted routes (using twg.protectedRoutes) so that only users with the necessary access roles see those menu items.
 * In order to use menu filtering, twg.protectedRoutes needs to be included in your app and properly configured. See [ProtectedRouteProvider](#/api/twigs.menu.provider:ProtectedRouteProvider)
 *
 * ```html
 *<twigs-menu menu-name="main_menu"></twigs-menu>
 * ```
 *
 * Normally, twigs-menu renders the menu with the html template specified on the MenuProvider.createMenu(...
 * Alternatively a different template may be specified directly on the directive as follows:
 *
 *```html
 *<twigs-menu menu-name="main_menu" template-url="navigation/mySpecialTemplate.html">
 *</twigs-menu>
 * ```
 *
 * See [MenuProvider](#/api/twigs.menu.provider:MenuProvider) for more information on how to set up Menus.
 */
angular.module('twigs.menu')
  .provider('Menu', function Menu() {
    var menus = {}, userLoadedEventName;

    function searchItemRecursively(item, itemName) {
      //the recursion
      if (item.items.length > 0) {
        var foundItem;
        item.items.every(function (subItem) {
          foundItem = searchItemRecursively(subItem, itemName);
          return !foundItem; //break if foundItem is defined -> item was found
        });
        if (foundItem) {
          return foundItem;
        }
      }
      //the actual check
      if (item.name === itemName) {
        return item;
      }
    }

    function findMenuItemInMenu(menuName, itemName) {
      if (!menus[menuName]) {
        return undefined;
      }
      return searchItemRecursively(menus[menuName], itemName);
    }

    var serviceInstance = {
      createMenu: function (menuName, templateUrl) {
        var menu = new RootMenuItem(menuName, templateUrl);
        if (angular.isDefined(menus[menuName])) {
          throw 'Menu is already defined: ' + menuName;
        }
        menus[menuName] = menu;
        return menu;
      },
      menu: function (menuName) {
        return menus[menuName];
      },
      getMenuItemInMenu: function (menuName, itemName) {
        return findMenuItemInMenu(menuName, itemName);
      },
      removeMenu: function (menuName) {
        delete menus[menuName];
      },
      getUserLoadedEventName: function () {
        return userLoadedEventName;
      },
      setUserLoadedEventName: function (_userLoadedEventName) {
        userLoadedEventName = _userLoadedEventName;
      }
    };

    this.$get = function () {
      return serviceInstance;
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#createMenu
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Defines a new Menu.
     *
     * @param {String} menuName The name of the menu
     * @param {String} templateUrl The template used to render this menu
     * @returns {RootMenuItem} root instance for the new menu.
     *
     * Example:
     * ```javascript
     * var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html');
     * ```
     */
    this.createMenu = function (menuName, templateUrl) {
      return serviceInstance.createMenu(menuName, templateUrl);
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#menu
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Returns the root menu item instance for the menu with the specified menuName if it exists;
     * otherwise, returns undefined.
     *
     * @param {string} menuName name of the menu
     * @returns {SubMenuItem} root instance for the menu.
     */
    this.menu = function (menuName) {
      return serviceInstance.menu(menuName);
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#getMenuItemInMenu
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Searches for a menu item with the specified name in the specified menu.
     * Returns the first result, if multiple items with that name exist.
     *
     * @param {string} menuName name of the menu to search in
     * @param {string} itemName name of the menu item to find
     * @returns {object} menu item if exists, undefined otherwise
     */
    this.getMenuItemInMenu = function (menuName, itemName) {
      return serviceInstance.getMenuItemInMenu(menuName, itemName);
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#removeMenu
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Removes menu with the specified menuName
     *
     * @param {string} menuName name of the menu
     */
    this.removeMenu = function (menuName) {
      serviceInstance.removeMenu(menuName);
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#setUserLoadedEventName
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * If the menuitems should be filtered by the current users role, a event which signals
     * successfull loading of the user and his role needs to be specified. This event triggers
     * a re-filtering of the menu after successful login. Otherwise the menu is always filtered
     * pre login which means the user has no role yet.
     * If you use twigs.security the default event name is 'userInitialized'
     *
     * @param {String} userLoadedEventName The name of the user successfully loaded event
     *
     * Example:
     * ```javascript
     * MenuProvider.setUserLoadedEventName('userInitialized');
     * ```
     */
    this.setUserLoadedEventName = function (userLoadedEventName) {
      serviceInstance.setUserLoadedEventName(userLoadedEventName);
    };

    function validateMenuLink(linkFromConfig) {
      if (angular.isUndefined(linkFromConfig) || linkFromConfig.length < 1) {
        return linkFromConfig;
      }
      if (isExternalLink(linkFromConfig)) {
        return linkFromConfig;
      }
      if (linkFromConfig.charAt(0) !== '/') {
        throw 'please use routes in menu configuration: ' + linkFromConfig;
      }
      return linkFromConfig;
    }

    function isExternalLink(linkFromConfig) {
      return linkFromConfig.substring(0, 4) === 'http';
    }

    //MenuItem SuperClass
    function MenuItem(name) {
      this.name = name;
    }

    /**
     * Creates new RootMenuItem instance.
     * @param name name of the Menu
     * @constructor
     * @param templateUrl the html template used by the twigs-menu directive
     */
    function RootMenuItem(name, templateUrl) {
      this.constructor(name);
      this.templateUrl = templateUrl;
      this.items = [];
    }

    /**
     * Creates new SubMenuItem instance.
     * @param name name of the item
     * @constructor
     * @param _options item options
     */
    function SubMenuItem(name, _options) {
      this.constructor(name);
      this.items = [];

      var options = _options || {};
      this.text = options.text || name;
      this.link = validateMenuLink(options.link);
      this.activeRoute = options.activeRoute;
      this.options = options;
    }

    //inherit methods of MenuItem
    RootMenuItem.prototype = new MenuItem(name);
    SubMenuItem.prototype = new MenuItem(name);

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#addItem
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Adds new item with the specified itemName to the list of the child items of a menu item.
     *
     * @param {string} itemName name of the menu item. Name should be unique in the context of
     * the whole menu (not just among direct siblings). This restriction is not strictly
     * enforced, but functionality of some of the SubMenuItem methods depend on it.
     * @param {object} itemOptions used for the configuration of the menu item.
     * Can contain any attribute which may by referenced in the html template of your menu. itemOptions.text and itemOptions.link
     * are predefined and will be mapped to the menuItem directly (i.e. accessible over menuItem.text)
     * @param {string} itemOptions.text The display text or translation key of the item
     * @param {string} itemOptions.link The link which should be opened when the item is clicked
     * @param {string} (optional) itemOptions.activeRoute The link regex used to mark this menu item active if nested pages are under itemOptions.link
     * @returns {SubMenuItem} current instance
     *
     */
    MenuItem.prototype.addItem = function (itemName, itemOptions) {
      this.createAndAddItem(itemName, itemOptions);
      return this;
    };

    /**
     * @ngdoc function
     * @name twigs.menu.provider:MenuProvider#createSubMenu
     * @methodOf twigs.menu.provider:MenuProvider
     *
     * @description
     * Adds a new submenu with the specified menuName to the list of the child items of a menu item.
     *
     * @param {string} menuName name of the submenu. Name should be unique in the context of
     * the whole menu (not just among direct siblings). This restriction is not strictly
     * enforced, but functionality of some of the SubMenuItem methods depend on it.
     * * @param {object} menuOptions used for the configuration of the menu item.
     * Can contain any attribute which may by referenced in the html template of your menu. itemOptions.text and itemOptions.link
     * are predefined and will be mapped to the menuItem directly (i.e. accessible over menuItem.text)
     * @param {string} menuOptions.text The display text or translation key of the item
     * @param {string} menuOptions.link The link which should be opened when the item is clicked
     * @returns {SubMenuItem} instance for the new submenu
     *
     */
    MenuItem.prototype.createSubMenu = function (menuName, menuOptions) {
      return this.createAndAddItem(menuName, menuOptions);
    };

    MenuItem.prototype.createAndAddItem = function (itemName, itemOptions) {
      var item = new SubMenuItem(itemName, itemOptions);
      this.items.push(item);
      return item;
    };

  })


  .directive('twgMenu', function ($rootScope, $location, $log, Menu, MenuPermissionService, MenuHelper) {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {

        function update() {
          MenuPermissionService.filterMenuForRouteRestrictions(Menu.menu(attrs.menuName)).then(function (filteredMenu) {
            scope.menu = filteredMenu;
            MenuHelper.setActiveMenuEntryRecursively($location.path(), scope.menu);
          });
        }

        //refilter menu on userInit if menu filtering is required and re-evaluate the active menu entry if menu filtering was applied
        if (angular.isDefined(Menu.getUserLoadedEventName())) {
          scope.$on(Menu.getUserLoadedEventName(), function () {
            update();
          });
        } else {
          $log.debug('twigs.menu has no user initialized event registered. This may cause problems when using twigs.menu permission filtering');
        }

        update();

        $rootScope.$on('$routeChangeSuccess', function () {
          MenuHelper.setActiveMenuEntryRecursively($location.path(), scope.menu);
        });
      },
      templateUrl: function (element, attrs) {
        if (angular.isDefined(attrs.templateUrl)) {
          return attrs.templateUrl;
        } else {
          return Menu.menu(attrs.menuName).templateUrl;
        }
      }
    };
  });
