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
angular.module('twigs.flow')

    .provider('Flow', function () {
        this.flows = {};

        this.$get = function ($location, $log) {
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

                throw "no step with id";
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
                    throw "transition to step " + targetStepId + " is not allowed!";
                }
            }


            var FlowService = {
                currentFlowId: undefined,
                currentFlowModel: {},


                /**
                 * @ngdoc function
                 * @name twigs.flow.service:Flow#getModel
                 * @methodOf twigs.flow.service:Flow
                 *
                 * @description
                 *  Returns the flow model.
                 *
                 *  @returns {object} The flow model
                 */
                getModel: function () {
                    return this.currentFlowModel;
                },


                /**
                 * @ngdoc function
                 * @name twigs.flow.service:Flow#next
                 * @methodOf twigs.flow.service:Flow
                 *
                 * @description
                 * Proceeds to the next step (i.e. performs the transition with the id **'next'**).
                 */
                next: function () {
                    var targetStepId, targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
                    this.currentFlowId = flowAndStep.flow.id;

                    targetStepId = flowAndStep.step.transitions.next;
                    if (angular.isUndefined(targetStepId)) {
                        throw "step does not define a transition 'next'";
                    }


                    targetStep = findStepForId(targetStepId, this.currentFlowId);
                    $location.path(targetStep.route);
                },


                /**
                 * @ngdoc function
                 * @name twigs.flow.service:Flow#previous
                 * @methodOf twigs.flow.service:Flow
                 *
                 * @description
                 * Proceeds to the previous step (i.e. performs the transition with the id **'previous'**).
                 */
                previous: function () {
                    var targetStepId, targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
                    this.currentFlowId = flowAndStep.flow.id;

                    targetStepId = flowAndStep.step.transitions.previous;
                    if (angular.isUndefined(targetStepId)) {
                        throw "step does not define a transition 'previous'";
                    }

                    targetStep = findStepForId(targetStepId, this.currentFlowId);
                    $location.path(targetStep.route);
                },


                /**
                 * @ngdoc function
                 * @name twigs.flow.service:Flow#toStep
                 * @methodOf twigs.flow.service:Flow
                 *
                 * @description
                 * Jumps directly to the specified step (if this transition is allowed by config).
                 *
                 * @param {string} targetStepId The id of the step to jump to
                 */
                toStep: function (targetStepId) {
                    var targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
                    this.currentFlowId = flowAndStep.flow.id;

                    throwErrorIfJumpIsNotAllowed(flowAndStep.step.transitions, targetStepId);

                    targetStep = findStepForId(targetStepId, this.currentFlowId);
                    $location.path(targetStep.route);
                },


                /**
                 * @ngdoc function
                 * @name twigs.flow.service:Flow#isCurrentStep
                 * @methodOf twigs.flow.service:Flow
                 *
                 * @description
                 * Checks whether the current step matches the given stepId.
                 * Can be of good use if you share a controller between all steps.
                 *
                 * @param {string} stepId The step id to check for
                 * @returns {boolean} True if the given stepId matches the current step. False otherwise.
                 */
                isCurrentStep: function (stepId) {
                    var flowAndStep , targetStep, currentPath = $location.path();

                    flowAndStep = findFlowAndStepForRoute(currentPath);
                    if (angular.isUndefined(flowAndStep)) {
                        throw "no flow found for path " + currentPath;
                    }
                    targetStep = findStepForId(stepId, flowAndStep.flow.id);

                    return checkIfStepRouteRegexMatches(targetStep.routeRegex, currentPath);
                },

                finish: function () {
                    this.currentFlowId = undefined;
                    this.currentFlowModel = {};
                }

            };

            return FlowService;
        };

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
                throw "flow configuration error! use '$flowProvider.createFlow()' to complete previous flow";
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
            var insensitive = opts.caseInsensitiveMatch,
                ret = {
                    originalPath: path,
                    regexp: path
                },
                keys = ret.keys = [];

            path = path
                .replace(/([().])/g, '\\$1')
                .replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
                    var optional = option === '?' ? option : null;
                    var star = option === '*' ? option : null;
                    keys.push({ name: key, optional: !!optional });
                    slash = slash || '';
                    return '' +
                        (optional ? '' : slash) +
                        '(?:' + (optional ? slash : '') +
                        (star && '(.+?)' || '([^/]+)') +
                        (optional || '') +
                        ')' +
                        (optional || '');
                })
                .replace(/([\/$\*])/g, '\\$1');

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
                throw "flow configuration error! use '$flowProvider.flow('myFlow').step(...)";
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
            this.currentFlowId = undefined;

            // TODO: maybe check transitions:  check if target of transition is a valid stepId that exists in the flow
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
                throw "step must have an id";
            }
            if (angular.isUndefined(stepconfig.route)) {
                throw "step must have a route";
            }
        }

    });
