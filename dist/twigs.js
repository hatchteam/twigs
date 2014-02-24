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
 *  <li><a twg-active-route="/home" href="/home" ng-class="{current: twgActive}">Home</a></li>
 *  <li><a twg-active-route="/about" href="/aboutMe" ng-class="{current: twgActive}">About me</li>
 * </ul>
 * ```
 *
 */
angular.module('twigs.activeRoute', []).directive('twgActiveRoute', [
  '$location',
  '$parse',
  function ($location, $parse) {
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
  }
]);
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
 * @ngdoc object
 * @name twigs.flow.provider:FlowProvider
 *
 * @description
 * In more complex applications we'd like to chain different views into business processes, i.e. flows.
 *
 * These can be wizard-like processes with many steps or simple ones that guide the user through only a few views.
 *
 * **Flow** provides you with a simple mechanism to define which angular route definitions you want to chain to a process.
 * It allows you to define allowed transitions between steps and gives you easy access to the shared model across all steps.
 *
 * ### Flow creation
 *
 * In the **config** function of your application's main module, you can define the flows:
 *
 * ```javascript
 * var App = angular.module('Main',['twigs.flow']);
 *
 * App.config(function ($routeProvider,FlowProvider) {
 *
 * // define your routes as usual
 * $routeProvider
 *     .when('/firstStep', {
 *         templateUrl: 'views/wizard_first.html',
 *         controller: 'WizardCtrl'
 *     })
 *     .when('/secondStep', {
 *         templateUrl: 'views/wizard_second.html',
 *         controller: 'WizardCtrl'
 *     })
 *     .when('/thirdStep', {
 *         templateUrl: '/views/wizard_third.html',
 *         controller: 'WizardCtrl'
 *     });
 *
 * // define a flow
 * $flowProvider.flow('myWizard')
 *     .step({
 *         'id': 'first',  // a unique step id within this flow.
 *         'route': '/firstStep',  // this matches the first route definition from above
 *         'transitions': {
 *             'next': 'second',
 *             'skip': 'third',    // allows to skip step two and jump directly to the last step
 *         }
 *     })
 *     .step({
 *         'id': 'second',
 *         'route': '/secondStep',
 *         'transitions': {
 *             'previous': 'first',    // allows to switch to the previous step
 *             'next': 'third' // allows to proceed to the next step
 *         }
 *     }).step({
 *         'id': 'third',
 *         'route': '/thirdStep',
 *         'transitions': {
 *             'previous': 'second'
 *         }
 *     }).createFlow();
 *
 * });
 * ```
 *
 * In this example, the steps share the same controller. For more complex flows, you'd want to use
 * separate controllers for each step.
 *
 *
 * See [Flow](#/api/twigs.flow.service:Flow) for more information on how to use Flow in your controllers.
 */
/**
 * @ngdoc object
 * @name twigs.flow.service:Flow
 *
 * @description
 * ### Flow navigation
 *
 * Within your controller, you have access to the shared model and can navigate between the steps.
 *
 * ```javascript
 * angular.module('Main')
 *     .controller('WizardCtrl', function ($scope, Flow) {
 *
 *     // the Flow service holds the shared model
 *     $scope.flowmodel = Flow.getModel();
 *
 *     $scope.onButtonPrevious = function () {
 *         Flow.previous($scope.flowmodel);
 *     };
 *
 *     $scope.onButtonNext = function () {
 *         Flow.next($scope.flowmodel);
 *     };
 *
 * });
 * ```
 *
 *
 * See [FlowProvider](#/api/twigs.flow.provider:FlowProvider) for more information on how to set up flows.
 */
angular.module('twigs.flow', []).provider('Flow', function () {
  this.flows = {};
  this.$get = [
    '$location',
    '$log',
    function ($location, $log) {
      var flows = this.flows;
      /**
             * finds a step in a flow with the given route (url path)
             */
      function findFlowAndStepForRoute(route) {
        $log.debug('looking for step with route ', route);
        var retVal;
        angular.forEach(flows, function (propertyValue, propertyName) {
          angular.forEach(flows[propertyName].steps, function (step) {
            if (step.route === route) {
              retVal = {
                flow: flows[propertyName],
                step: step
              };
              return false;
            }
          });
        });
        if (angular.isUndefined(retVal)) {
          $log.warn('no flow-step found for route ', route);
        }
        return retVal;
      }
      /**
             * finds a step object with the given id within the given flow
             */
      function findStepForId(stepId, currentFlowId) {
        var currentFlow = flows[currentFlowId];
        if (!angular.isUndefined(currentFlow.steps[stepId])) {
          return currentFlow.steps[stepId];
        }
        throw 'no step with id';
      }
      function throwErrorIfJumpIsNotAllowed(transitions, targetStepId) {
        // check if step defines a transition to the desired targetStepId
        var stepAllowed = false;
        angular.forEach(transitions, function (value) {
          if (value === targetStepId) {
            stepAllowed = true;
          }
        });
        if (stepAllowed !== true) {
          throw 'transition to step ' + targetStepId + ' is not allowed!';
        }
      }
      var FlowService = {
          currentFlowId: undefined,
          currentFlowModel: {},
          getModel: function () {
            return this.currentFlowModel;
          },
          next: function () {
            var targetStepId, targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
            this.currentFlowId = flowAndStep.flow.id;
            targetStepId = flowAndStep.step.transitions.next;
            if (angular.isUndefined(targetStepId)) {
              throw 'step does not define a transition \'next\'';
            }
            targetStep = findStepForId(targetStepId, this.currentFlowId);
            $location.path(targetStep.route);
          },
          previous: function () {
            var targetStepId, targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
            this.currentFlowId = flowAndStep.flow.id;
            targetStepId = flowAndStep.step.transitions.previous;
            if (angular.isUndefined(targetStepId)) {
              throw 'step does not define a transition \'previous\'';
            }
            targetStep = findStepForId(targetStepId, this.currentFlowId);
            $location.path(targetStep.route);
          },
          toStep: function (targetStepId) {
            var targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
            this.currentFlowId = flowAndStep.flow.id;
            throwErrorIfJumpIsNotAllowed(flowAndStep.step.transitions, targetStepId);
            targetStep = findStepForId(targetStepId, this.currentFlowId);
            $location.path(targetStep.route);
          },
          isCurrentStep: function (stepId) {
            var flowAndStep, targetStep, currentPath = $location.path();
            flowAndStep = findFlowAndStepForRoute(currentPath);
            if (angular.isUndefined(flowAndStep)) {
              throw 'no flow found for path ' + currentPath;
            }
            targetStep = findStepForId(stepId, flowAndStep.flow.id);
            return $location.path() === targetStep.route;
          },
          finish: function () {
            this.currentFlowId = undefined;
            this.currentFlowModel = undefined;
          }
        };
      return FlowService;
    }
  ];
  /**
         * @ngdoc function
         * @name twigs.flow.provider:FlowProvider#flow
         * @methodOf twigs.flow.provider:FlowProvider
         *
         * @description
         * Starts a new flow configuration
         *
         * @param {string[]} flwoId A unique id for this new flow
         * @returns {object} The FlowProvider
         */
  this.flow = function (flowId) {
    if (!angular.isUndefined(this.currentFlowId)) {
      throw 'flow configuration error! use \'$flowProvider.createFlow()\' to complete previous flow';
    }
    this.currentFlowId = flowId;
    this.flows[flowId] = {
      id: flowId,
      steps: {}
    };
    return this;
  };
  /**
         * @ngdoc function
         * @name twigs.flow.provider:FlowProvider#step
         * @methodOf twigs.flow.provider:FlowProvider
         *
         * @description
         * Adds a step to the current flow
         *
         * @param {object} stepConfig Step configuration with properties: **id**, **route**, and **transitions**
         *
         *    * `id` the unique id of the new step
         *    * `route` a string that must match a path from a route definition
         *    * `transitions` object that contains all valid transitions to other steps
         *
         * @returns {object} The FlowProvider
         */
  this.step = function (stepConfig) {
    if (angular.isUndefined(this.currentFlowId)) {
      throw 'flow configuration error! use \'$flowProvider.flow(\'myFlow\').step(...)';
    }
    checkStepConfig(stepConfig);
    var currentFlow = this.flows[this.currentFlowId];
    checkStepIdInFlow(currentFlow, stepConfig.id);
    currentFlow.steps[stepConfig.id] = stepConfig;
    return this;
  };
  /**
         * @ngdoc function
         * @name twigs.flow.provider:FlowProvider#createFlow
         * @methodOf twigs.flow.provider:FlowProvider
         *
         * @description
         * Completes the flow creation. You must invoke this function before starting a new flow with **flow()**.
         */
  this.createFlow = function () {
    this.currentFlowId = undefined;  // TODO: maybe check transitions:  check if target of transition is a valid stepId that exists in the flow
  };
  /**
         * throws an error if step id already exists in givenFlow
         */
  function checkStepIdInFlow(flow, stepId) {
    if (angular.isDefined(flow.steps[stepId])) {
      var error = 'a step with id "' + stepId;
      error += '" is already configured in flow "' + flow.id + '"';
      throw error;
    }
  }
  /*
         * throws an error if the given stepconfig is invalid
         */
  function checkStepConfig(stepconfig) {
    if (angular.isUndefined(stepconfig.id)) {
      throw 'step must have an id';
    }
    if (angular.isUndefined(stepconfig.route)) {
      throw 'step must have a route';
    }
  }
});
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
 * @ngdoc service
 * @name twigs.globalHotKeys.service:GlobalHotKeysService
 *
 * @description
 * GlobalHotkeys allows you to assign actions to specific keyboard key combinations.
 * In order for it to work, add the 'twg-global-hotkeys' directive to the top-element of your angular application (e.g. the html-element in a single page application).
 *
 * **Note:** All keypress/keydown events within input fields (input/textarea/select), links and buttons do not trigger the hotkey callback.
 *
 * ### Globally defined hotkeys
 * Globally defined hotkeys are available on all pages (except if explicitly overridden by path-specific hotkeys). You can define them in the **run** function of your Application's main module.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs.globalHotKeys']);
 *
 * App.run(function ($location, GlobalHotKeysService) {
 *
 *    GlobalHotKeysService.registerGlobalHotKeys(["alt+h", "shift+h"], function () {
 *        // go to home view
 *        $location.path('/#');
 *    });
 *
 *
 *    GlobalHotKeysService.registerGlobalHotKeys(["alt+a", "shift+a"], function () {
 *        // do something here
 *    });
 *
 * });
 * ```
 *
 *
 * ### Path-specific hotkeys
 * You can define path-specific hotkeys which can override globally defined hotkeys. These will only be active for the current page.
 *
 * ```javascript
 *
 * App.controller('SomeController', function (GlobalHotKeysService) {
 *
 *    GlobalHotKeysService.registerPageHotKey("alt+i", function () {
 *        // do something here
 *    });
 *
 * });
 *
 * ```
 *
 */
angular.module('twigs.globalHotKeys', []).factory('GlobalHotKeysService', [
  '$location',
  function ($location) {
    var pageHotKeys = {}, globalHotKeys = {};
    function getPageHotKeyAction(page, hotKey) {
      var hotKeys = pageHotKeys[page];
      if (angular.isUndefined(hotKeys)) {
        return undefined;
      }
      return hotKeys[hotKey.toLowerCase()];
    }
    function getGlobalHotKeyAction(hotKey) {
      return globalHotKeys[hotKey.toLowerCase()];
    }
    function registerPageHotKey(hotKey, actionFunction) {
      var page = $location.path();
      var hotKeys = pageHotKeys[page];
      if (angular.isUndefined(hotKeys)) {
        hotKeys = {};
        pageHotKeys[page] = hotKeys;
      }
      hotKeys[hotKey.toLowerCase()] = actionFunction;
    }
    function registerPageHotKeys(hotKeys, actionFunction) {
      angular.forEach(hotKeys, function (key) {
        registerPageHotKey(key, actionFunction);
      });
    }
    function registerGlobalHotKey(hotKey, actionFunction) {
      globalHotKeys[hotKey.toLowerCase()] = actionFunction;
    }
    function registerGlobalHotKeys(hotKeys, actionFunction) {
      angular.forEach(hotKeys, function (key) {
        registerGlobalHotKey(key, actionFunction);
      });
    }
    var serviceInstance = {
        getPageHotKeyAction: getPageHotKeyAction,
        getGlobalHotKeyAction: getGlobalHotKeyAction,
        registerPageHotKey: registerPageHotKey,
        registerPageHotKeys: registerPageHotKeys,
        registerGlobalHotKey: registerGlobalHotKey,
        registerGlobalHotKeys: registerGlobalHotKeys
      };
    return serviceInstance;
  }
]).directive('twgGlobalHotkeys', [
  '$location',
  '$rootScope',
  'GlobalHotKeysService',
  function ($location, $rootScope, GlobalHotKeysService) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        function isForbiddenElement(event) {
          switch (getTarget(event).tagName.toLowerCase()) {
          case 'a':
          case 'button':
          case 'input':
          case 'select':
          case 'textarea':
            return true;
          default:
            return false;
          }
        }
        /*
                 * register to the keypress event (works for most keys, i.e. this is the 'normal' way)
                 */
        element.bind('keypress', function (event) {
          if (isForbiddenElement(event)) {
            return;
          }
          handleHotKey(event);
        });
        /**
                 * register to keydown to handle 'alt+' in chrome
                 */
        element.bind('keydown', function (event) {
          if (isForbiddenElement(event)) {
            return;
          }
          if (event.altKey !== true) {
            return;
          }
          handleHotKey(event);
        });
        function handleHotKey(event) {
          var hotKey = '';
          if (event.ctrlKey) {
            hotKey = appendKey(hotKey, 'ctrl');
          }
          if (event.altKey) {
            hotKey = appendKey(hotKey, 'alt');
          }
          if (event.shiftKey) {
            hotKey = appendKey(hotKey, 'shift');
          }
          hotKey = appendKey(hotKey, String.fromCharCode(event.which));
          var pageAction = GlobalHotKeysService.getPageHotKeyAction($location.path(), hotKey);
          if (angular.isDefined(pageAction)) {
            pageAction();
          } else {
            var globalAction = GlobalHotKeysService.getGlobalHotKeyAction(hotKey);
            if (angular.isDefined(globalAction)) {
              globalAction();
            }
          }
          scope.$apply();
        }
        var appendKey = function (oldHotKey, nextKey) {
          var hotKey = oldHotKey;
          if (oldHotKey.length > 0) {
            hotKey += '+';
          }
          hotKey += nextKey;
          return hotKey;
        };
        /**
                 * returns the dom-element that fired the event.
                 * (different browser handling)
                 */
        var getTarget = function (event) {
          var target;
          if (!event) {
            event = window.event;
          }
          if (event.target) {
            target = event.target;
          } else if (event.srcElement) {
            target = event.srcElement;
          }
          // defeat Safari bug
          if (target.nodeType === 3) {
            target = target.parentNode;
          }
          return target;
        };
      }
    };
  }
]);
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
 * @ngdoc overview
 * @name twigs
 *
 * @description
 * The main module which collects all other Twigs modules.
 * So for convenience, use 'twigs' as a dependency in your module to include all Twigs modules at once.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs']);
 * ```
 */
angular.module('twigs', [
  'twigs.globalHotkeys',
  'twigs.activeRoute',
  'twigs.tableRowClick'
]);
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
angular.module('twigs.sortable', []).directive('twgSortable', function () {
  var CLASS_SORT_ASC = 'column-sort-asc';
  var CLASS_SORT_DESC = 'column-sort-desc';
  var CLASS_SORT_NONE = 'column-sort-none';
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
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >  ....</tr>
 * ```
 *
 * Additionally it can handle events that bubble up from other elements with ng-click handlers within the row (and thus correctly ignoring these).
 *
 * Example: a Click on the button in the first row will not trigger a location change, but only invoke the 'doSomething()' method. A click on the second cell (the text) will trigger the url to change.
 *
 * ```html
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >
 *  <td><button ng-click="doSomething()">do it</button></td>
 *  <td>Some text</td>
 * </tr>
 * ```
 */
angular.module('twigs.tableRowClick', []).directive('twgTableRowClick', [
  '$location',
  function ($location) {
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
        element.addClass('tablerow-clickable');
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
  }
]);