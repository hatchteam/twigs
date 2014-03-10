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

describe('Service & Provider: Flow', function () {

    var FlowProvider, Flow, $location;

    beforeEach(function () {
        // Initialize the service provider by injecting it to a fake module's config block
        var fakeModule = angular.module('testApp', function () {
        });

        fakeModule.config(function (_FlowProvider_) {
            FlowProvider = _FlowProvider_;
        });
        // Initialize ht.flow module injector
        angular.mock.module('twigs.flow', 'testApp');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(function () {
        });
    });

    beforeEach(inject(function (_Flow_, _$location_) {
        Flow = _Flow_;
        $location = _$location_;
    }));


    describe('Flow Provider', function () {

        it('allows to setup a valid new flow', function () {
            expect(FlowProvider).not.toBeUndefined();

            // create a new flow
            var flowConfig = FlowProvider.flow('myNewFlow');
            expect(flowConfig.flows['myNewFlow'].id).toBe('myNewFlow');
            expect(flowConfig.flows['myNewFlow'].id).toBe(flowConfig.currentFlowId);

            // add a first step
            flowConfig = flowConfig.step({
                'id': 'firstStep',
                'route': '/first',
                'transitions': {
                    'next': 'secondStep'
                }
            });
            expect(flowConfig.flows['myNewFlow'].steps['firstStep']).not.toBeUndefined();

            // add a second step
            flowConfig = flowConfig.step({
                'id': 'secondStep',
                'route': '/second',
                'transitions': {
                    'previous': 'firstStep'
                }
            });
            expect(flowConfig.flows['myNewFlow'].steps['secondStep']).not.toBeUndefined();

            // now create it
            flowConfig.createFlow();

        });

        it('does not allow to setup a step twice within a flow', function () {

            // create a new flow
            var flowConfig = FlowProvider.flow('myNewFlow');

            // add a first step
            flowConfig = flowConfig.step({
                'id': 'firstStep',
                'route': '/first',
                'transitions': {
                    'next': 'secondStep'
                }
            });

            function addSecondStep() {
                // add a second step with the same id, this should throw an error
                flowConfig = flowConfig.step({
                    'id': 'firstStep',
                    'route': '/second',
                    'transitions': {
                        'previous': 'firstStep'
                    }
                });
            }

            // that's how we expect exceptions in a unit test
            // jasmine is invoking the wrapper function. if no exception is thrown, the test fails
            expect(addSecondStep).toThrow();

        });

        it('does not allow to setup a step without a flow', function () {
            // add a first step
            function addStep() {
                flowConfig.step({
                    'id': 'firstStep',
                    'route': '/first',
                    'transitions': {
                        'next': 'secondStep'
                    }
                });
            }

            expect(addStep).toThrow();
        });

        it('does not allow to setup a new flow, when another flow is currently being configured', function () {

            // create a new flow
            var flowConfig = FlowProvider.flow('myNewFlow');

            function createNewFlow() {
                FlowProvider.flow('mySecondFlow');
            }

            expect(createNewFlow).toThrow();
        });
    });


    describe('Flow Service', function () {

        function configureValidFlow() {

            FlowProvider.flow('myNewFlow')
                .step({
                    'id': 'firstStep',
                    'route': '/first',
                    'transitions': {
                        'next': 'secondStep'
                    }
                }).step({
                    'id': 'secondStep',
                    'route': '/second',
                    'transitions': {
                        'previous': 'firstStep'
                    }
                })
                .createFlow();
        }

        function configureValidFlowWithPlaceholder() {

            FlowProvider.flow('myNewFlow')
                .step({
                    'id': 'firstStep',
                    'route': '/first/:placeholder',
                    'transitions': {
                        'next': 'secondStep'
                    }
                }).step({
                    'id': 'secondStep',
                    'route': '/second',
                    'transitions': {
                        'previous': 'firstStep'
                    }
                })
                .createFlow();
        }

        function configureValidFlowWithPlaceholderMiddle() {

            FlowProvider.flow('myNewFlow')
                .step({
                    'id': 'firstStep',
                    'route': '/first/:placeholder/something',
                    'transitions': {
                        'next': 'secondStep'
                    }
                }).step({
                    'id': 'secondStep',
                    'route': '/second',
                    'transitions': {
                        'previous': 'firstStep'
                    }
                })
                .createFlow();
        }

        function configureValidFlowWithMultiplePlaceholders() {

            FlowProvider.flow('myNewFlow')
                .step({
                    'id': 'firstStep',
                    'route': '/first/:placeholder/:anotherPlaceholder',
                    'transitions': {
                        'next': 'secondStep'
                    }
                }).step({
                    'id': 'secondStep',
                    'route': '/second',
                    'transitions': {
                        'previous': 'firstStep'
                    }
                })
                .createFlow();
        }

        it('should provide the model', function () {
            configureValidFlow();
            var flowModel = Flow.getModel();
            expect(flowModel).toBeDefined();
        });

        it('should return true if current step matches', function () {
            configureValidFlow();
            $location.path('/first');
            var result = Flow.isCurrentStep('firstStep');
            expect(result).toBe(true);
        });

        it('should return false if current step does not match ', function () {
            configureValidFlow();
            $location.path('/second');
            var result = Flow.isCurrentStep('firstStep');
            expect(result).toBe(false);
        });

        it('should jump to next', function () {
            configureValidFlow();
            $location.path('/first');
            Flow.next(Flow.getModel());
            expect($location.path()).toBe('/second');
        });

        it('should jump to previous', function () {
            configureValidFlow();
            $location.path('/first');
            Flow.next(Flow.getModel());
            expect($location.path()).toBe('/second');

            Flow.previous(Flow.getModel());
            expect($location.path()).toBe('/first');
        });

        it('should jump to second (by id)', function () {
            configureValidFlow();
            $location.path('/first');
            Flow.toStep('secondStep', Flow.getModel());
            expect($location.path()).toBe('/second');

            Flow.toStep('firstStep', Flow.getModel());
            expect($location.path()).toBe('/first');
        });

        it('should not jump to invalid step', function () {
            configureValidFlow();
            $location.path('/first');

            function jumpToInvalidStep() {
                Flow.toStep('notExistentStepId', Flow.getModel());
            }

            expect(jumpToInvalidStep).toThrow();
        });

        it('should keep model across steps', function () {
            configureValidFlow();
            $location.path('/first');

            var flowModel = Flow.getModel();
            flowModel.myVariable = 'Asterix';

            Flow.toStep('secondStep');
            expect($location.path()).toBe('/second');
            expect(Flow.getModel().myVariable).toEqual('Asterix');
        });

        it('should accept placeholder if placed last in url', function () {
            configureValidFlowWithPlaceholder();
            $location.path('/first/1234');

            var result = Flow.isCurrentStep('firstStep');
            expect(result).toBe(true);
        });

        it('should also accept placeholder if not placed last in url', function () {
            configureValidFlowWithPlaceholderMiddle();
            $location.path('/first/1234/something');
            var result = Flow.isCurrentStep('firstStep');
            expect(result).toBe(true);
        });

        it('should also accept placeholder if there are multiple defined', function () {
            configureValidFlowWithMultiplePlaceholders();
            $location.path('/first/1234/5678');
            var result = Flow.isCurrentStep('firstStep');
            expect(result).toBe(true);
        });


    });


});
