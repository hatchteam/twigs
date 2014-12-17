'use strict';


angular.module('twigsDemo').config(function (FlowProvider) {


// define a flow
  FlowProvider.flow('myWizard')
    .step({
      'id': 'first',  // a unique step id within this flow.
      'route': '/flow/first',  // this matches the first route definition from above
      'transitions': {
        'next': 'second',
        'skip': 'third'    // allows to skip step two and jump directly to the last step
      }
    })
    .step({
      'id': 'second',
      'route': '/flow/second',
      'transitions': {
        'previous': 'first',    // allows to switch to the previous step
        'next': 'third' // allows to proceed to the next step
      }
    }).step({
      'id': 'third',
      'route': '/flow/third',
      'transitions': {
        'previous': 'second'
      }
    }).createFlow();

});
