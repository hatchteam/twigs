'use strict';

describe("Directive: twgActiveRoute", function () {
    var $compile, $rootScope, $scope, $location;

    beforeEach(function () {

        /**
         * instantiate test module with a dependency to our activeRoute module.
         * Set up some dummy route config
         */
        angular.mock.module('twigs.activeRoute');

    });

    beforeEach(inject(function (_$compile_, _$rootScope_, _$location_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $location = _$location_;

        /* start at 'home' */
        $location.path('/home');
        $rootScope.$apply();
    }));


    function whenCompiling(tableElement) {
        var element = $compile(tableElement)($scope);
        $scope.$digest();
        return element;
    }

    function simulateRouteChange(path){
        $location.path(path);
        $rootScope.$broadcast('$routeChangeSuccess');
        $rootScope.$apply();
    }

    it("should mark as active", function () {
        var tableElement = angular.element('<div><ul><li twg-active-route="/settings">Settings</li></ul></div>');
        var element = whenCompiling(tableElement);
        var listElements = element.find('li');
        expect(listElements.length).toBe(1);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
    });

    it("should mark only matching as active", function () {
        var tableElement = angular.element('<div><ul><li twg-active-route="/settings">Settings</li><li twg-active-route="/home">Home</li></ul></div>');
        var element = whenCompiling(tableElement);
        var listElements = element.find('li');
        expect(listElements.length).toBe(2);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        expect(listElements.eq(1).hasClass('active')).toBe(false);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
        expect(listElements.eq(1).hasClass('active')).toBe(true);
    });


    it("should correctly set scope flag", function () {
        var tableElement = angular.element('<div><ul><li twg-active-route="/settings" x-ng-class="{current: twgActive}" >Settings</li><li twg-active-route="/home" x-ng-class="{now: twgActive}" >Home</li></ul></div>');
        var element = whenCompiling(tableElement);
        var listElements = element.find('li');
        expect(listElements.length).toBe(2);

        simulateRouteChange('/settings');
        expect(listElements.eq(0).hasClass('active')).toBe(true);
        expect(listElements.eq(0).hasClass('current')).toBe(true);
        expect(listElements.eq(1).hasClass('active')).toBe(false);
        expect(listElements.eq(1).hasClass('now')).toBe(false);
        simulateRouteChange('/home');
        expect(listElements.eq(0).hasClass('active')).toBe(false);
        expect(listElements.eq(0).hasClass('current')).toBe(false);
        expect(listElements.eq(1).hasClass('active')).toBe(true);
        expect(listElements.eq(1).hasClass('now')).toBe(true);
    });


});



