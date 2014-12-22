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
angular.module('twigs.security')

/**
 * @ngdoc directive
 * @name twigs.security.directive:twgProtected
 * @element ANY
 *
 * @description
 *   Protects a html element: either hides it or disables it if currently logged in user does not have
 *   specified permissions. (Permissions are evaluated via your registered evaluator)
 *
 *   Specify whether to hide or disable with attributes twg-protected-hide and twg-protected-disable.
 *   If you do not specify any, element is hidden if permissions are missing.
 *
 *   If you set twg-protected="true", a user must be logged in. no further permission evaluation is done.
 *   If you set twg-protected="{....}", permissions are evaluated via your registered evaluator.
 *
 *  @example
 *
 * Hide an element if no user is logged in.
 *  ```html
 *  <div twg-protected="true"></div>
 *  ```
 *
 * is equivalent to:
 *  ```html
 *  <div twg-protected="true" twg-protected-hide ></div>
 *  ```
 *
 * Disable element if no user is logged in.
 *  ```html
 *  <input twg-protected="true" twg-protected-disable />
 *  ```
 *
 * Hide element if permissions are not given
 *  ```html
 *  <div twg-protected="{roles:['some']}" ></div>
 *
 *  <div twg-protected="{mustBeAdmin:true}" ></div>
 *  ```
 **/
  .directive('twgProtected', function (Authorizer, $animate) {
    return {
      restrict: 'A',
      scope: {
        twgProtected: '=',
        twgProtectedDisable: '@',
        twgProtectedHide: '@'
      },
      link: function (scope, element) {

        function manipulateElement(result) {
          if (angular.isDefined(scope.twgProtectedDisable)) {
            if (result === true) {
              element.removeAttr('disabled');
            } else {
              element.attr('disabled', 'disabled');
            }
          } else {
            $animate[result ? 'removeClass' : 'addClass'](element, 'ng-hide');
          }
        }

        function evaluate() {
          if (scope.twgProtected === true) {
            Authorizer.getUser()
              .then(function () {
                manipulateElement(true);
              }, function () {
                manipulateElement(false);
              });
          } else {
            Authorizer.hasPermission(scope.twgProtected)
              .then(manipulateElement);
          }
        }

        // if value of the attribute changes, re-evaluate
        scope.$watch('twgProtected', function () {
          evaluate();
        });


      }
    };
  });
