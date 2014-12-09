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
 * @ngdoc object
 * @name twigs.security.service:ExpressionEvaluator
 *
 * @description
 *  ExpressionEvaluator is used by twigs.security directives.
 *  It validates and evaluates given expressions against the currently loaded user and its permissions.
 **/
  .service('ExpressionEvaluator', function (Authorizer) {

    if (angular.isUndefined(Authorizer)) {
      throw 'We need Authorizer Service for evaluating!';
    }

    var VALID_EXPRESSION_PATTERNS = [
      /hasPermission\(.*\)/,
      /isAuthenticated\(\)/
    ];

    function throwIfInvalidExpression(expression) {
      if (angular.isUndefined(expression) || expression.length < 1) {
        throw 'Invalid permission expression: cannot be empty string or undefined (' + expression + ')';
      }

      var isValidPattern = false;
      VALID_EXPRESSION_PATTERNS.forEach(function (pattern) {
        if (isValidPattern) {
          // break the loop;
          return;
        }
        if (pattern.test(expression)) {
          isValidPattern = true;
        }
      });

      if (isValidPattern !== true) {
        throw 'Invalid permission expression: ' + expression;
      }
    }

    function evaluate(expression) {
      throwIfInvalidExpression(expression);
      /*eslint no-eval:0*/
      return eval('Authorizer.' + expression);
    }

    return {

      /**
       * @ngdoc function
       * @name twigs.security.service:ExpressionEvaluator#evaluate
       * @methodOf twigs.security.service:ExpressionEvaluator
       *
       * @param {string} expression The expression to evaluate
       *   This must match one of the following regular expressions:
       *
       *   * /hasPermission\(.*\)/
       *   * /hasRole\(.*\)/
       *   * /isAuthenticated\(\)/
       *
       * @returns {boolean} The return value of the evaluated expression.
       */
      evaluate: evaluate
    };
  })

/**
 * @ngdoc directive
 * @name twigs.security.directive:twgSecureShow
 * @element ANY
 *
 * @description
 *   Shows an element only if given expression evaluates to true.
 *   Allowed expressions are:
 *
 *   * hasRole()
 *   * isAuthenticated()
 *   * hasPermission('some','arguments')
 *
 *  @example
 *
 *  ```html
 *  <div twg-secure-show="hasPermission('entity','CREATE')"></div>
 *  ```
 *
 **/
  .directive('twgSecureShow', function (ExpressionEvaluator, $animate) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {

        function evaluate() {
          var result = ExpressionEvaluator.evaluate(attrs.twgSecureShow);
          $animate[result ? 'removeClass' : 'addClass'](element, 'ng-hide');
        }

        scope.$on('userInitialized', function () {
          evaluate();
        });

        scope.$on('userCleared', function () {
          evaluate();
        });

        evaluate();
      }
    };
  })

/**
 * @ngdoc directive
 * @name twigs.security.directive:twgSecureEnabled
 * @element input
 *
 * @description
 *   Enables a input field only if the given expression evaluates to true.
 *   Allowed expressions are:
 *
 *   * isAuthenticated()
 *   * hasPermission('some','arguments')
 *
 *  @example
 *
 *  ```html
 *  <input type="text" twg-secure-enabled="hasPermission('entity','DELETE')"></input>
 *  ```
 *  ```html
 *  <input type="text" twg-secure-enabled="isAuthenticated()"></input>
 *  ```
 *
 **/
  .directive('twgSecureEnabled', function (ExpressionEvaluator) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {

        function evaluate() {
          var result = ExpressionEvaluator.evaluate(attrs.twgSecureEnabled);
          element.attr('disabled', !result);
        }

        scope.$on('userInitialized', function () {
          evaluate();
        });

        scope.$on('userCleared', function () {
          evaluate();
        });

        evaluate();
      }
    };
  });
