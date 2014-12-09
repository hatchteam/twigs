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

describe("Directive: twgActiveRoute", function () {
    var $compile, $rootScope, $scope, $location;

    beforeEach(angular.mock.module('twigs.activeRoute'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$location_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $location = _$location_;

        /* start at 'home' */
        $location.path('/home');
        $rootScope.$apply();
    }));


    function whenCompiling(element) {
        var compiledElement = $compile(element)($scope);
        $scope.$digest();
        return compiledElement;
    }

    function simulateRouteChange(path) {
        $location.path(path);
        $rootScope.$broadcast('$routeChangeSuccess');
        $rootScope.$apply();
    }

    it("should mark as active", function () {
        var el = angular.element('<div><ul><li twg-active-route="/settings">Settings</li></ul></div>');
        var element = whenCompiling(el);
        var listElements = element.find('li');
        expect(listElements.length).toBe(1);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
    });

    it("should mark only matching as active", function () {
        var el = angular.element('<div><ul><li twg-active-route="/settings">Settings</li><li twg-active-route="/home">Home</li></ul></div>');
        var element = whenCompiling(el);
        var listElements = element.find('li');
        expect(listElements.length).toBe(2);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        expect(listElements.eq(1).hasClass('active')).toBe(false);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
        expect(listElements.eq(1).hasClass('active')).toBe(true);
    });


    it("should correctly set scope flag", function () {
        var el = angular.element('<div><ul><li twg-active-route="/settings" x-ng-class="{current: twgActive}" >Settings</li><li twg-active-route="/home" x-ng-class="{now: twgActive}" >Home</li></ul></div>');
        var element = whenCompiling(el);
        var listElements = element.find('li');
        expect(listElements.length).toBe(2);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        expect(listElements.eq(0).hasClass('current')).toBe(true);
        expect(listElements.eq(1).hasClass('active')).toBe(false);
        expect(listElements.eq(1).hasClass('now')).toBe(false);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
        expect(listElements.eq(0).hasClass('current')).toBe(false);
        expect(listElements.eq(1).hasClass('active')).toBe(true);
        expect(listElements.eq(1).hasClass('now')).toBe(true);
    });


});



