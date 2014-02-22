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

describe('Service: GlobalHotKeysService', function () {

    // load the services's module
    beforeEach(module('twigs.globalHotKeys'));

    // instantiate service
    var GlobalHotKeysService, $rootScope, scope, $location;
    beforeEach(inject(function (_GlobalHotKeysService_, _$rootScope_, _$location_) {
        GlobalHotKeysService = _GlobalHotKeysService_;
        $location = _$location_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
    }));


    // some dummy vars
    var noop = function () {
        return 'noop';
    };
    var noop2 = function () {
        return 'noop2';
    };
    var dummyPath = '/somePath';
    var dummyPath2 = '/someOtherPath';

    function andBrowserWouldBeOnPage(path) {
        $location.path(path);
        $rootScope.$apply();
    }

    it('should keep registered global hotkeys', function () {

        GlobalHotKeysService.registerGlobalHotKey('shift+z', noop);

        expect(GlobalHotKeysService.getGlobalHotKeyAction('shift+z')).toBe(noop);
        expect(GlobalHotKeysService.getGlobalHotKeyAction('shift+z')()).toBe('noop');
    });

    it('should keep registered global hotkeys (multiple)', function () {

        GlobalHotKeysService.registerGlobalHotKeys(['shift+z', 'alt+z'], noop);

        expect(GlobalHotKeysService.getGlobalHotKeyAction('shift+z')).toBe(noop);
        expect(GlobalHotKeysService.getGlobalHotKeyAction('shift+z')()).toBe('noop');
        expect(GlobalHotKeysService.getGlobalHotKeyAction('alt+z')).toBe(noop);
        expect(GlobalHotKeysService.getGlobalHotKeyAction('alt+z')()).toBe('noop');
    });

    it('can retrieve hotkeys with uppercase', function () {

        GlobalHotKeysService.registerGlobalHotKey('shift+z', noop);

        expect(GlobalHotKeysService.getGlobalHotKeyAction('shiFt+z')).toBe(noop);
        expect(GlobalHotKeysService.getGlobalHotKeyAction('sHift+Z')()).toBe('noop');
    });

    it('should keep registered page hotkeys', function () {

        andBrowserWouldBeOnPage(dummyPath);
        GlobalHotKeysService.registerPageHotKey('shift+z', noop);

        andBrowserWouldBeOnPage(dummyPath2);
        GlobalHotKeysService.registerPageHotKey('shift+z', noop2);

        expect(GlobalHotKeysService.getPageHotKeyAction(dummyPath, 'shift+z')).toBe(noop);
        expect(GlobalHotKeysService.getPageHotKeyAction(dummyPath, 'shift+z')()).toBe('noop');
        expect(GlobalHotKeysService.getPageHotKeyAction(dummyPath2, 'shift+z')).toBe(noop2);
        expect(GlobalHotKeysService.getPageHotKeyAction(dummyPath2, 'shift+z')()).toBe('noop2');

    });


});
