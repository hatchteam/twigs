
# Twigs

Twigs is a library of useful Services and Directives for AngularJS applications. It evolved out of [https://bitbucket.org/hatchteam/hatch](Hatch).

# Quickstart

1. Add twigs as a dependency to your **bower.json**.
2. run **bower install**
3. Reference the twigs modules you want to use in your angular module's declaration.
4. Reference the needed files in your index.html

## Module: GlobalHotkeys

GlobalHotkeys allows you to assign actions to specific keyboard key combinations.

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



 ## Development Info

 1. check out the code
 2. npm install
 3. grunt test