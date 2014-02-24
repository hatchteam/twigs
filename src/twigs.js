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
 * @ngdoc overview
 * @name twigs
 *
 * @description
 * The main module which collects all other Twigs modules.
 * So for convenience, use 'twigs' as a dependency in your module to include all Twigs modules at once.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs']);
 * ```
 */
angular.module('twigs', [
    'twigs.globalHotkeys',
    'twigs.activeRoute',
    'twigs.tableRowClick']);