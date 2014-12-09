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
  var $q, $compile, $rootScope, $scope, $location, Authorizer;

  beforeEach(angular.mock.module('twigs.tableRowClick'));


  beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _$location_, _Authorizer_) {
    $q = _$q_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $location = _$location_;
    Authorizer = _Authorizer_;
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

  it("should not change $location.path on click if not authenticated", function () {

    spyOn(Authorizer, 'isAuthenticated').and.returnValue(false);

    var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123" twg-table-row-click-secure="isAuthenticated()" ><td>some content</td></tr></table>');
    whenCompiling(tableElement);
    whenClickingRow(tableElement);
    expect($location.path()).toBe('/home');
  });

  it("should not change $location.path on click if permissions are missing", function () {

    var deferred = $q.defer();
    deferred.resolve(false);
    spyOn(Authorizer, 'hasPermission').and.returnValue(deferred.promise);

    var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123" twg-table-row-click-secure="hasPermission()" ><td>some content</td></tr></table>');
    whenCompiling(tableElement);
    whenClickingRow(tableElement);
    expect($location.path()).toBe('/home');
  });

  it("should change $location.path on click if permissions are valid", function () {

    var deferred = $q.defer();
    deferred.resolve(true);
    spyOn(Authorizer, 'hasPermission').and.returnValue(deferred.promise);

    var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123" twg-table-row-click-secure="hasPermission({some:\'thing\'})" ><td>some content</td></tr></table>');
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

  it("should not change $location.path on click. when clicking element with href", function () {
    var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td><span id="someSpan" href="some/path">some content</span></td></tr></table>');
    $scope.modelValue = false;
    whenCompiling(tableElement);
    whenClickingChildElement(tableElement, '#someSpan');
    expect($location.path()).toBe('/home');
  });

  it("should not change $location.path on click. when clicking element that has a parent  with href", function () {
    var tableElement = angular.element('<table><tr twg-table-row-click="some/path/123"><td><span href="some/path""><span id="someSpan">some content</span></span></td></tr></table>');
    $scope.modelValue = false;
    whenCompiling(tableElement);
    whenClickingChildElement(tableElement, '#someSpan');
    expect($location.path()).toBe('/home');
  });


});

