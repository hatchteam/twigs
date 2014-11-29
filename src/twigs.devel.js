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

angular.module('twigs.devel')

  .constant('ERROR_REPORTED_EVENT', 'twigs.devel.errorReported')
  .constant('SERVER_REQUEST_REPORTED_EVENT', 'twigs.devel.serverRequestReported')

/**
 * @ngdoc object
 * @name twigs.devel.service:DevelopmentInfoServiceProvider
 *
 * @description
 * Inject into your config function to set a url filter pattern.
 *
 * ```javascript
 * App.config(function (DevelopmentInfoServiceProvider) {
 *   DevelopmentInfoServiceProvider.setUrlFilterPattern(/\/ws\/rest\//);
 * });
 * ```
 */
  .provider('DevelopmentInfoService', function () {
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
    this.$get = function ($rootScope, ERROR_REPORTED_EVENT, SERVER_REQUEST_REPORTED_EVENT) {
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

      return {

        /**
         * @ngdoc function
         * @name  twigs.devel.service:DevelopmentInfoService#reportError
         * @methodOf twigs.devel.service:DevelopmentInfoService
         *
         * @description
         * Invoke this to report an error that happend in your application
         *
         * @param {string} name The name of the error
         * @param {object} data Error payload that will be displayed
         */
        reportError: reportError,

        /**
         *  Only invoked by our response interceptor. No need to use that from outside.
         */
        reportServerRequest: reportServerRequest,

        getUrlFilterPattern: getUrlFilterPattern,

        /**
         * only used by our controller
         */
        getCustomData: getCustomData,


        /**
         * @ngdoc function
         * @name  twigs.devel.service:DevelopmentInfoService#watchCustomData
         * @methodOf twigs.devel.service:DevelopmentInfoService
         *
         * @description
         * Register addition custom data that will be displayed in the devel footer
         *
         * @param {string} id The id/name of the data
         * @param {object} data Data object to watch and display
         */
        watchCustomData: watchCustomData
      };
    };
  }
)

/**
 * @ngdoc object
 * @name twigs.devel.controller:DevelopmentInfoCtrl
 *
 * @description
 * Provides a scope which contains the gathered development Information.
 *
 * Use this controller in your markup to get access to the gathered Information.
 *
 *
 * Example:
 * ```html
 * <footer id="devel-footer" ng-controller="DevelopmentInfoCtrl">
 *     <div class="container">
 *         <div class="page-header">
 *             <h3>Development Info</h3>
 *         </div>
 *
 *         <h4>Errors</h4>
 *
 *         <div ng-repeat="error in errors" class="devel-error">
 *             <h4>
 *                 <span class="label label-danger">{{error.name}}</span>
 *                 <small>{{error.date}}</small>
 *             </h4>
 *             {{error.payload | json}}
 *         </div>
 *
 *         <h4>REST Requests</h4>
 *
 *         <div ng-repeat="request in serverRequests" class="devel-request">
 *             <h4><span class="label " ng-class="{'label-success':request.status === 200,'label-danger':request.status !== 200}">{{request.status}}</span>
 *                 <button class="btn btn-xs btn-default" ng-click="request.showResponse = !request.showResponse"
 *                         translate>toggle_response
 *                 </button>
 *                 <small>{{request.url}}</small>
 *             </h4>
 *             <div ng-show="request.showResponse">{{request.response | json}}</div>
 *         </div>
 *     </div>
 * </footer>
 * ```
 */
  .
  controller('DevelopmentInfoCtrl', function ($rootScope, $scope, $cookieStore, $location, DevelopmentInfoService, ERROR_REPORTED_EVENT, SERVER_REQUEST_REPORTED_EVENT) {

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
  })


/**
 * Registers a responseInterceptor that reports all xhttpResponses that
 * devel footer will then display this information
 */
  .config(['$httpProvider', function ($httpProvider) {

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

    /** manually specify collaborator names to fix uglifying **/
    $httpProvider.responseInterceptors.push(['$q', 'DevelopmentInfoService', interceptor]);
  }]);
