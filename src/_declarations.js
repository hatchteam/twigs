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
 *  define all modules here!
 *  If we don't do this, we get problems when concatenating all files into one (grunt concatenates in alphabetical order)
 */

angular.module('twigs.activeRoute', []);

angular.module('twigs.devel', ['ngCookies']);

angular.module('twigs.dynamicSize', []);

angular.module('twigs.flow', []);

angular.module('twigs.templates', []);

angular.module('twigs.globalHotkeys', ['twigs.templates']);

angular.module('twigs.security', []);

angular.module('twigs.sortable', []);

angular.module('twigs.tableRowClick', ['twigs.security']);

angular.module('twigs.protectedRoutes', ['twigs.security', 'ngRoute']);


/**
 * @ngdoc overview
 * @name twigs
 *
 * @description
 * The main module which collects all other Twigs modules.
 * So for convenience, use 'twigs' as a dependency in your module to include all Twigs modules at once.
 *
 * ```javascript
 * var App = angular.module('Main', ['twigs']);
 * ```
 */
angular.module('twigs', [
    'twigs.activeRoute',
    'twigs.devel',
    'twigs.flow',
    'twigs.globalHotkeys',
    'twigs.security',
    'twigs.sortable',
    'twigs.dynamicSize',
    'twigs.tableRowClick',
    'twigs.globalPopups',
    'twigs.protectedRoutes']);