'use strict';


angular.module('twigsDemo').config(function ($routeProvider) {


  $routeProvider

    .when('/home', {
      templateUrl: 'views/home.html'
    })
    .when('/modules/:sub?', {
      templateUrl: 'views/modules.html'
    })


    .when('/flow', {
      redirectTo: '/flow/first'
    })
    .when('/flow/first', {
      controller: 'DemoFlowController',
      controllerAs: 'flow',
      templateUrl: 'views/flowFirst.html'
    })
    .when('/flow/second', {
      controller: 'SecondDemoFlowController',
      controllerAs: 'flow',
      templateUrl: 'views/flowSecond.html'
    })
    .when('/flow/third', {
      controller: 'DemoFlowController',
      controllerAs: 'flow',
      templateUrl: 'views/flowThird.html'
    })

    .otherwise('/home');


});
