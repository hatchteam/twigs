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

describe('Service & Provider: GlobalPopups', function () {

    var GlobalPopupsProvider, GlobalPopups;

    beforeEach(function () {
        // Initialize the service provider by injecting it to a fake module's config block
        var fakeModule = angular.module('testApp', function () {
        });

        fakeModule.config(function (_GlobalPopupsProvider_) {
            GlobalPopupsProvider = _GlobalPopupsProvider_;
        });
        // Initialize ht.flow module injector
        angular.mock.module('twigs.globalPopups', 'testApp');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(function () {
        });
    });

    beforeEach(inject(function (_GlobalPopups_){
        GlobalPopups = _GlobalPopups_;
    }));


    describe('GlobalPopups Provider', function () {

        it('allows to register new dialog configs', function () {
            expect(GlobalPopupsProvider).toBeDefined();

            GlobalPopupsProvider.createToast('successToast',{
                templateUrl: 'views/globalMsg/successToast.html',
                displayDuration: 7000
            });


        });

    });


});
