'use strict';

describe("Directive: twgTableRowClick", function () {
    var $compile, $rootScope, $scope, $location;

    beforeEach(module('twigs.tableRowClick'));


    beforeEach(inject(function (_$compile_, _$rootScope_, _$location_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $location = _$location_;

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

    function whenCompiling(tableElement) {
        var element = $compile(tableElement)($scope);
        $scope.$digest();
        return element;
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

