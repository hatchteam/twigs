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


angular.module('twigs.dynamicSize', [])

    .service('DynamicSizeHelper', function () {

        function isNumber(n) {
            return !isNaN(parseInt(n, 10)) && isFinite(n);
        }

        // TODO: parse into whole numbers, no fractions
        function parseDynamicSizeAttribute(attributeValue) {
            if (attributeValue.length === 0) {
                throw "Please specify a dynamic size attribute!";
            }

            if (!isNumber(attributeValue)) {
                throw "Dynamic size attribute must be numeric!";
            }

            if (attributeValue % 1 !== 0) {
                throw "Dynamic size attribute must be a whole number!";
            }

            return parseInt(attributeValue, 10);
        }


        return {
            parseDynamicSizeAttribute: parseDynamicSizeAttribute
        };
    })

/**
 * @ngdoc directive
 * @name twigs.dynamicSize.directive:twgDynamicHeight
 * @element ANY
 *
 * @description
 * Allows to dynamically adjust the height of an element on every window resize event.
 *
 * In this example, the given div will always have the height: windowHeight - 100px.
 *
 * ```html
 * <div twg-dynamic-height="-100" >
 * </div>
 * ```
 */
    .directive('twgDynamicHeight', function ($window, DynamicSizeHelper) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var theWindow = angular.element($window);
                var heightDelta = DynamicSizeHelper.parseDynamicSizeAttribute(attrs.twgDynamicHeight);

                function dynamicResize() {
                    var newHeight = heightDelta + theWindow.height();
                    console.log('setting height of ', element, ' to ' + newHeight);
                    element.css('height', newHeight);
                }

                theWindow.resize(function () {
                    dynamicResize();
                });

                dynamicResize();
            }
        };
    })


/**
 * @ngdoc directive
 * @name twigs.dynamicSize.directive:twgDynamicWidth
 * @element ANY
 *
 * @description
 * Allows to dynamically adjust the width of an element on every window resize event.
 *
 * In this example, the given div will always have the width: windowWidth + 20px.
 *
 * ```html
 * <div twg-dynamic-width="20" >
 * </div>
 * ```
 */
    .directive('twgDynamicWidth', function ($window, DynamicSizeHelper) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var theWindow = angular.element($window);
                var widthDelta = DynamicSizeHelper.parseDynamicSizeAttribute(attrs.twgDynamicWidth);

                function dynamicResize() {
                    element.css('width', widthDelta + theWindow.width());
                }

                theWindow.resize(function () {
                    dynamicResize();
                });

                dynamicResize();

            }
        };
    });



