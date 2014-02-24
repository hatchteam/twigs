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
 *
 */
angular.module('twigs.flow', [])

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

                getModel: function () {
                    return this.currentFlowModel;
                },

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
                 * jumps directly to the desired step, if this transition is allowed
                 */
                toStep: function (targetStepId) {
                    var targetStep, flowAndStep = findFlowAndStepForRoute($location.path());
                    this.currentFlowId = flowAndStep.flow.id;

                    throwErrorIfJumpIsNotAllowed(flowAndStep.step.transitions, targetStepId);

                    targetStep = findStepForId(targetStepId, this.currentFlowId);
                    $location.path(targetStep.route);
                },


                /**
                 * checks whether the current step is matching the given stepid.
                 * can be used, if you want to use one controller for the whole flow.
                 *
                 */
                isCurrentStep: function (stepId) {
                    var flowAndStep , targetStep, currentPath = $location.path();

                    flowAndStep = findFlowAndStepForRoute(currentPath);
                    if (angular.isUndefined(flowAndStep)) {
                        throw "no flow found for path " + currentPath;
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
        };

        /**
         * starts a new flow configuration
         * @returns the provider
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
         * adds a new step to the current flow
         * @returns the provider
         */
        this.step = function (stepConfig) {
            if (angular.isUndefined(this.currentFlowId)) {
                throw "flow configuration error! use '$flowProvider.flow('myFlow').step(...)";
            }

            checkStepConfig(stepConfig);

            var currentFlow = this.flows[this.currentFlowId];

            checkStepIdInFlow(currentFlow, stepConfig.id);

            currentFlow.steps[stepConfig.id] = stepConfig;

            return this;
        };

        /**
         * used to complete the current flow
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