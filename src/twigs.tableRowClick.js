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
 * @name twigs.tableRowClick.directive:twgTableRowClick
 * @element tr
 *
 * @description
 * For a better user experience, we want to be able to react to mouseclicks anywhere on a table row, not just one link in a cell.
 * This directive adds a mouse listener to the row and switches to the specified url when the user clicks anywhere on the row.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs.tableRowClick']);
 * ```
 *
 * ```html
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >
 *     ....
 * </tr>
 * ```
 *
 * Additionally it can handle events that bubble up from other elements with ng-click handlers or links within the row (and thus correctly ignoring these).
 *
 * Example: a Click on the button in the first row will not trigger a location change, but only invoke the 'doSomething()' method. A click on the second cell (the text) will trigger the url to change. Also a click on the third cell (link) will cause routing to /some/path and not /users/....
 *
 * ```html
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >
 *  <td><button ng-click="doSomething()">do it</button></td>
 *  <td>Some text</td>
 *  <td><a href="some/path">do it</a></td>
 * </tr>
 * ```
 *
 * ### Secure tableRowClick
 *
 * Additionally, if you use the twigs.security module, you can guard table-row clicks with security expressions:
 *
 * ```html
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}"
 *     twg-table-row-click-secure="hasRole('ADMIN')" >
 *  <td>Some text</td>
 * </tr>
 * ```
 *
 */
angular.module('twigs.tableRowClick')
  .directive('twgTableRowClick', function ($location, ExpressionEvaluator) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {


        /**
         * check permission if attribute is present
         */
        function isAllowed() {
          var permissionExpression = attrs.twgTableRowClickSecure;
          if (angular.isUndefined(permissionExpression) || permissionExpression === '') {
            return true;
          }

          return ExpressionEvaluator.evaluate(permissionExpression);
        }

        /**
         * if an element is clicked that has a 'ng-click' or 'href' attribute on it's own, do not reacte to this click.
         * also, if the clicked element has a parent somewhere with a 'ng-click' or 'href' attribute on its own, do not react to this click.
         */
        function isNgClickWrappedElement(domElement) {
          var wrappedElement = angular.element(domElement);
          if (angular.isDefined(wrappedElement.attr('ng-click')) || angular.isDefined(wrappedElement.attr('x-ng-click')) || angular.isDefined(wrappedElement.attr('href'))) {
            return true;
          }

          var matchingParent = wrappedElement.closest('[ng-click],[x-ng-click],[href]');
          return matchingParent.length > 0;
        }

        element.addClass('tablerow-clickable');
        var targetUrl = attrs.twgTableRowClick;

        element.on('click', function (event) {
          if (isAllowed() && !isNgClickWrappedElement(event.target)) {
            scope.$apply(function () {
              $location.path(targetUrl);
            });
          }
        });
      }
    };
  });
