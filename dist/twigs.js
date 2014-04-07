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
 *  define all modules here!
 *  If we don't do this, we get problems when concatenating all files into one (grunt concatenates in alphabetical order)
 */
angular.module('twigs.menu', []);
angular.module('twigs.activeRoute', []);
angular.module('twigs.devel', ['ngCookies']);
angular.module('twigs.dynamicSize', []);
angular.module('twigs.flow', []);
angular.module('twigs.templates', []);
angular.module('twigs.globalHotkeys', ['twigs.templates']);
angular.module('twigs.security', []);
angular.module('twigs.sortable', []);
angular.module('twigs.tableRowClick', ['twigs.security']);
angular.module('twigs.protectedRoutes', [
  'twigs.security',
  'ngRoute'
]);
/**
 * @ngdoc overview
 * @name twigs
 *
 * @description
 * The main module which collects all other Twigs modules.
 * So for convenience, use 'twigs' as a dependency in your module to include all Twigs modules at once.
 *
 * ```javascript
 * var App = angular.module('Main', ['twigs']);
 * ```
 */
angular.module('twigs', [
  'twigs.menu',
  'twigs.activeRoute',
  'twigs.devel',
  'twigs.flow',
  'twigs.globalHotkeys',
  'twigs.security',
  'twigs.sortable',
  'twigs.dynamicSize',
  'twigs.tableRowClick',
  'twigs.globalPopups',
  'twigs.protectedRoutes'
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
angular.module('twigs.activeRoute').directive('twgActiveRoute', [
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
angular.module('twigs.devel').constant('ERROR_REPORTED_EVENT', 'twigs.devel.errorReported').constant('SERVER_REQUEST_REPORTED_EVENT', 'twigs.devel.serverRequestReported').provider('DevelopmentInfoService', function () {
  var urlFilterPattern = /.*/;
  /**
         * @ngdoc function
         * @name  twigs.devel.service:DevelopmentInfoServiceProvider#setUrlFilterPattern
         * @methodOf twigs.devel.service:DevelopmentInfoServiceProvider
         *
         * @description
         * Pass in a regex pattern (e.g. `/\/ws\/rest\//`) to filter XHTTP request urls. Most of the time,
         * you only want to include REST request and exclude angular's request to templates etc.
         *
         * @param {string} pattern A regex pattern to filter XHTTP Request urls
         */
  this.setUrlFilterPattern = function (pattern) {
    urlFilterPattern = pattern;
  };
  /**
         * @ngdoc service
         * @name twigs.devel.service:DevelopmentInfoService
         *
         * @description
         * Provides functionality for gathering and displaying devel/debug information.
         *
         * Use in your services to report errors.
         *
         * ```javascript
         *   function(DevelopmentInfoService){
         *       DevelopmentInfoService.reportError('some name', {some:'payload data'});
         *   }
         * ```
         */
  this.$get = [
    '$rootScope',
    'ERROR_REPORTED_EVENT',
    'SERVER_REQUEST_REPORTED_EVENT',
    function ($rootScope, ERROR_REPORTED_EVENT, SERVER_REQUEST_REPORTED_EVENT) {
      var errors = [], serverRequests = [], customData = {};
      function getCustomData() {
        return customData;
      }
      function watchCustomData(id, data) {
        customData[id] = data;
      }
      function reportError(name, data) {
        errors.push({
          name: name,
          payload: data,
          date: new Date()
        });
        $rootScope.$broadcast(ERROR_REPORTED_EVENT, errors);
      }
      function reportServerRequest(url, response, status) {
        serverRequests.push({
          url: url,
          response: response,
          status: status,
          showResponse: false,
          date: new Date()
        });
        $rootScope.$broadcast(SERVER_REQUEST_REPORTED_EVENT, serverRequests);
      }
      function getUrlFilterPattern() {
        return urlFilterPattern;
      }
      var developmentInfoService = {
          reportError: reportError,
          reportServerRequest: reportServerRequest,
          getUrlFilterPattern: getUrlFilterPattern,
          getCustomData: getCustomData,
          watchCustomData: watchCustomData
        };
      return developmentInfoService;
    }
  ];
}).controller('DevelopmentInfoCtrl', [
  '$rootScope',
  '$scope',
  '$cookieStore',
  '$location',
  'DevelopmentInfoService',
  'ERROR_REPORTED_EVENT',
  'SERVER_REQUEST_REPORTED_EVENT',
  function ($rootScope, $scope, $cookieStore, $location, DevelopmentInfoService, ERROR_REPORTED_EVENT, SERVER_REQUEST_REPORTED_EVENT) {
    var COOKIE_KEY = 'twg.develFooterEnabled';
    if ($location.search().develFooter === 'true') {
      $scope.develFooterEnabled = true;
      $cookieStore.put(COOKIE_KEY, true);
    } else if ($location.search().develFooter === 'false') {
      $scope.develFooterEnabled = false;
      $cookieStore.put(COOKIE_KEY, false);
    } else {
      $scope.develFooterEnabled = $cookieStore.get(COOKIE_KEY);
    }
    /**
         * watch for changes in custom Data
         */
    $scope.customData = {};
    $rootScope.$watch(function () {
      return DevelopmentInfoService.getCustomData();
    }, function (changed) {
      $scope.customData = changed;
    }, true);
    $scope.$on(ERROR_REPORTED_EVENT, function (event, allErrors) {
      $scope.errors = allErrors;
    });
    $scope.$on(SERVER_REQUEST_REPORTED_EVENT, function (event, allRequests) {
      $scope.serverRequests = allRequests;
    });
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    function interceptor($q, DevelopmentInfoService) {
      var urlFilterPattern = DevelopmentInfoService.getUrlFilterPattern();
      function isMatchingFilterPattern(url) {
        return urlFilterPattern.test(url);
      }
      // default behaviour
      function success(response) {
        if (isMatchingFilterPattern(response.config.url)) {
          DevelopmentInfoService.reportServerRequest(response.config.url, response.data, response.status);
        }
        return response;
      }
      function error(response) {
        if (isMatchingFilterPattern(response.config.url)) {
          DevelopmentInfoService.reportServerRequest(response.config.url, response.data, response.status);
        }
        // default behaviour
        return $q.reject(response);
      }
      // default behaviour
      return function (promise) {
        return promise.then(success, error);
      };
    }
    $httpProvider.responseInterceptors.push(interceptor);
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
angular.module('twigs.dynamicSize').service('DynamicSizeHelper', function () {
  function isNumber(n) {
    return !isNaN(parseInt(n, 10)) && isFinite(n);
  }
  // TODO: parse into whole numbers, no fractions
  function parseDynamicSizeAttribute(attributeValue) {
    if (attributeValue.length === 0) {
      throw 'Please specify a dynamic size attribute!';
    }
    if (!isNumber(attributeValue)) {
      throw 'Dynamic size attribute must be numeric!';
    }
    if (attributeValue % 1 !== 0) {
      throw 'Dynamic size attribute must be a whole number!';
    }
    return parseInt(attributeValue, 10);
  }
  return { parseDynamicSizeAttribute: parseDynamicSizeAttribute };
}).directive('twgDynamicHeight', [
  '$window',
  'DynamicSizeHelper',
  function ($window, DynamicSizeHelper) {
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
  }
]).directive('twgDynamicWidth', [
  '$window',
  'DynamicSizeHelper',
  function ($window, DynamicSizeHelper) {
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
angular.module('twigs.flow').provider('Flow', function () {
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
            if (checkIfStepRouteRegexMatches(step.routeRegex, route)) {
              retVal = {
                flow: flows[propertyName],
                step: step
              };
            }
          });
        });
        if (angular.isUndefined(retVal)) {
          throw 'no flow-step found for route ' + route;
        }
        return retVal;
      }
      function checkIfStepRouteRegexMatches(routeRegex, givenUrl) {
        if (angular.isUndefined(routeRegex.test)) {
          throw 'Expected regex, but got ' + routeRegex;
        }
        return routeRegex.test(givenUrl);
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
            return checkIfStepRouteRegexMatches(targetStep.routeRegex, currentPath);
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
         * this function is from the AngularJS sources. See /src/ngRoute/route.js
         *
         * computes regular expression for a given path string
         *
         * @param {string} path The Path as String (e.g.  /some/path/:id )
         * @param {object} opts Options
         * @returns {{originalPath: *, regexp: *}}
         */
  function pathRegExp(path, opts) {
    var insensitive = opts.caseInsensitiveMatch, ret = {
        originalPath: path,
        regexp: path
      }, keys = ret.keys = [];
    path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
      var optional = option === '?' ? option : null;
      var star = option === '*' ? option : null;
      keys.push({
        name: key,
        optional: !!optional
      });
      slash = slash || '';
      return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '');
    }).replace(/([\/$\*])/g, '\\$1');
    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
    return ret;
  }
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
    stepConfig.routeRegex = pathRegExp(stepConfig.route, {}).regexp;
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
 * @name twigs.globalHotkeys.service:GlobalHotkeysService
 *
 * @description
 * GlobalHotkeys allows you to assign actions to specific keyboard key combinations.
 * In order for it to work, add the 'twg-global-hotkeys' directive to the top-element of your angular application (e.g. the html-element in a single page application).
 *
 * **Note:** All keydown events within input fields (input/textarea/select), links and buttons do not trigger the hotkey callback.
 *
 * ### Globally defined hotkeys
 * Globally defined hotkeys are available on all pages (except if explicitly overridden by path-specific hotkeys). You can define them in the **run** function of your Application's main module.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs.globalHotkeys']);
 *
 * App.run(function ($location, GlobalHotkeysService) {
 *
 *    GlobalHotkeysService.registerGlobalHotkeys(["alt+h", "shift+h"], function (ev) {
 *        // go to home view
 *        $location.path('/#');
 *    });
 *
 *
 *    GlobalHotkeysService.registerGlobalHotkeys(["alt+a", "shift+a"], function (ev) {
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
 * App.controller('SomeController', function (GlobalHotkeysService) {
 *
 *    GlobalHotkeysService.registerPageHotkey("alt+i", function () {
 *        // do something here
 *    });
 *
 * });
 *
 * ```
 *
 */
angular.module('twigs.globalHotkeys').factory('GlobalHotkeysService', [
  '$location',
  function ($location) {
    var HOTKEY_CODE_PREFIX = 'c_', pageHotkeys = {}, globalHotkeys = {};
    function getPageHotkeyAction(page, hotkey) {
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        return undefined;
      }
      return hotkeys[hotkey.toLowerCase()];
    }
    function getPageHotkeyActionCode(page, hotkey) {
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        return undefined;
      }
      return hotkeys[HOTKEY_CODE_PREFIX + hotkey];
    }
    function getGlobalHotkeyAction(hotkey) {
      return globalHotkeys[hotkey.toLowerCase()];
    }
    function getGlobalHotkeyActionCode(hotkey) {
      return globalHotkeys[HOTKEY_CODE_PREFIX + hotkey];
    }
    function registerPageHotkey(hotkey, actionFunction) {
      var page = $location.path();
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        hotkeys = {};
        pageHotkeys[page] = hotkeys;
      }
      hotkeys[hotkey.toLowerCase()] = actionFunction;
    }
    function registerPageHotkeyCode(hotkeyCode, actionFunction) {
      var page = $location.path();
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        hotkeys = {};
        pageHotkeys[page] = hotkeys;
      }
      hotkeys[HOTKEY_CODE_PREFIX + hotkeyCode] = actionFunction;
    }
    function registerPageHotkeys(hotkeys, actionFunction) {
      angular.forEach(hotkeys, function (key) {
        registerPageHotkey(key, actionFunction);
      });
    }
    function registerPageHotkeyCodes(hotkeyCodes, actionFunction) {
      angular.forEach(hotkeyCodes, function (key) {
        registerPageHotkeyCode(key, actionFunction);
      });
    }
    function registerGlobalHotkey(hotkey, actionFunction) {
      globalHotkeys[hotkey.toLowerCase()] = actionFunction;
    }
    function registerGlobalHotkeys(hotkeys, actionFunction) {
      angular.forEach(hotkeys, function (key) {
        registerGlobalHotkey(key, actionFunction);
      });
    }
    function registerGlobalHotkeyCode(hotkeyCode, actionFunction) {
      globalHotkeys[HOTKEY_CODE_PREFIX + hotkeyCode] = actionFunction;
    }
    function registerGlobalHotkeyCodes(hotkeyCodes, actionFunction) {
      angular.forEach(hotkeyCodes, function (key) {
        registerGlobalHotkeyCode(key, actionFunction);
      });
    }
    var serviceInstance = {
        getPageHotkeyAction: getPageHotkeyAction,
        getPageHotkeyActionCode: getPageHotkeyActionCode,
        getGlobalHotkeyAction: getGlobalHotkeyAction,
        getGlobalHotkeyActionCode: getGlobalHotkeyActionCode,
        registerPageHotkey: registerPageHotkey,
        registerPageHotkeyCode: registerPageHotkeyCode,
        registerPageHotkeys: registerPageHotkeys,
        registerPageHotkeyCodes: registerPageHotkeyCodes,
        registerGlobalHotkey: registerGlobalHotkey,
        registerGlobalHotkeys: registerGlobalHotkeys,
        registerGlobalHotkeyCode: registerGlobalHotkeyCode,
        registerGlobalHotkeyCodes: registerGlobalHotkeyCodes
      };
    return serviceInstance;
  }
]).directive('twgGlobalHotkeys', [
  '$location',
  '$rootScope',
  'GlobalHotkeysService',
  function ($location, $rootScope, GlobalHotkeysService) {
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
        /**
                 * register to keydown
                 */
        element.bind('keydown', function (event) {
          if (isForbiddenElement(event)) {
            return;
          }
          handleHotkey(event);
        });
        function handleHotkeyNormal(hotkey, event) {
          var completeHotkey = appendKey(hotkey, String.fromCharCode(event.which));
          var pageAction = GlobalHotkeysService.getPageHotkeyAction($location.path(), completeHotkey);
          if (angular.isDefined(pageAction)) {
            pageAction(event);
            scope.$apply();
            return true;
          }
          var globalAction = GlobalHotkeysService.getGlobalHotkeyAction(completeHotkey);
          if (angular.isDefined(globalAction)) {
            globalAction(event);
            scope.$apply();
            return true;
          }
          return false;
        }
        function handleHotkeyCode(hotkey, event) {
          var completeHotkey = appendKey(hotkey, event.which);
          var pageAction = GlobalHotkeysService.getPageHotkeyActionCode($location.path(), completeHotkey);
          if (angular.isDefined(pageAction)) {
            pageAction(event);
            scope.$apply();
            return true;
          }
          var globalAction = GlobalHotkeysService.getGlobalHotkeyActionCode(completeHotkey);
          if (angular.isDefined(globalAction)) {
            globalAction(event);
            scope.$apply();
            return true;
          }
          return false;
        }
        function handleHotkey(event) {
          var hotkey = '';
          if (event.ctrlKey) {
            hotkey = appendKey(hotkey, 'ctrl');
          }
          if (event.altKey) {
            hotkey = appendKey(hotkey, 'alt');
          }
          if (event.shiftKey) {
            hotkey = appendKey(hotkey, 'shift');
          }
          /**
                     * no way to determine if pressed key is a special key and registered with *Code
                     * We search for a normal key first, if none found, search for a special one
                     */
          var normalHandled = handleHotkeyNormal(hotkey, event);
          if (!normalHandled) {
            handleHotkeyCode(hotkey, event);
          }
        }
        var appendKey = function (oldHotkey, nextKey) {
          var hotkey = oldHotkey;
          if (oldHotkey.length > 0) {
            hotkey += '+';
          }
          hotkey += nextKey;
          return hotkey;
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
 * @ngdoc object
 * @name twigs.globalPopups.provider:GlobalPopupsProvider
 *
 * @description
 * GlobalPopupsProvider can be used to define custom GlobalPopups or override twitch default GlobalPopups.
 *
 * ### Usage
 * You need to specify a config block to create a new GlobalPopup and you need to create a html template for the Popup content.
 *
 * ```javascript
 * angular.module('myApp').config(function (GlobalPopupsProvider) {
 *      GlobalPopupsProvider.createModal('myOwnPopup',{
 *          modalOptions: {
 *              templateUrl: 'views/globalMsg/myOwnPopup.html',
 *              windowClass: 'modal-myOwnPopup',
 *              backdrop: 'static',
 *              keyboard: false
 *          }
 *      });
 * });
 * ```
 * ```html
 * <div class="modal-header">
 *      <button type="button" ng-click="$close()" >x</button>
 *      <h3>{{title}}</h3>
 * </div>
 * <div class="modal-body">
 *      <p>{{message}}</p>
 * </div>
 * <div class="modal-footer">
 *      <button class="btn btn-default" ng-click="$close()">close</button>
 * </div>
 * ```
 *
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups, ...) {
 *               if(someErrorOccurred){
 *                      GlobalPopups.myOwnPopup('Show my message');
 *               }
 *        });
 * ```
 */
/**
 * @ngdoc object
 * @name twigs.globalPopups.provider:GlobalPopups
 *
 * @description
 * GlobalPopups globally defines popups dialogs which can be called in every controller of your Angular JS application. They consist of two different types of dialogs:
 *
 * * Modals: Wrapper of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) which defines global templates for modals you use frequently in your application.
 * * Toasts: Lightweight html templates which can be displayed i.e. on the top of your GUI to inform the user about actions (save actions, warnings, etc.)
 *
 * If you want to define your own GlobalPopups, consider [GlobalPopupsProvider](#/api/twigs.globalPopups.provider:GlobalPopupsProvider).
 *
 *  ### How to use GlobalPopups
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups) {
 *               if(someErrorOccurred){
 *                      GlobalPopups.errorDialog('Error during creation of new User',
 *                      'Error', 'ok');
 *               }
 *        });
 * ```
 *
 * ### Predefined Popups are:
 * These are all preconfigured Popups. You can find a more detailed description on some of the predefined methods further below.
 * * GlobalPopups.infoDialog(String message, String popupTitle, String okButtonText);
 * * GlobalPopups.warningDialog(String message, String popupTitle, String okButtonText);
 * * GlobalPopups.errorDialog(String message, String popupTitle, String okButtonText);
 *
 * * GlobalPopups.yesnoDialog(String message, String popupTitle, String noButtonText, String yesButtonText);
 *      returns a promise, callback is boolean whether the user clicked yes or no
 *
 * * GlobalPopups.fileDialog(String url, String popupTitle, String backButtonText);
 * *     example: GlobalPopups.fileDialog('http://someURL.com/random.pdf', 'PDF Dispaly', 'Back');
 *
 * * GlobalPopups.successToast(String successMessage);
 * * GlobalPopups.warningToast(String warningMessage);
 */
/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#successToast
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} successMessage The message displayed as content of the toast.
 */
/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#infoDialog
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} message The message displayed as content of the modal.
 * @param {String} popupTitle The title of the Modal.
 * @param {String} okButtonText The text of the ok button in the modal footer.
 */
/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#yesnoDialog
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} message The message displayed as content of the modal.
 * @param {String} popupTitle The title of the Modal.
 * @param {String} noButtonText The text of the left button, interpreted as cancel.
 * @param {String} yesButtonText The text of the right button, interpreted as ok or yes.
 * @returns {Promise} Promise resolved with true or false once the user clicks the yes or no button. (yes -> true, no -> false)
 *
 * @example
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups) {
 *              GlobalPopups.yesnoDialog('Realy?', 'Title', 'no', 'yes').then(
 *              function(userClickedYes){
 *               if (userClickedYes) {
 *                   GlobalPopups.successToast('You clicked yes');
 *               } else {
 *                   GlobalPopups.successToast('You clicked no');
 *               }
 *           });
 * ```
 */
angular.module('twigs.globalPopups', ['ui.bootstrap.modal']).provider('GlobalPopups', function GlobalPopupsProvider() {
  var serviceInstance = {};
  this.modals = {};
  this.toasts = {};
  this.fileModals = {};
  this.$get = [
    '$rootScope',
    '$modal',
    '$timeout',
    '$templateCache',
    '$http',
    '$compile',
    '$document',
    '$sce',
    function ($rootScope, $modal, $timeout, $templateCache, $http, $compile, $document, $sce) {
      var toastStack;
      /**
             * Display Modals using angular bootstrap $modal
             */
      var displayModal = function (modal, messageText, title, primaryButtonText, secondaryButtonText) {
        var modalOptions = modal.options.modalOptions;
        modalOptions.controller = ModalInstanceCtrl;
        modalOptions.resolve = {
          messageText: function () {
            return messageText;
          },
          title: function () {
            return title;
          },
          primaryButtonText: function () {
            return primaryButtonText;
          },
          secondaryButtonText: function () {
            return secondaryButtonText;
          }
        };
        return $modal.open(modalOptions).result;
      };
      /**
             * Display File Modals using angular bootstrap $modal
             * (open url as trusted resource)
             */
      var displayFileModal = function (modal, url, title, backButtonText) {
        var modalOptions = modal.options.modalOptions;
        modalOptions.controller = FileModalInstanceCtrl;
        modalOptions.resolve = {
          messageText: function () {
            return $sce.trustAsResourceUrl(url);
          },
          title: function () {
            return title;
          },
          backButtonText: function () {
            return backButtonText;
          }
        };
        return $modal.open(modalOptions).result;
      };
      /**
             * Controller for angular bootstrap $modals used for basic Modals
             */
      var ModalInstanceCtrl = function ($scope, $modalInstance, messageText, title, primaryButtonText, secondaryButtonText) {
        $scope.message = messageText;
        $scope.title = title;
        $scope.primaryButtonText = primaryButtonText;
        $scope.secondaryButtonText = secondaryButtonText;
        $scope.ok = function () {
          $modalInstance.close();
        };
        $scope.cancel = function () {
          $modalInstance.dismiss();
        };
      };
      /**
             * Controller for angular bootstrap $modals used for File Modals
             */
      var FileModalInstanceCtrl = function ($scope, $modalInstance, messageText, title, backButtonText) {
        $scope.message = messageText;
        $scope.title = title;
        $scope.backButtonText = backButtonText;
        $scope.ok = function () {
          $modalInstance.close();
        };
        $scope.cancel = function () {
          $modalInstance.dismiss();
        };
      };
      /**
             * Displays a toast template by adding it to the body element in the dom
             */
      toastStack = {};
      var displayToast = function (toast, messageText) {
        getTemplatePromise(toast.options.templateUrl).then(function (content) {
          var body = $document.find('body');
          var scope = $rootScope.$new(true);
          var rootToastElement = $document.find('#twigs-toast');
          /**
                     * forms a wrapper to put toast templates into
                     */
          if (rootToastElement.length < 1) {
            rootToastElement = angular.element('<div id="twigs-toast"></div>');
            body.append(rootToastElement);
          }
          /**
                     * appends the toast template to twigs-toast div
                     */
          var toastElement = $compile(content)(scope);
          scope.id = new Date().getTime();
          toastStack[scope.id] = toastElement;
          rootToastElement.append(toastElement);
          /**
                     * The message displayed in the toast
                     */
          scope.message = messageText;
          /**
                     * removes the toast template on user click or displayDuration timeout
                     */
          scope.close = function () {
            //maybe the user already closed the toast
            if (angular.isDefined(toastStack[scope.id])) {
              toastStack[scope.id].remove();
              delete toastStack[scope.id];
            }
          };
          /**
                     * Removes the toast template after the given displayDuration
                     */
          if (angular.isDefined(toast.options.displayDuration)) {
            $timeout(function () {
              scope.close();
            }, toast.options.displayDuration);
          }
        });
      };
      /**
             * loads a html template
             */
      var getTemplatePromise = function (templateUrl) {
        return $http.get(templateUrl, { cache: $templateCache }).then(function (result) {
          return result.data;
        });
      };
      /**
             * Preparate service instance with a function for each toast and modal
             */
      serviceInstance.displayModal = displayModal;
      serviceInstance.displayToast = displayToast;
      serviceInstance.displayFileModal = displayFileModal;
      return serviceInstance;
    }
  ];
  /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createModal
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a Modal.
         *
         * @param {String} messageName The name of this Modal, is later used to display this Modal with GlobalPopups.messageName('my message', 'my title', 'ok');
         * @param {Object} options conatining the options of this Modal.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * modalOptions: {
         *           `templateUrl` (required) specifying the location of the html template for this popup.
         *      }
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createModal('infoDialog',{
         *      modalOptions: {
         *          templateUrl: 'templates/infoModal.html',
         *          windowClass:'modal-info',
         *          backdrop: false,
         *          keyboard: true
         *      }
         * });
         * ```
         */
  this.createModal = function (messageName, options) {
    if (angular.isUndefined(options.modalOptions) || angular.isUndefined(options.modalOptions.templateUrl)) {
      throw 'createModal requires at least modalOptions.templateUrl to be defined';
    }
    var modal = {
        name: messageName,
        options: options
      };
    serviceInstance[messageName] = function (messageText, title, primaryButtonText, secondaryButtonText) {
      if (angular.isUndefined(messageText)) {
        throw 'GlobalPupupService.' + messageName + ' must be called with a message';
      }
      return serviceInstance.displayModal(modal, messageText, title, primaryButtonText, secondaryButtonText);
    };
  };
  /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createToast
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a Toast.
         *
         * @param {String} messageName The name of this Toast, is later used to display this Modal with GlobalPopups.messageName('user saved successfully');
         * @param {Object} options conatining the options of this Modal. Required property is 'templateUrl' specifying the location of the html template for this popup.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * `templateUrl` (required) specifying the location of the html template for this popup.
         *    * `splayDuration` (optional) specifying the timeout in miliseconds until the toast is hidden again. If left empty, the modal does not disappear automatically
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createToast('warningToast',{
         *      templateUrl: 'templates/warningToast.html',
         *      displayDuration: 5000
         * });
         * ```
         */
  this.createToast = function (messageName, options) {
    if (angular.isUndefined(options.templateUrl)) {
      throw 'createToast requires templateUrl to be defined';
    }
    var toast = {
        name: messageName,
        options: options
      };
    serviceInstance[messageName] = function (messageText) {
      if (angular.isUndefined(messageText)) {
        throw 'GlobalPupupService.' + messageName + ' must be called with a message';
      }
      serviceInstance.displayToast(toast, messageText);
    };
  };
  /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createFileModal
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a File Modal. Can be used to display files directly in the browser, i.e. PDF.
         * The Browsers file display is used.
         *
         * @param {String} messageName The name of this Modal, is later used to display this Modal with GlobalPopups.messageName('http://myurl.com', 'title', 'back');
         * @param {Object} options conatining the options of this Modal.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * modalOptions: {
         *           `templateUrl` (required) specifying the location of the html template for this popup.
         *      }
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createFileModal('fileDialog',{
         *      modalOptions: {
         *          templateUrl: 'templates/fileModal.html',
         *          windowClass:'modal-file',
         *          keyboard: true
         *      }
         * });
         * ```
         */
  this.createFileModal = function (messageName, options) {
    if (angular.isUndefined(options.modalOptions) || angular.isUndefined(options.modalOptions.templateUrl)) {
      throw 'createFileModal requires at least modalOptions.templateUrl to be defined';
    }
    var fileModal = {
        name: messageName,
        options: options
      };
    serviceInstance[messageName] = function (url, title, backButtonText) {
      if (angular.isUndefined(url)) {
        throw 'GlobalPopupService.' + messageName + ' must be called with a valid url';
      }
      serviceInstance.displayFileModal(fileModal, url, title, backButtonText);
    };
  };
}).config([
  'GlobalPopupsProvider',
  function (GlobalPopupsProvider) {
    GlobalPopupsProvider.createToast('successToast', {
      templateUrl: 'templates/successToast.html',
      displayDuration: 7000
    });
    GlobalPopupsProvider.createToast('warningToast', {
      templateUrl: 'templates/warningToast.html',
      displayDuration: 7000
    });
    GlobalPopupsProvider.createModal('infoDialog', {
      modalOptions: {
        templateUrl: 'templates/infoModal.html',
        windowClass: 'modal-info',
        backdrop: false,
        keyboard: true
      }
    });
    GlobalPopupsProvider.createModal('yesnoDialog', {
      modalOptions: {
        templateUrl: 'templates/yesnoModal.html',
        windowClass: 'modal-yesno',
        backdrop: 'static',
        keyboard: false
      }
    });
    GlobalPopupsProvider.createFileModal('fileDialog', {
      modalOptions: {
        templateUrl: 'templates/fileModal.html',
        windowClass: 'modal-file',
        keyboard: true
      }
    });
    GlobalPopupsProvider.createModal('errorDialog', {
      modalOptions: {
        templateUrl: 'templates/errorModal.html',
        windowClass: 'modal-error',
        backdrop: 'static',
        keyboard: false
      }
    });
    GlobalPopupsProvider.createModal('warningDialog', {
      modalOptions: {
        templateUrl: 'templates/warningModal.html',
        windowClass: 'modal-warning',
        keyboard: true
      }
    });
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
 * @name twigs.menu.provider:MenuProvider
 *
 * @description
 * MenuProvider can be used to define menus globally which can later be used in multiple views.
 *
 * The currently active menu item is determined over the current window location and the link defined for each menu item.
 * If the link of a menu item matches the current path, the property menuItem.active will be true for that item.
 *
 * Menus can be filtered using the functionality of twigs.ProtectedRouteProvider. If the link of a menu item matches
 * with the link of a protected route and the current users role does not meet the needed roles to access that route,
 * the menu item will be removed from the menu.
 * Therefore twigs.ProtectedRouteProvider must be included in your application and configured as described under [ProtectedRouteProvider](#/api/twigs.menu.provider:ProtectedRouteProvider)
 *
 * ### Usage
 * You need to specify a config block to create a new Menu and you need to create a html template for the Menu content.
 *
 * MenuProvider.createMenu(... creates a new Menu with the given name and html template.
 * Menuitems or submenus can be added to this menu, nested as much as you like.
 *
 * ```javascript
 * angular.module('myApp').config(function (MenuProvider) {
 *       var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html')
 *       .addItem('main_menu_home', {
 *           text : 'Home',
 *           link: '/home',
 *           iconClass: 'fa fa-desktop fa-lg'
 *       });
 *
 *      var settingsMenu = mainMenu.createSubMenu('main_menu_settings',
 *          {link: '/settings/ac',text : 'Settings-Menu', iconClass: 'fa fa-lock fa-lg'});
 *
 *       settingsMenu.addItem('main_menu_settings_users', {
 *          text : 'Users',
 *          link: '/settings/ac/users'
 *       }).addItem('main_menu_settings_roles', {
 *          text : 'Roles',
 *          link: '/settings/ac/roles'
 *      });
 * });
 * ```
 * The html template 'views/mainMenu.html' referenced by MenuProvider.createMenu(...
 * Here you can iterate over all menu.items.
 * ```html
 * <ul>
 *      <li class="openable" ng-class="{'active': menuItem.active}"
 *          x-ng-repeat="menuItem in menu.items">
 *           <a x-ng-href="#{{menuItem.link}}">
 *              <span class="menu-icon">
 *                <i x-ng-class="menuItem.options.iconClass"></i>
 *               </span>
 *              <span class="text">
 *                {{menuItem.text}}
 *              </span>
 *              <span class="menu-hover"></span>
 *          </a>
 *      </li>
 * </ul>
 * ```
 *
 * The directive used in every one of your pages where the menu should be displayed:
 * ```html
 * <twg-menu menu-name="main_menu"></twg-menu>
 * ```
 *
 * ### A more complex example with nested menus:
 * Each menu item can contain a list of menu item children. Each parent menu / children menu structure is nothing else than a menu item with a list of menu items as menu.items property.
 * ```javascript
 * MenuProvider.userLoadedEventName('userInitialized'); //for details see below
 * var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html')
 * .addItem('main_menu_home', {
 *           text : 'Home',
 *           link: '/home',
 *           iconClass: 'fa fa-desktop fa-lg'
 *       });
 *
 * var settingsMenu = mainMenu.createSubMenu('main_menu_settings',
 *      {link: '/settings/ac',text : 'Settings-Menu', iconClass: 'fa fa-lock fa-lg'});
 *
 * settingsMenu.addItem('main_menu_settings_users', {
 *      text : 'Users',
 *       link: '/settings/ac/users'
 *   }).addItem('main_menu_settings_roles', {
 *       text : 'Roles',
 *       link: '/settings/ac/roles'
 *   });
 *
 * var ordersMenu = mainMenu.createSubMenu('main_menu_orders',
 *      {link: '/orders/', text : 'Orders', iconClass: 'fa fa-lock fa-lg'});
 *
 * ordersMenu.addItem('main_menu_orders_new_order', {
 *      text : 'New Order',
 *      link: '/orders/new'
 *   }).addItem('main_menu_orders_overview', {
 *       text : 'Order Overview',
 *       link: '/orders/overview'
 *   });
 * ```
 * The corresponding html template:
 * ```html
 * <ul>
 *      <li class="openable" ng-class="{'active': menuItem.active}"
 *          x-ng-repeat="menuItem in menu.items">
 *          <a x-ng-href="#{{menuItem.link}}">
 *              <span class="menu-icon">
 *                  <i x-ng-class="menuItem.options.iconClass"></i>
 *              </span>
 *              <span class="text">
 *                  {{menuItem.text}}
 *              </span>
 *              <span class="menu-hover"></span>
 *          </a>
 *
 *          <ul class="submenu" x-ng-if="menuItem.items.length > 0">
 *              <li x-ng-repeat="subMenuItem in menuItem.items"
 *                  ng-class="{'active': subMenuItem.active}">
 *                  <a href="#{{subMenuItem.link}}">
 *                          <span class="submenu-label">{{subMenuItem.text}}</span>
 *                   </a>
 *              </li>
 *          </ul>
 *      </li>
 * </ul>
 * ```
 *
 * See [twgMenu](#/api/twigs.menu.directive:twgMenu) for more information on how to use the twgMenu directive in your views.
 */
/**
 * @ngdoc directive
 * @name twigs.menu.directive:twgMenu
 * @element ANY
 *
 * @description
 * In many web applications you will need navigations or menus which are present on all or multiple html pages. TwgMenu allows you
 * to define those menues globally so that you only need to include a directive referencing the menu in your html page.
 *
 * TwgMenu registers each route change and ensures that correspondent menu entry is marked active as well as parent menu items if the menu is collapsable.
 *
 * TwgMenu can filter menu items with links referencing restricted routes (using twg.protectedRoutes) so that only users with the necessary access roles see those menu items.
 * In order to use menu filtering, twg.protectedRoutes needs to be included in your app and properly configured. See [ProtectedRouteProvider](#/api/twigs.menu.provider:ProtectedRouteProvider)
 *
 * ```html
 *<twigs-menu menu-name="main_menu"></twigs-menu>
 * ```
 *
 * See [MenuProvider](#/api/twigs.menu.provider:MenuProvider) for more information on how to set up Menus.
 */
angular.module('twigs.menu').provider('Menu', function Menu() {
  var menus = {}, userLoadedEventName;
  var serviceInstance = {
      createMenu: function (menuName, templateUrl) {
        var menu = new RootMenuItem(menuName, templateUrl);
        if (angular.isDefined(menus[menuName])) {
          throw 'Menu is already defined: ' + menuName;
        }
        menus[menuName] = menu;
        return menu;
      },
      menu: function (menuName) {
        return menus[menuName];
      },
      removeMenu: function (menuName) {
        delete menus[menuName];
      },
      getUserLoadedEventName: function () {
        return userLoadedEventName;
      },
      setUserLoadedEventName: function (_userLoadedEventName) {
        userLoadedEventName = _userLoadedEventName;
      }
    };
  this.$get = function () {
    return serviceInstance;
  };
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#createMenu
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * Defines a new Menu.
         *
         * @param {String} menuName The name of the menu
         * @param {String} templateUrl The template used to render this menu
         * @returns {RootMenuItem} root instance for the new menu.
         *
         * Example:
         * ```javascript
         * var mainMenu = MenuProvider.createMenu('main_menu', 'views/mainMenu.html');
         * ```
         */
  this.createMenu = function (menuName, templateUrl) {
    return serviceInstance.createMenu(menuName, templateUrl);
  };
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#menu
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * Returns the root menu item instance for the menu with the specified menuName if it exists;
         * otherwise, returns undefined.
         *
         * @param {string} menuName name of the menu
         * @returns {SubMenuItem} root instance for the menu.
         */
  this.menu = function (menuName) {
    return serviceInstance.menu(menuName);
  };
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#removeMenu
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * Removes menu with the specified menuName
         *
         * @param {string} menuName name of the menu
         */
  this.removeMenu = function (menuName) {
    serviceInstance.removeMenu(menuName);
  };
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#setUserLoadedEventName
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * If the menuitems should be filtered by the current users role, a event which signals
         * successfull loading of the user and his role needs to be specified. This event triggers
         * a re-filtering of the menu after successful login. Otherwise the menu is always filtered
         * pre login which means the user has no role yet.
         * If you use twigs.security the default event name is 'userInitialized'
         *
         * @param {String} userLoadedEventName The name of the user successfully loaded event
         *
         * Example:
         * ```javascript
         * MenuProvider.setUserLoadedEventName('userInitialized');
         * ```
         */
  this.setUserLoadedEventName = function (userLoadedEventName) {
    serviceInstance.setUserLoadedEventName(userLoadedEventName);
  };
  function validateMenuLink(linkFromConfig) {
    if (angular.isUndefined(linkFromConfig) || linkFromConfig.length < 1) {
      return linkFromConfig;
    }
    if (isExternalLink(linkFromConfig)) {
      return linkFromConfig;
    }
    if (linkFromConfig.charAt(0) !== '/') {
      throw 'please use routes in menu configuration: ' + linkFromConfig;
    }
    return linkFromConfig;
  }
  function isExternalLink(linkFromConfig) {
    return linkFromConfig.substring(0, 4) === 'http';
  }
  //MenuItem SuperClass
  function MenuItem(name) {
    this.name = name;
  }
  /**
         * Creates new RootMenuItem instance.
         * @param name name of the Menu
         * @constructor
         * @param templateUrl the html template used by the twigs-menu directive
         */
  function RootMenuItem(name, templateUrl) {
    this.constructor(name);
    this.templateUrl = templateUrl;
    this.items = [];
  }
  /**
         * Creates new SubMenuItem instance.
         * @param name name of the item
         * @constructor
         * @param options item options
         */
  function SubMenuItem(name, options) {
    this.constructor(name);
    this.items = [];
    var _options = options || {};
    this.text = _options.text || name;
    this.link = validateMenuLink(_options.link);
    this.options = _options;
  }
  //inherit methods of MenuItem
  RootMenuItem.prototype = new MenuItem(name);
  SubMenuItem.prototype = new MenuItem(name);
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#addItem
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * Adds new item with the specified itemName to the list of the child items of a menu item.
         *
         * @param {string} itemName name of the menu item. Name should be unique in the context of
         * the whole menu (not just among direct siblings). This restriction is not strictly
         * enforced, but functionality of some of the SubMenuItem methods depend on it.
         * @param {object} itemOptions used for the configuration of the menu item.
         * Can contain any attribute which may by referenced in the html template of your menu. itemOptions.text and itemOptions.link
         * are predefined and will be mapped to the menuItem directly (i.e. accessible over menuItem.text)
         * @param {string} itemOptions.text The display text or translation key of the item
         * @param {string} itemOptions.link The link which should be opened when the item is clicked
         * @returns {SubMenuItem} current instance
         *
         */
  MenuItem.prototype.addItem = function (itemName, itemOptions) {
    this._createAndAddItem(itemName, itemOptions);
    return this;
  };
  /**
         * @ngdoc function
         * @name twigs.menu.provider:MenuProvider#createSubMenu
         * @methodOf twigs.menu.provider:MenuProvider
         *
         * @description
         * Adds a new submenu with the specified menuName to the list of the child items of a menu item.
         *
         * @param {string} menuName name of the submenu. Name should be unique in the context of
         * the whole menu (not just among direct siblings). This restriction is not strictly
         * enforced, but functionality of some of the SubMenuItem methods depend on it.
         * * @param {object} menuOptions used for the configuration of the menu item.
         * Can contain any attribute which may by referenced in the html template of your menu. itemOptions.text and itemOptions.link
         * are predefined and will be mapped to the menuItem directly (i.e. accessible over menuItem.text)
         * @param {string} menuOptions.text The display text or translation key of the item
         * @param {string} menuOptions.link The link which should be opened when the item is clicked
         * @returns {SubMenuItem} instance for the new submenu
         *
         */
  MenuItem.prototype.createSubMenu = function (menuName, menuOptions) {
    return this._createAndAddItem(menuName, menuOptions);
  };
  MenuItem.prototype._createAndAddItem = function (itemName, itemOptions) {
    var item = new SubMenuItem(itemName, itemOptions);
    this.items.push(item);
    return item;
  };
}).service('MenuPermissionService', [
  '$route',
  '$injector',
  '$log',
  function ($route, $injector, $log) {
    var isSubMenuItemAllowed, filterMenuForRouteRestrictions, filterMenuRecursively, Permissions;
    try {
      //inject permissions if module exists, otherwise all SubMenuItems are allowed
      Permissions = $injector.get('Permissions');
    } catch (err) {
      $log.debug('twigs.menu is used without permission filtering. Include twigs.security in your app if you wish to filter twigs.menu according to user roles.');
    }
    isSubMenuItemAllowed = function (SubMenuItem, Permissions) {
      var hasRoles = true;
      var SubMenuItemRoute = $route.routes[SubMenuItem.link];
      if (angular.isUndefined(SubMenuItemRoute)) {
        //if therre is no route match for SubMenuItem.link dont filter the SubMenuItem
        return true;
      }
      angular.forEach(SubMenuItemRoute.neededRoles, function (neededRole) {
        var hasNeededRole = Permissions.hasRole(neededRole);
        if (!hasNeededRole) {
          hasRoles = false;
          return false;
        }
      });
      return hasRoles;
    };
    filterMenuRecursively = function (menu, Permissions) {
      if (angular.isDefined(menu.items) && menu.items.length > 0) {
        var ok = [];
        angular.forEach(menu.items, function (SubMenuItem) {
          if (isSubMenuItemAllowed(SubMenuItem, Permissions)) {
            var oldSubMenuItemSubItemsCount = SubMenuItem.items.length;
            var newSubMenuItem = filterMenuRecursively(SubMenuItem, Permissions);
            if (newSubMenuItem.items.length !== 0 || oldSubMenuItemSubItemsCount === 0) {
              //only push this item if it has no submenu or it has a submenu and the submenu items are visible
              ok.push(SubMenuItem);
            }
          }
        });
        menu.items = ok;
      }
      return menu;
    };
    filterMenuForRouteRestrictions = function (menu) {
      if (angular.isUndefined(Permissions)) {
        return menu;
      }
      if (angular.isUndefined(menu)) {
        return;
      }
      return filterMenuRecursively(menu, Permissions);
    };
    return {
      isSubMenuItemAllowed: isSubMenuItemAllowed,
      filterMenuForRouteRestrictions: filterMenuForRouteRestrictions
    };
  }
]).directive('twgMenu', [
  '$rootScope',
  '$location',
  '$log',
  'Menu',
  'MenuPermissionService',
  function ($rootScope, $location, $log, Menu, MenuPermissionService) {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        function setActiveMenuEntryRecursively(path, menu) {
          var subItemFound;
          if (angular.isDefined(menu.items) && menu.items.length > 0) {
            angular.forEach(menu.items, function (item) {
              item.active = false;
              if (setActiveMenuEntryRecursively(path, item) === true) {
                subItemFound = true;
                item.active = true;
                return false;
              }
            });
            menu.active = subItemFound;
            if (subItemFound === false) {
              //check if root menu item should be active
              menu.active = menu.link === path;
            }
          } else {
            return menu.link === path;
          }
        }
        var menu = angular.copy(Menu.menu(attrs.menuName));
        scope.menu = MenuPermissionService.filterMenuForRouteRestrictions(menu);
        //refilter menu on userInit if menu filtering is required
        if (angular.isDefined(Menu.getUserLoadedEventName())) {
          scope.$on(Menu.getUserLoadedEventName(), function () {
            var menu = angular.copy(Menu.menu(attrs.menuName));
            scope.menu = MenuPermissionService.filterMenuForRouteRestrictions(menu);
          });
        } else {
          $log.debug('twigs.menu has no user initialized event registered. This may cause problems when using twigs.menu permission filtering');
        }
        setActiveMenuEntryRecursively($location.path(), scope.menu);
        $rootScope.$on('$routeChangeSuccess', function () {
          setActiveMenuEntryRecursively($location.path(), scope.menu);
        });
      },
      templateUrl: function (element, attrs) {
        return Menu.menu(attrs.menuName).templateUrl;
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
angular.module('twigs.protectedRoutes').provider('ProtectedRoute', [
  '$routeProvider',
  function ($routeProvider) {
    var neededRolesForRoutes = {};
    /**
         * needed to mirror the angular's RouteProvider api !
         */
    this.otherwise = $routeProvider.otherwise;
    /**
         * the when function delegates to the angular routeProvider "when".
         */
    this.when = function (path, route) {
      if (isProtectedRouteConfig(route)) {
        route.resolve = angular.extend(route.resolve || {}, {
          'CurrentUser': function (Permissions) {
            return Permissions.getUser();
          },
          'hasPermission': function ($q, Permissions) {
            return isUserAllowedToAccessRoute($q, Permissions, route.neededRoles);
          }
        });
        neededRolesForRoutes[path] = route.neededRoles;
      }
      $routeProvider.when(path, route);
      return this;
    };
    function isProtectedRouteConfig(route) {
      if (angular.isDefined(route.neededRoles)) {
        if (typeof route.neededRoles === 'object') {
          return true;
        } else {
          throw 'Invalid protected route config: neededRoles must be an array';
        }
      }
      return false;
    }
    function isUserAllowedToAccessRoute($q, Permissions, neededRoles) {
      var deferred = $q.defer();
      Permissions.getUser().then(function () {
        if (userHasAllRoles(neededRoles, Permissions)) {
          deferred.resolve({});
        } else {
          deferred.reject(new Error('missing_roles'));
        }
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    function userHasAllRoles(neededRoles, Permissions) {
      var allRoles = true;
      angular.forEach(neededRoles, function (neededRole) {
        if (!allRoles) {
          return;
        }
        if (!Permissions.hasRole(neededRole)) {
          allRoles = false;
        }
      });
      return allRoles;
    }
    this.$get = function () {
      return {};
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
angular.module('twigs.security').service('UserObjectSanityChecker', function () {
  var EXPECTED_PROPERTIES = [
      'username',
      'roles',
      'permissions'
    ];
  function _isSaneUserObject(userObject) {
    if (angular.isUndefined(userObject)) {
      return false;
    }
    var allPropertiesFound = true;
    EXPECTED_PROPERTIES.forEach(function (prop) {
      if (angular.isUndefined(userObject[prop])) {
        allPropertiesFound = false;
      }
    });
    return allPropertiesFound;
  }
  return { isSane: _isSaneUserObject };
}).provider('Permissions', function () {
  var
    /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#user
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  The user object
             */
    user = {},
    /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#userLoader
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  The userLoader function (register via .registerUserLoader()
             */
    userLoader,
    /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#permissionEvaluatorFunction
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *   The evaluator function (register via .registerPermissionEvaluationFunction()
             */
    permissionEvaluatorFunction,
    /**
             * @ngdoc property
             * @name twigs.security.provider:PermissionsProvider#userLoadingPromise
             * @propertyOf twigs.security.provider:PermissionsProvider
             *
             * @description
             *  we remember, that we are already loading the user.
             *  A second call to "Permissions.user()" while the first call ist still waiting for a server-response,
             *  will receive the same promise;
             */
    userLoadingPromise;
  /**
         * @ngdoc function
         * @name twigs.security.provider:PermissionsProvider#registerUserLoader
         * @methodOf twigs.security.provider:PermissionsProvider
         *
         * @description
         * Registers the loader function to load the user Object. The given loader function must return
         * a promise which resolves to the user Object.
         * The user object is expected to be of the form:
         *
         * ```javascript
         *  {
         *   username:'John',
         *   roles:['ROLE_1','ROLE_2' ],
         *   permissions:[]
         *  }
         * ```
         *
         * It is valid to resolve to a user object which has additional properties.
         *
         * ```javascript
         * PermissionsProvider.registerUserLoader(function ($q, $resource) {
         *       return function () {
         *           var deferred = $q.defer();
         *           $resource('/users/current').get({},
         *               function (data) {
         *                  return deferred.resolve(data);
         *              }, function () {
         *                  return deferred.reject();
         *               });
         *
         *          return deferred.promise;
         *      };
         *   });
         * ```
         *
         * @param {function} loader The user loader function
         */
  this.registerUserLoader = function (loader) {
    userLoader = loader;
  };
  /**
         * @ngdoc function
         * @name twigs.security.provider:PermissionsProvider#registerPermissionEvaluationFunction
         * @methodOf twigs.security.provider:PermissionsProvider
         *
         * @description
         * Registers the evaluation function for evaluating permissions.
         * Permissions service will pass in the users permission, and the needed permissions (arguments)
         *
         * ```javascript
         * PermissionsProvider.registerPermissionEvaluationFunction(function () {
         *       return function (permissions, args) {
         *          // decide upon users permissions and args.
         *          // return true or false
         *          return true:
         *      };
         *   });
         * ```
         *
         * @param {function} fn The evaluator function
         */
  this.registerPermissionEvaluationFunction = function (fn) {
    permissionEvaluatorFunction = fn;
  };
  /**
         * @ngdoc object
         * @name twigs.security.service:Permissions
         *
         **/
  this.$get = [
    '$rootScope',
    '$q',
    '$injector',
    'UserObjectSanityChecker',
    function ($rootScope, $q, $injector, UserObjectSanityChecker) {
      function _hasPermission() {
        if (!_isAuthenticated()) {
          return false;
        }
        var evalFn = $injector.invoke(permissionEvaluatorFunction);
        return evalFn(user.permissions, arguments);
      }
      function _hasRole(roleName) {
        if (!_isAuthenticated()) {
          return false;
        }
        var hasRole = false;
        user.roles.forEach(function (role) {
          if (role === roleName) {
            hasRole = true;
          }
        });
        return hasRole;
      }
      function _loadUser() {
        if (angular.isUndefined(userLoader)) {
          throw 'No userLoader defined! Call PermissionsProvider.registerUserLoader(fn)  first!';
        }
        var deferred = $q.defer(), loaderFn = $injector.invoke(userLoader);
        loaderFn().then(function (data) {
          if (!UserObjectSanityChecker.isSane(data)) {
            console.error('Loaded user object did not pass sanity check!');
            deferred.reject(new Error('Loaded user object did not pass sanity check!'));
          } else {
            user = data;
            deferred.resolve(data);
          }
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      }
      function _getCurrentUser() {
        var deferred = $q.defer();
        if (angular.isDefined(user.username)) {
          deferred.resolve(user);
        } else {
          if (angular.isUndefined(userLoadingPromise)) {
            _loadUser().then(function () {
              $rootScope.$broadcast('userInitialized');
              deferred.resolve(user);
            }, function (error) {
              deferred.reject(error);
            });
            userLoadingPromise = deferred.promise;
          }
        }
        return userLoadingPromise;
      }
      function _isAuthenticated() {
        return angular.isDefined(user.username);
      }
      function _clearSecurityContext() {
        user = {};
        userLoadingPromise = undefined;
        $rootScope.$broadcast('userCleared');
      }
      return {
        getUser: _getCurrentUser,
        clearSecurityContext: _clearSecurityContext,
        hasPermission: _hasPermission,
        hasRole: _hasRole,
        isAuthenticated: _isAuthenticated
      };
    }
  ];
}).service('ExpressionEvaluator', [
  'Permissions',
  function (Permissions) {
    if (angular.isUndefined(Permissions)) {
      throw 'We need Permissions Service for evaluating!';
    }
    var VALID_EXPRESSION_PATTERNS = [
        /hasPermission\(.*\)/,
        /hasRole\(.*\)/,
        /isAuthenticated\(\)/
      ];
    function _throwIfInvalidExpression(expression) {
      var errorString = 'Invalid permission expression';
      if (angular.isUndefined(expression) || expression.length < 1) {
        throw errorString;
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
        throw errorString;
      }
    }
    function _evaluate(expression) {
      _throwIfInvalidExpression(expression);
      return eval('Permissions.' + expression);
    }
    return { evaluate: _evaluate };
  }
]).directive('twgSecureShow', [
  'ExpressionEvaluator',
  '$animate',
  function (ExpressionEvaluator, $animate) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        scope.$on('userInitialized', function () {
          evaluate();
        });
        scope.$on('userCleared', function () {
          evaluate();
        });
        var evaluate = function () {
          var result = ExpressionEvaluator.evaluate(attrs.twgSecureShow);
          $animate[result ? 'removeClass' : 'addClass'](element, 'ng-hide');
        };
        evaluate();
      }
    };
  }
]).directive('twgSecureEnabled', [
  'ExpressionEvaluator',
  function (ExpressionEvaluator) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        scope.$on('userInitialized', function () {
          evaluate();
        });
        scope.$on('userCleared', function () {
          evaluate();
        });
        var evaluate = function () {
          var result = ExpressionEvaluator.evaluate(attrs.twgSecureEnabled);
          element.attr('disabled', !result);
        };
        evaluate();
      }
    };
  }
]);
;
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
angular.module('twigs.sortable').directive('twgSortable', function () {
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
 * <tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >
 *     ....
 * </tr>
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
angular.module('twigs.tableRowClick').directive('twgTableRowClick', [
  '$location',
  'ExpressionEvaluator',
  function ($location, ExpressionEvaluator) {
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
          if (isAllowed() && !isNgClickWrappedElement(event.target)) {
            scope.$apply(function () {
              $location.path(targetUrl);
            });
          }
        });
      }
    };
  }
]);
angular.module('twigs.templates').run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    $templateCache.put('templates/errorModal.html', '<div class="modal-header">\r' + '\n' + '    <button type="button" class="close" x-ng-click="$close()" aria-hidden="true">&times;</button>\r' + '\n' + '    <h3><i class="glyphicon glyphicon-exclamation-sign"></i>{{title}}</h3>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-body">\r' + '\n' + '    <p>{{message}}</p>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-footer">\r' + '\n' + '    <button class="btn btn-default" x-ng-click="$close()">{{primaryButtonText}}</button>\r' + '\n' + '</div>');
    $templateCache.put('templates/fileModal.html', '<div class="modal-header">\r' + '\n' + '    <h3>{{title}}</h3>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-body">\r' + '\n' + '    <iframe id="modal-fileframe" x-ng-src="{{message}}"></iframe>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-footer">\r' + '\n' + '    <button class="btn btn-default" x-ng-click="$close()">{{backButtonText}}</button>\r' + '\n' + '</div>');
    $templateCache.put('templates/infoModal.html', '<div class="modal-header">\r' + '\n' + '    <button type="button" class="close" x-ng-click="$close()">&times;</button>\r' + '\n' + '    <h3><i class="glyphicon glyphicon-info-sign"></i>{{title}}</h3>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-body">\r' + '\n' + '    <p>{{message}}</p>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-footer">\r' + '\n' + '    <button class="btn btn-default" x-ng-click="$close()">{{primaryButtonText}}</button>\r' + '\n' + '</div>');
    $templateCache.put('templates/successToast.html', '<!-- for success messages, centered on top of browser window (aka "Toast")-->\r' + '\n' + '<div class="alert alert-success fade-in" x-ng-click="close()">\r' + '\n' + '    <button type="button" class="close" x-ng-click="close()">&times;</button>\r' + '\n' + '    <div id="successMessage"> <i class="pull-left glyphicon glyphicon-check"></i>\r' + '\n' + '        <div style="margin-left: 25px;">{{message}}</div>\r' + '\n' + '    </div>\r' + '\n' + '</div>\r' + '\n');
    $templateCache.put('templates/warningModal.html', '<div class="modal-header">\r' + '\n' + '    <button type="button" class="close" x-ng-click="$close()" aria-hidden="true">&times;</button>\r' + '\n' + '    <h3><i class="glyphicon glyphicon-exclamation-sign"></i>{{title}}</h3>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-body">\r' + '\n' + '    <p><translate>{{message}}</translate></p>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-footer">\r' + '\n' + '    <button class="btn btn-default" x-ng-click="$close()">{{primaryButtonText}}</button>\r' + '\n' + '</div>');
    $templateCache.put('templates/warningToast.html', '<!-- for success messages, centered on top of browser window (aka "Toast")-->\r' + '\n' + '<div class="alert alert-warning fade-in" x-ng-click="close()">\r' + '\n' + '    <button type="button" class="close" x-ng-click="close()">&times;</button>\r' + '\n' + '    <div id="successMessage"> <i class="pull-left glyphicon glyphicon-check"></i>\r' + '\n' + '        <div style="margin-left: 25px;">{{message}}</div>\r' + '\n' + '    </div>\r' + '\n' + '</div>\r' + '\n');
    $templateCache.put('templates/yesnoModal.html', '<div class="modal-header">\r' + '\n' + '    <h3>{{title}}</h3>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-body">\r' + '\n' + '    <p>{{message}}</p>\r' + '\n' + '</div>\r' + '\n' + '<div class="modal-footer">\r' + '\n' + '    <button class="btn btn-danger" x-ng-click="$close(false)">{{primaryButtonText}}</button>\r' + '\n' + '    <button class="btn btn-yes {{message.yesButtonCls}} btn-success" x-ng-click="$close(true)">{{secondaryButtonText}}</button>\r' + '\n' + '</div>');
  }
]);