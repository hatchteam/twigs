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


describe('Service: ChooseConfig', function () {
    var ChooseConfig;
    beforeEach(angular.mock.module('twigs.choose'));
    beforeEach(inject(function (_ChooseConfig_) {
        ChooseConfig = _ChooseConfig_;
    }));


    it('should return default noResultMessage', function () {
        expect(ChooseConfig.getNoResultMessage()).toBeDefined();
    });

    it('should save noResultMessage', function () {
        ChooseConfig.setNoResultMessage('my custom');
        expect(ChooseConfig.getNoResultMessage()).toBeDefined();
        expect(ChooseConfig.getNoResultMessage()).toBe('my custom');
    });

});


describe('Service: ChooseHelper', function () {
    var ChooseHelper;
    beforeEach(angular.mock.module('twigs.choose'));
    beforeEach(inject(function (_ChooseHelper_) {
        ChooseHelper = _ChooseHelper_;
    }));


    describe('convertExternToInternMultiple', function () {
        it('should correctly convert', function () {
            var externModel = [
                {id: 1, name: 'one'},
                {id: 2, name: 'two'}
            ];
            expect(ChooseHelper.convertExternToInternMultiple(externModel)).toEqual([1, 2]);
        });

        it('should return undefined on undefined input', function () {
            var externModel;
            expect(ChooseHelper.convertExternToInternMultiple(externModel)).toBeUndefined();
        });

        it('should throw on invalid input', function () {
            var externModel = {'name': 'this is an object, instead of an array'};

            function wrap() {
                ChooseHelper.convertExternToInternMultiple(externModel)
            }

            expect(wrap).toThrow();
        });
    });


});

describe('Directive: twgChoose', function () {
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
        var el = angular.element('<twg-choose-single choices="countries" name="country" ng-model="selectedCountry" choice-displayname="name"> </twg-choose-single>');
        var element = whenCompiling(el);

        var optionOne = element.find('option[value=1]');
        var optionTwo = element.find('option[value=2]');
        var optionThree = element.find('option[value=3]');
        expect(optionOne.eq(0).text()).toBe('Switzerland');
        expect(optionTwo.eq(0).text()).toBe('Austria');
        expect(optionThree.eq(0).text()).toBe('France');
    });


    it('should render multiple choice', function () {
        var el = angular.element('<twg-choose-multiple choices="countries" name="country" ng-model="selectedCountries" multiple="true" choice-displayname="name"> </twg-choose-multiple>');
        var element = whenCompiling(el);

        var optionOne = element.find('option[value=1]');
        var optionTwo = element.find('option[value=2]');
        var optionThree = element.find('option[value=3]');
        expect(optionOne.eq(0).text()).toBe('Switzerland');
        expect(optionTwo.eq(0).text()).toBe('Austria');
        expect(optionThree.eq(0).text()).toBe('France');
    });


});



