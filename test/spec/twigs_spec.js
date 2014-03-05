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

describe('Twigs main module', function () {

    it('should load all modules', function () {
        var $injector = angular.injector(['ng', 'twigs']);

        // if the main twigs module does not specify a dependency one of the
        // other twigs-modules, these calls to angular.module would fail.
        angular.module('twigs.activeRoute');
        angular.module('twigs.devel');
        angular.module('twigs.flow');
        angular.module('twigs.globalHotkeys');
        angular.module('twigs.security');
        angular.module('twigs.sortable');
        angular.module('twigs.tableRowClick');
    });

});