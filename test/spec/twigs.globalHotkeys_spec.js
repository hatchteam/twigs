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

    beforeEach(angular.mock.module('twigs.globalHotKeys'));

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


describe('Directive: twgHotKeys', function () {
    var $compile, $scope, GlobalHotKeysService;

    beforeEach(module('twigs.globalHotKeys'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _GlobalHotKeysService_) {
        $compile = _$compile_;
        $scope = _$rootScope_.$new();
        GlobalHotKeysService = _GlobalHotKeysService_;
    }));

    function whenCompiling(element) {
        var element = $compile(element)($scope);
        $scope.$digest();
        return element;
    }

    function triggerKeyDown(element, keyCode) {
        var e = jQuery.Event("keydown");
        e.which = keyCode.charCodeAt(0);
        element.trigger(e);
        $scope.$digest();
    };

    function triggerKeyPress(element, keyCode) {
        var e = jQuery.Event("keypress");
        e.which = keyCode.charCodeAt(0);
        element.trigger(e);
        $scope.$digest();
    };

    it('should do nothing if no hotkey registered', function () {
        var htmlElement = angular.element('<html twg-global-hotkeys><body></body></html>');
        var element = whenCompiling(htmlElement);
        triggerKeyPress(element, 'a');
    });

    it('should trigger on simple hotkey', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys></div>');
        var element = whenCompiling(htmlElement);
        var callBackExecuted = false;

        GlobalHotKeysService.registerGlobalHotKey('a', function () {
            callBackExecuted = true;
        });

        triggerKeyPress(element, 'a');

        waitsFor(function () {
            return callBackExecuted;
        }, 'callbackToBeExecuted', 1000);

        runs(function () {
            expect(callBackExecuted).toEqual(true);
        });
    });

    it('should trigger on child elements', function () {
        var htmlElement = angular.element('<div twg-global-hotkeys><div class="some"></div></div>');
        var element = whenCompiling(htmlElement);
        var someElement = element.find('.some');
        var callBackExecuted = false;

        GlobalHotKeysService.registerGlobalHotKey('G', function () {
            callBackExecuted = true;
        });

        triggerKeyPress(someElement, 'G');

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

        GlobalHotKeysService.registerGlobalHotKey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyPress(someElement, 'a');

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

        GlobalHotKeysService.registerGlobalHotKey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyPress(inputElement, 'G');

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

        GlobalHotKeysService.registerGlobalHotKey('G', function () {
            callBackNotExecuted = false;
        });

        triggerKeyPress(inputElement, 'G');

        waits(200);

        runs(function () {
            expect(callBackNotExecuted).toEqual(true);
        });
    });


});
