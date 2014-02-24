'use strict';

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

/**
 * @ngdoc directive
 * @name twigs.sortable.directive:twgSortable
 * @element th, td
 *
 * @description
 * In a modern user interface, we expect tables to be sortable.
 * The twgSortable directive provides an easy way to define sortable tables. Just specify the attribute's name
 * you want to sort by (in the example: 'name' and 'number').
 *
 * The directive will set the scope variables **orderPropertyName** and **orderProp** which you can use
 * in the usual way in ngRepeat.
 *
 * On the first click, the rows are sorted ascending, on a second click to the same column header, the rows are
 * sorted descending.
 *
 * In Addition, marker css classes are added the column headers, which enables specific styling (e.g. arrows).
 *
 * ```html
 * <table>
 *  <thead>
 *   <tr>
 *     <th twg-sortable="name">Name</th>
 *     <th twg-sortable="number">Number</th>
 *   </tr>
 *   </thead>
 *   <tbody>
 *     <tr ng-repeat="data in dummyData | orderBy:orderPropertyName:orderProp">
 *       <td>{{data.number}}</td>
 *       <td>{{data.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 */
angular.module('twigs.sortable', [])

    .directive('twgSortable', function () {

        var CLASS_SORT_ASC = "column-sort-asc";
        var CLASS_SORT_DESC = "column-sort-desc";
        var CLASS_SORT_NONE = "column-sort-none";

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var _getClass;

                var propertyName = attrs.twgSortable;

                _getClass = function (prop) {
                    if (scope.orderPropertyName === prop) {
                        if (scope.orderProp) {
                            return CLASS_SORT_DESC;
                        } else {
                            return CLASS_SORT_ASC;
                        }
                    } else {
                        return CLASS_SORT_NONE;
                    }
                };

                element.bind('click', function () {

                    if (scope.orderPropertyName === propertyName) {
                        scope.orderProp = !scope.orderProp;
                    } else {
                        scope.orderPropertyName = propertyName;
                        scope.orderProp = false;
                    }

                    element.removeClass(CLASS_SORT_DESC);
                    element.removeClass(CLASS_SORT_ASC);
                    element.removeClass(CLASS_SORT_NONE);

                    element.addClass(_getClass(propertyName));

                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

                scope.$watch('orderPropertyName', function (newProperty, oldProperty) {
                    if (propertyName === oldProperty) {
                        element.removeClass(CLASS_SORT_ASC);
                        element.removeClass(CLASS_SORT_DESC);

                        if (!element.hasClass(CLASS_SORT_NONE)) {
                            element.addClass(CLASS_SORT_NONE);
                        }
                    }
                });

                element.addClass(CLASS_SORT_NONE);
            }
        };
    });