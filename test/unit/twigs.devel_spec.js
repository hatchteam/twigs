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

describe('Service Devel', function () {

  var dummyErrorName = 'Something went terribly wrong';
  var dummyErrorPayload = {
    'what': 'I lost my twigs'
  };
  var dummyUrl = 'http://some/url';
  var dummyResponse = {some: 'data response'};
  var dummyStatus = 200;


  var DevelopmentInfoServiceProvider;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', function () {
    });

    fakeModule.config(function (_DevelopmentInfoServiceProvider_) {
      DevelopmentInfoServiceProvider = _DevelopmentInfoServiceProvider_;
    });
    // Initialize ht.flow module injector
    angular.mock.module('twigs.devel', 'testApp');

    // Kickstart the injectors previously registered with calls to angular.mock.module
    inject(function () {
    });
  });

  // instantiate service
  var DevelopmentInfoService, $rootScope, scope, ERROR_REPORTED_EVENT, SERVER_REQUEST_REPORTED_EVENT;
  beforeEach(inject(function (_DevelopmentInfoService_, _$rootScope_, _ERROR_REPORTED_EVENT_, _SERVER_REQUEST_REPORTED_EVENT_) {
    DevelopmentInfoService = _DevelopmentInfoService_;
    $rootScope = _$rootScope_;
    ERROR_REPORTED_EVENT = _ERROR_REPORTED_EVENT_;
    SERVER_REQUEST_REPORTED_EVENT = _SERVER_REQUEST_REPORTED_EVENT_
    scope = $rootScope.$new();
  }));

  describe('Provider', function () {

    it('allows to set a urlFilter', function () {
      var pattern = /\/ws\/rest\//;
      DevelopmentInfoServiceProvider.setUrlFilterPattern(pattern);
      expect(DevelopmentInfoService.getUrlFilterPattern()).toEqual(pattern);
    });

  });

  describe('Service', function () {

    it('allows to report an error', function () {
      DevelopmentInfoService.reportError(dummyErrorName, dummyErrorPayload);
    });

    it('event is broadcasted on error report', function (done) {


      // attach dummy listener to error event
      $rootScope.$on(ERROR_REPORTED_EVENT, function () {
        done();
      });

      // report an error
      DevelopmentInfoService.reportError(dummyErrorName, dummyErrorPayload);

    });

    it('allows to report a server request', function () {
      DevelopmentInfoService.reportServerRequest(dummyUrl, dummyResponse, dummyStatus);
    });

    it('event is broadcasted on request report', function (done) {


      // attach dummy listener to error event
      $rootScope.$on(SERVER_REQUEST_REPORTED_EVENT, function () {
        done();
      });

      // report a server request
      DevelopmentInfoService.reportServerRequest(dummyUrl, dummyResponse, dummyStatus);

    });

  });


});
