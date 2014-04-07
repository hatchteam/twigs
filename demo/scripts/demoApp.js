'use strict';


angular.module('twigsDemo', ['twigs']);


angular.module('twigsDemo').run(function (ChooseConfig) {
    ChooseConfig.setNoResultMessage('No Result');
});