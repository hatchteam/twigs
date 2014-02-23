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

describe("Directive: twgSortable", function () {
    var $compile, $rootScope, $scope;


    var dummyData = [
        {number: 1, name: 'one'},
        {number: 2, name: 'two'},
        {number: 3, name: 'three'}
    ];

    var tableMarkup = '<table><thead>' +
        '<tr><th twg-sortable="number">Number</th>' +
        '<th twg-sortable="name">Name</th></tr>' +
        '</thead>' +
        '<tr ng-repeat="data in dummyData | orderBy:orderPropertyName:orderProp">' +
        '<td>{{data.number}}</td>' +
        '<td>{{data.name}}</td>' +
        '</tr></table>';


    beforeEach(angular.mock.module('twigs.sortable'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $scope.dummyData = dummyData;
    }));

    function whenCompiling(element) {
        var compiledElement = $compile(element)($scope);
        $scope.$digest();
        return compiledElement;
    }

    function expectCellValue(tableElement, row, column, expectedValue) {
        var rows = tableElement.find('tbody tr');
        var cell = rows.eq(row).find('td').eq(column);
        expect(cell.text()).toBe(expectedValue);
    }

    it('should sort rows', function () {
        var element = whenCompiling(angular.element(tableMarkup));

        var headers = element.find('thead th');
        headers[0].click();
        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'two');
        expectCellValue(element, 2, 1, 'three');
        /* click on column header 'Name' */
        headers[1].click();
        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'three');
        expectCellValue(element, 2, 1, 'two');

    });

    it('should sort rows asc and desc', function () {
        var element = whenCompiling(angular.element(tableMarkup));

        var headers = element.find('thead th');

        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'two');
        expectCellValue(element, 2, 1, 'three');

        expect(headers.eq(0).hasClass('column-sort-none')).toBe(true);
        expect(headers.eq(1).hasClass('column-sort-none')).toBe(true);

        /* click on column header 'Name' */
        headers[1].click();

        expect(headers.eq(0).hasClass('column-sort-none')).toBe(true);
        expect(headers.eq(1).hasClass('column-sort-asc')).toBe(true);

        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'three');
        expectCellValue(element, 2, 1, 'two');

        /* click again on column header 'Name' */
        headers[1].click();

        expect(headers.eq(0).hasClass('column-sort-none')).toBe(true);
        expect(headers.eq(1).hasClass('column-sort-desc')).toBe(true);

        expectCellValue(element, 0, 1, 'two');
        expectCellValue(element, 1, 1, 'three');
        expectCellValue(element, 2, 1, 'one');
    });


    it('should sort rows asc and asc on another column', function () {
        var element = whenCompiling(angular.element(tableMarkup));

        var headers = element.find('thead th');

        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'two');
        expectCellValue(element, 2, 1, 'three');

        /* click on column header 'Name' */
        headers[1].click();

        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'three');
        expectCellValue(element, 2, 1, 'two');

        /* click on column header 'Number' */
        headers[0].click();

        expect(headers.eq(0).hasClass('column-sort-asc')).toBe(true);
        expect(headers.eq(1).hasClass('column-sort-none')).toBe(true);

        expectCellValue(element, 0, 1, 'one');
        expectCellValue(element, 1, 1, 'two');
        expectCellValue(element, 2, 1, 'three');
    });


});



