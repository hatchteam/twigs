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

/**
 * Can be added to a table to enable clicking of a single record by clicking anywhere on the table row, not only by pressing a link within one cell (e.g. to edit an item in the table)
 *
 *  See readme.md for more information
 */
angular.module('twigs.tableRowClick', [])
    .directive('twgTableRowClick', function ($location) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                /**
                 * if an element is clicked that has a 'ng-click' attribute on it's own, do not reacte to this click.
                 * also, if the clicked element has a parent somewhere with a 'ng-click' attribute on its own, do not react to this click.
                 */
                function isNgClickWrappedElement(domElement) {
                    var element = $(domElement);
                    if (angular.isDefined(element.attr('ng-click')) || angular.isDefined(element.attr('x-ng-click'))) {
                        return true;
                    }

                    var matchingParent = element.closest('[ng-click],[x-ng-click]');
                    if (matchingParent.length > 0) {
                        return true;
                    }

                    return false;
                }

                element.addClass("tablerow-clickable");
                var targetUrl = attrs.twgTableRowClick;

                element.on('click', function (event) {
                    if (!isNgClickWrappedElement(event.target)) {
                        scope.$apply(function () {
                            $location.path(targetUrl);
                        });
                    }
                });
            }
        };
    });