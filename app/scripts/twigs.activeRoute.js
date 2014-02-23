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
 *  Marks an element as 'active', if the specified regex matches the current route
 *
 *  See readme.md for more information
 */
angular.module('twigs.activeRoute', [])

    .directive('twgActiveRoute', function ($location, $parse) {
        return {
            restrict: 'AC',
            scope: true,
            link: function ($scope, element, attrs) {
                var ACTIVE_CLASS = 'active';
                var modelSetter = $parse('twgActive').assign;
                var watcher = angular.noop;

                $scope.twgActive = false;

                function watchRegex(matcherRegex) {
                    watcher = function () {
                        var regexp, match;
                        regexp = new RegExp('^' + matcherRegex + '$', ['i']);
                        match = regexp.test($location.path());
                        modelSetter($scope, match);
                        if (match) {
                            element.addClass(ACTIVE_CLASS);
                        } else {
                            element.removeClass(ACTIVE_CLASS);
                        }
                    };
                    watcher();
                }


                if (angular.isUndefined(attrs.twgActiveRoute)) {
                    $scope.$watch(attrs.twgActiveRoute, function () {
                        watchRegex(attrs.twgActiveRoute);
                    });
                } else {
                    watchRegex(attrs.twgActiveRoute);
                }


                $scope.$on('$routeChangeSuccess', function () {
                    watcher();
                });

            }
        };
    });