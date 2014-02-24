'use strict';

/**
 * @ngdoc directive
 * @name twigs.activeRoute:twgActiveRoute
 * @element ANY
 *
 * @description
 * Marks an element as 'active', if the specified regex matches the current route
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