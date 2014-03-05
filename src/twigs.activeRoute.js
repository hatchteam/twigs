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
 * @name twigs.activeRoute.directive:twgActiveRoute
 * @element ANY
 *
 * @description
 * In almost every webpage you'd like to mark elements as active, if the current view matches their link. E.g., in a navigation Menu,
 * the currently active item should be highlighted.
 *
 * Add the active-route directive to the navigation elements and specify a regex that should match the currently active route.
 * The directive will listen to url changes and add the css class **'active'** to the element.
 *
 * ```html
 * <ul>
 *   <li><a twg-active-route="/home" href="/home">Home</a></li>
 *   <li><a twg-active-route="/aboutMe" href="/aboutMe">About me</li>
 * </ul>
 * ```
 *
 * A more complex example:
 *
 * ```html
 * <ul>
 *   <li twg-active-route="/home"><a href="/home">Home</a></li>
 *   <li twg-active-route="/settings/.*">Settings
 *      <ul>
 *        <li twg-active-route="/settings/audio"><a href="/settings/audio">Audio</li>
 *        <li twg-active-route="/settings/video"><a href="/settings/video">Video</li>
 *      </ul>
 *   </li>
 * </ul>
 * ```
 *
 * You can also set your own css class: The directive will set a flag (**'twgActive'**) on the scope to true, if the url matches the specified
 * regex.
 *
 * ```html
 * <ul>
 *  <li><a twg-active-route="/home" href="/home"
 *           ng-class="{current: twgActive}">Home</a></li>
 *  <li>
 *      <a twg-active-route="/about" href="/aboutMe"
 *           ng-class="{current: twgActive}">About me</a></li>
 * </ul>
 * ```
 *
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