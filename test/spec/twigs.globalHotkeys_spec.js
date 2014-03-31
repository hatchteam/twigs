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

describe('Service: GlobalHotkeysService', function () {

    beforeEach(angular.mock.module('twigs.globalHotkeys'));

    // instantiate service
    var GlobalHotkeysService, $rootScope, scope, $location;
    beforeEach(inject(function (_GlobalHotkeysService_, _$rootScope_, _$location_) {
        GlobalHotkeysService = _GlobalHotkeysService_;
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

        GlobalHotkeysService.registerGlobalHotkey('shift+z', noop);

        expect(GlobalHotkeysService.getGlobalHotkeyAction('shift+z')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyAction('shift+z')()).toBe('noop');
    });


    it('should keep registered global hotkeys (keycode)', function () {

        // 39 is arrow-right
        GlobalHotkeysService.registerGlobalHotkeyCode('39', noop);

        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('39')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('39')()).toBe('noop');
    });


    it('should keep registered global hotkeys (multiple)', function () {

        GlobalHotkeysService.registerGlobalHotkeys(['shift+z', 'alt+z'], noop);

        expect(GlobalHotkeysService.getGlobalHotkeyAction('shift+z')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyAction('shift+z')()).toBe('noop');
        expect(GlobalHotkeysService.getGlobalHotkeyAction('alt+z')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyAction('alt+z')()).toBe('noop');
    });

    it('should keep registered global hotkeys (multiple) (keycode)', function () {

        GlobalHotkeysService.registerGlobalHotkeyCodes(['39', '37'], noop);

        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('39')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('39')()).toBe('noop');
        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('37')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyActionCode('37')()).toBe('noop');
    });


    it('can retrieve hotkeys with uppercase', function () {

        GlobalHotkeysService.registerGlobalHotkey('shift+z', noop);

        expect(GlobalHotkeysService.getGlobalHotkeyAction('shiFt+z')).toBe(noop);
        expect(GlobalHotkeysService.getGlobalHotkeyAction('sHift+Z')()).toBe('noop');
    });

    it('should keep registered page hotkeys', function () {

        andBrowserWouldBeOnPage(dummyPath);
        GlobalHotkeysService.registerPageHotkey('shift+z', noop);

        andBrowserWouldBeOnPage(dummyPath2);
        GlobalHotkeysService.registerPageHotkey('shift+z', noop2);

        expect(GlobalHotkeysService.getPageHotkeyAction(dummyPath, 'shift+z')).toBe(noop);
        expect(GlobalHotkeysService.getPageHotkeyAction(dummyPath, 'shift+z')()).toBe('noop');
        expect(GlobalHotkeysService.getPageHotkeyAction(dummyPath2, 'shift+z')).toBe(noop2);
        expect(GlobalHotkeysService.getPageHotkeyAction(dummyPath2, 'shift+z')()).toBe('noop2');

    });

    it('should keep registered page hotkeys (code)', function () {

        andBrowserWouldBeOnPage(dummyPath);
        GlobalHotkeysService.registerPageHotkeyCode('37', noop);

        andBrowserWouldBeOnPage(dummyPath2);
        GlobalHotkeysService.registerPageHotkeyCode('37', noop2);

        expect(GlobalHotkeysService.getPageHotkeyActionCode(dummyPath, '37')).toBe(noop);
        expect(GlobalHotkeysService.getPageHotkeyActionCode(dummyPath, '37')()).toBe('noop');
        expect(GlobalHotkeysService.getPageHotkeyActionCode(dummyPath2, '37')).toBe(noop2);
        expect(GlobalHotkeysService.getPageHotkeyActionCode(dummyPath2, '37')()).toBe('noop2');

    });

});


describe('Directive: twgHotkeys', function () {
    var $compile, $scope, GlobalHotkeysService;

    beforeEach(module('twigs.globalHotkeys'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _GlobalHotkeysService_) {
        $compile = _$compile_;
        $scope = _$rootScope_.$new();
        GlobalHotkeysService = _GlobalHotkeysService_;
    }));

    function whenCompiling(element) {
        var element = $compile(element)($scope);
        $scope.$digest();
        return element;
    }

    function triggerKeyDown(element, keyString) {
        var e = jQuery.Event("keydown");
        e.which = keyString.charCodeAt(0);
        element.trigger(e);
        $scope.$digest();
    };

    function triggerKeyDownCode(element, keyCode) {
        var e = jQuery.Event("keydown");
        e.which = keyCode;
        element.trigger(e);
        $scope.$digest();
    };

    it('should do nothing if no hotkey registered', function () {
        var htmlElement = angular.element('<html twg-global-hotkeys><body></body></html>');
        var element = whenCompiling(htmlElement);
        triggerKeyDown(element, 'a');
    });

    it('should trigger on simple hotkey', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys></div>');
        var element = whenCompiling(htmlElement);
        var callBackExecuted = false;
        var event;

        GlobalHotkeysService.registerGlobalHotkey('a', function (ev) {
            callBackExecuted = true;
            event = ev;
        });

        triggerKeyDown(element, 'a');

        waitsFor(function () {
            return callBackExecuted;
        }, 'callbackToBeExecuted', 1000);

        runs(function () {
            expect(callBackExecuted).toEqual(true);
            expect(event).toBeDefined();
        });
    });


    it('should trigger on simple hotkey (code)', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys></div>');
        var element = whenCompiling(htmlElement);
        var callBackExecuted = false;
        var event;

        GlobalHotkeysService.registerGlobalHotkeyCode(10, function (ev) {
            callBackExecuted = true;
            event = ev;
        });

        triggerKeyDownCode(element, 10);

        waitsFor(function () {
            return callBackExecuted;
        }, 'callbackToBeExecuted', 1000);

        runs(function () {
            expect(callBackExecuted).toEqual(true);
            expect(event).toBeDefined();
        });
    });

    it('should trigger on child elements', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys><div class="some"></div></div>');
        var element = whenCompiling(htmlElement);
        var someElement = element.find('.some');
        var callBackExecuted = false;

        GlobalHotkeysService.registerGlobalHotkey('G', function () {
            callBackExecuted = true;
        });

        triggerKeyDown(someElement, 'G');

        waitsFor(function () {
            return callBackExecuted;
        }, 'callbackToBeExecuted', 1000);

        runs(function () {
            expect(callBackExecuted).toEqual(true);
        });
    });

    it('should not trigger with wrong key', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys><div class="some"></div></div>');
        var element = whenCompiling(htmlElement);
        var someElement = element.find('.some');
        var callBackNotExecuted = true;

        GlobalHotkeysService.registerGlobalHotkey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyDown(someElement, 'a');

        waits(200);

        runs(function () {
            expect(callBackNotExecuted).toEqual(true);
        });
    });

    it('should not trigger on input element', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys><input type="text" class="myinput" /></div>');
        var element = whenCompiling(htmlElement);
        var inputElement = element.find('.myinput');
        var callBackNotExecuted = true;

        GlobalHotkeysService.registerGlobalHotkey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyDown(inputElement, 'G');

        waits(200);

        runs(function () {
            expect(callBackNotExecuted).toEqual(true);
        });
    });

    it('should not trigger on textarea element', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys><textarea class="mytextarea">Some text</textarea></div>');
        var element = whenCompiling(htmlElement);
        var inputElement = element.find('.mytextarea');
        var callBackNotExecuted = true;

        GlobalHotkeysService.registerGlobalHotkey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyDown(inputElement, 'G');

        waits(200);

        runs(function () {
            expect(callBackNotExecuted).toEqual(true);
        });
    });


});
