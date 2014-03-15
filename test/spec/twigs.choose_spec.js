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

describe("Directive: twgChoose", function () {
    var $compile, $rootScope, $scope;

    beforeEach(angular.mock.module('twigs.choose'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
    }));


    beforeEach(function () {

        $scope.countries = [
            {id: 1, name: 'Switzerland'},
            {id: 2, name: 'Austria'},
            {id: 3, name: 'France'}
        ];
        $scope.selectedCountry;
        $scope.selectedCountries;
    });

    function whenCompiling(element) {
        var compiledElement = $compile(element)($scope);
        $scope.$digest();
        return compiledElement;
    }

    it('should render single choice', function () {
        var el = angular.element('<twg-choose choices="countries" name="country" ng-model="selectedCountry" choice-displayname="name"> </twg-choose>');
        var element = whenCompiling(el);
        var selectElement = element.find('select[multiple=multiple]');
        expect(selectElement.length).toBe(0);
        selectElement = element.find('select');
        expect(selectElement.length).toBe(1);

        var optionOne = element.find('option[value=1]');
        var optionTwo = element.find('option[value=2]');
        var optionThree = element.find('option[value=3]');
        expect(optionOne.eq(0).text()).toBe('Switzerland');
        expect(optionTwo.eq(0).text()).toBe('Austria');
        expect(optionThree.eq(0).text()).toBe('France');
    });


    it('should render multiple choice', function () {
        var el = angular.element('<twg-choose choices="countries" name="country" ng-model="selectedCountries" multiple="true" choice-displayname="name"> </twg-choose>');
        var element = whenCompiling(el);
        var selectElement = element.find('select[multiple=multiple]');
        expect(selectElement.length).toBe(1);

        var optionOne = element.find('option[value=1]');
        var optionTwo = element.find('option[value=2]');
        var optionThree = element.find('option[value=3]');
        expect(optionOne.eq(0).text()).toBe('Switzerland');
        expect(optionTwo.eq(0).text()).toBe('Austria');
        expect(optionThree.eq(0).text()).toBe('France');
    });


});



