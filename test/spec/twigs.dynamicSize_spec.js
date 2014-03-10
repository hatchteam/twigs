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

describe("Directive: twgDynamicHeight", function () {
    var $compile, $rootScope, $scope;

    beforeEach(angular.mock.module('twigs.dynamicSize'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
    }));

    function whenCompiling(element) {
        var compiledElement = $compile(element)($scope);
        $scope.$digest();
        return compiledElement;
    }

    it("should not allow empty attribute", function () {
        var el = angular.element('<div twg-dynamic-height=""></div>');

        function doCompile() {
            var element = whenCompiling(el);
        }

        expect(doCompile).toThrow();
    });

    it("should not allow non-number attribute", function () {
        var el = angular.element('<div twg-dynamic-height="a"></div>');

        function doCompile() {
            var element = whenCompiling(el);
        }

        expect(doCompile).toThrow();
    });

    it("should not allow non whole number attribute", function () {
        var el = angular.element('<div twg-dynamic-height="1.1"></div>');

        function doCompile() {
            var element = whenCompiling(el);
        }

        expect(doCompile).toThrow();
    });


    it("should compile with valid  positive argument", function () {
        var el = angular.element('<div twg-dynamic-height="20"></div>');
        var element = whenCompiling(el);
    });

    it("should compile with valid negative argument", function () {
        var el = angular.element('<div twg-dynamic-height="-20"></div>');
        var element = whenCompiling(el);
    });


});



