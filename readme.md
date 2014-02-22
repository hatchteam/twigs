
# Twigs

Twigs is a library of useful Services and Directives for AngularJS applications. It evolved out of the [Hatch](https://bitbucket.org/hatchteam/hatch) project.

# Quickstart

1. Add twigs as a dependency to your **bower.json**.
2. run **bower install**
3. Reference the twigs modules you want to use in your angular module's declaration.
4. Reference the needed files in your index.html

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


## Development Info

 1. check out the code
 2. run **npm install**
 3. run **grunt test:unit**