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

describe("Directive: twgTableRowClick", function () {
    var $compile, $rootScope, $scope, $location, Permissions;

    beforeEach(angular.mock.module('twigs.tableRowClick'));


    beforeEach(inject(function (_$compile_, _$rootScope_, _$location_, _Permissions_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $location = _$location_;
        Permissions = _Permissions_;
        $location.path('/home');
        $rootScope.$apply();
    }));

    function whenClickingRow(tableElement) {
        tableElement.find('tr').click();
        $rootScope.$apply();
    }

    function whenClickingChildElement(tableElement, childSelector) {
        tableElement.find(childSelector).click();
        $rootScope.$apply();
    }

    function whenCompiling(element) {
        var compiledElement = $compile(element)($scope);
        $scope.$digest();
        return compiledElement;
    }

    it("should add css class", function () {
        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td>some content</td></tr></table>');
        var element = whenCompiling(tableElement);
        expect(element.html()).toContain('class="tablerow-clickable"');
    });

    it("should change $location.path on click", function () {
        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td>some content</td></tr></table>');
        whenCompiling(tableElement);
        whenClickingRow(tableElement);
        expect($location.path()).toBe('/some/path/123');
    });

    it("should not change $location.path on click if permissions are missing", function () {

        spyOn(Permissions,'isAuthenticated').andReturn(false);

        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123" twg-table-row-click-secure="isAuthenticated()" ><td>some content</td></tr></table>');
        whenCompiling(tableElement);
        whenClickingRow(tableElement);
        expect($location.path()).toBe('/home');
    });

    it("should change $location.path on click if permissions are valid", function () {

        spyOn(Permissions,'hasRole').andReturn(true);

        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123" twg-table-row-click-secure="hasRole(\'myrole\')" ><td>some content</td></tr></table>');
        whenCompiling(tableElement);
        whenClickingRow(tableElement);
        expect($location.path()).toBe('/some/path/123');
    });

    it("should not change $location.path on click. when clicking element with separate ng-click", function () {
        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td><span id="someSpan" ng-click="someFunction()">some content</span></td></tr></table>');
        $scope.modelValue = false;
        whenCompiling(tableElement);
        whenClickingChildElement(tableElement, '#someSpan');
        expect($location.path()).toBe('/home');
    });

    it("should not change $location.path on click. when clicking element that has a parent with separate ng-click", function () {
        var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td><span ng-click="someFunction()"><span id="someSpan">some content</span></span></td></tr></table>');
        $scope.modelValue = false;
        whenCompiling(tableElement);
        whenClickingChildElement(tableElement, '#someSpan');
        expect($location.path()).toBe('/home');
    });


});

