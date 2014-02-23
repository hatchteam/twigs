
# Twigs

Twigs is a library of useful Services and Directives for AngularJS applications. It evolved out of the [Hatch](https://bitbucket.org/hatchteam/hatch) project.

# Quickstart

1. Add twigs as a dependency to your **bower.json**.
2. run **bower install**
3. Reference the twigs modules you want to use in your angular module's declaration.
4. Reference the needed files in your index.html


## Module: Twigs

Twigs just combines all modules in one.
So for convenience, use 'twigs' as a dependency in your module to include all Twigs modules at once.

## Module: GlobalHotkeys

GlobalHotkeys allows you to assign actions to specific keyboard key combinations.
In order for it to work, add the 'twg-global-hotkeys' directive to the top-element of your angular application (e.g. the html-element in a single page application).

**Note:** All keypress/keydown events within input fields (input/textarea/select), links and buttons do not trigger the hotkey callback.

### Globally defined hotkeys
Globally defined hotkeys are available on all pages (except if explicitly overridden by path-specific hotkeys). You can define them in the **run** function of your Application's main module.

 ```javascript
var App = angular.module('Main',['twigs.globalHotKeys']);

App.run(function ($location, GlobalHotKeysService) {

    GlobalHotKeysService.registerGlobalHotKeys(["alt+h", "shift+h"], function () {
        // go to home view
        $location.path('/#');
    });


    GlobalHotKeysService.registerGlobalHotKeys(["alt+a", "shift+a"], function () {
        // do something here
    });

});
  ```


### Path-specific hotkeys
You can define path-specific hotkeys which can override globally defined hotkeys. These will only be active for the current page.

 ```javascript

App.controller('SomeController', function (GlobalHotKeysService) {

    GlobalHotKeysService.registerPageHotKey("alt+i", function () {
        // do something here
    });

});

 ```


## Module: TableRowClick

For a better user experience, we want to be able to react to mouseclicks anywhere on a table row, not just one link in a cell.
This directive adds a mouse listener to the row and switches to the specified url when the user clicks anywhere on the row.

 ```javascript
var App = angular.module('Main',['twigs.tableRowClick']);
 ```

 ```html
<tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >  ....</tr>
 ```

Additionally it can handle events that bubble up from other elements with ng-click handlers within the row (and thus correctly ignoring these).

Example: a Click on the button in the first row will not trigger a location change, but only invoke the 'doSomething()' method. A click on the second cell (the text) will trigger the url to change.

 ```html
<tr x-ng-repeat="user in users.rows" twg-table-row-click="/users/{{user.id}}" >
    <td><button ng-click="doSomething()">do it</button></td>
    <td>Some text</td>
</tr>
 ```


## Module: ActiveRoute

In almost every webpage you'd like to mark elements as active, if the current view matches their link. E.g., in a navigation Menu,
the currently active item should be highlighted.


Add the active-route directive to the navigation elements and specify a regex that should match the currently active route.
The directive will listen to url changes and add the css class **'active'** to the element.

```html
<ul>
    <li><a twg-active-route="/home" href="/home">Home</a></li>
    <li><a twg-active-route="/aboutMe" href="/aboutMe">About me</li>
</ul>
```

A more complex example:

```html
<ul>
    <li twg-active-route="/home"><a href="/home">Home</a></li>
    <li twg-active-route="/settings/.*">Settings
        <ul>
            <li twg-active-route="/settings/audio"><a href="/settings/audio">Audio Settings</li>
            <li twg-active-route="/settings/video"><a href="/settings/video">Video Settings</li>
        </ul>
    </li>
</ul>
```

You can also set your own css class: The directive will set a flag (**'twgActive'**) on the scope to true, if the url matches the specified
regex.

```html
<ul>
    <li><a twg-active-route="/home" href="/home" ng-class="{current: twgActive}">Home</a></li>
    <li><a twg-active-route="/about" href="/aboutMe" ng-class="{current: twgActive}">About me</li>
</ul>
```


## Module: Sortable

In a modern user interface, we expect tables to be sortable.
The twgSortable directive provides an easy way to define sortable tables. Just specify the attribute's name
you want to sort by (in the example: 'name' and 'number').


The directive will set the scope variables **orderPropertyName** and **orderProp** which you can use
in the usual way in ngRepeat.

On the first click, the rows are sorted ascending, on a second click to the same column header, the rows are
sorted descending.

In Addition, marker css classes are added the column headers, which enables specific styling (e.g. arrows).

```html
<table>
    <thead>
        <tr>
            <th twg-sortable="name">Name</th>
            <th twg-sortable="number">Number</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="data in dummyData | orderBy:orderPropertyName:orderProp">
            <td>{{data.number}}</td>
            <td>{{data.name}}</td>
        </tr>
    </tbody>
</table>
```

## Module: Flow

In more complex applications we'd like to chain different views into business processes, i.e. flows.

These can be wizard-like processes with many steps or simple ones that guide the user through only a few views.
**Flow** provides you with a simple mechanism to define which angular route definitions you want to chain to a process.
It allows you to define allowed transitions between steps and gives you easy access to the shared model across all steps.

### Flow creation

In the **config** function of your application's main module, you can define the flows:

```javascript
var App = angular.module('Main',['twigs.flow']);

App.config(function ($routeProvider,FlowProvider) {

// define your routes as usual
$routeProvider
    .when('/firstStep', {
        templateUrl: 'views/wizard_first.html',
        controller: 'WizardCtrl'
    })
    .when('/secondStep', {
        templateUrl: 'views/wizard_second.html',
        controller: 'WizardCtrl'
    })
    .when('/thirdStep', {
        templateUrl: '/views/wizard_third.html',
        controller: 'WizardCtrl'
    });

// define a flow
$flowProvider.flow('myWizard')
    .step({
        'id': 'first',  // a unique step id within this flow.
        'route': '/firstStep',  // this matches the first route definition from above
        'transitions': {
            'next': 'second',
            'skip': 'third',    // allows to skip step two and jump directly to the last step
        }
    })
    .step({
        'id': 'second',
        'route': '/secondStep',
        'transitions': {
            'previous': 'first',    // allows to switch to the previous step
            'next': 'third' // allows to proceed to the next step
        }
    }).step({
        'id': 'third',
        'route': '/thirdStep',
        'transitions': {
            'previous': 'second'
        }
    }).createFlow();

});
```

In this example, the steps share the same controller. For more complex flows, you'd want to use
separate controllers for each step.


### Flow navigation

Within your controller, you have access to the shard model and can navigate between the steps.

```javascript
angular.module('Main')
    .controller('WizardCtrl', function ($scope, Flow) {

    // the Flow service holds the shared model
    $scope.flowmodel = Flow.getModel();

    $scope.onButtonPrevious = function () {
        Flow.previous($scope.flowmodel);
    };

    $scope.onButtonNext = function () {
        Flow.next($scope.flowmodel);
    };

});
```

### FlowProvider methods

- **flow(flowId)**

   Adds a new flow.

| Param        | Type           | Details  |
| ------------ | ------------- | ----- |
| flowId    | `String` | A unique id for this new flow |

- **step(stepConfig)**

  Adds a step to the current flow.

| Param        | Type           | Details  |
| ------------ | ------------- | ----- |
| stepConfig    | `Object` | Step configuration with properties: **id**, **route**, and **transitions**   |

- **createFlow()**

   Completes the flow creation. You must invoke this function before starting a new flow with **flow()**.

### Flow methods

- **getModel()**

  Returns the flow model.

- **next()**

  Proceeds to the next step (i.e. performs the transition with the id **'next'**).


- **previous()**

  Proceeds to the previous step (i.e. performs the transition with the id **'previous'**).


- **toStep(targetStepId)**

  Jumps directly to the specified step (if this transition is allowed by config).

| Param        | Type           | Details  |
| ------------ | ------------- | ----- |
| targetStepId    | `String` | The id of the step to jump to |

- **isCurrentStep(stepId)**

  Returns true if the current step matches the given stepId. Can be of use if you share a controller between
  all steps.

| Param        | Type           | Details  |
| ------------ | ------------- | ----- |
| stepId    | `String` | The step id to check for |


## Development Info

 1. check out the code
 2. run **npm install**
 3. run **grunt test:unit**