
# Twigs

> "And Calimero was a hatchling no more - old enough to build his own nest..."

Twigs is a library of useful Services and Directives for AngularJS applications. It evolved out of the [Hatch](https://bitbucket.org/hatchteam/hatch) project.


### Status
| Branch        | Status         |
| ------------- |:-------------:|
| master        | [![Build Status](https://travis-ci.org/hatchteam/twigs.png?branch=master)](https://travis-ci.org/hatchteam/twigs) |
| develop        | [![Build Status](https://travis-ci.org/hatchteam/twigs.png?branch=develop)](https://travis-ci.org/hatchteam/twigs) |


# Quickstart

1. Add twigs as a dependency to your project.

  ```
  bower install twigs --save-dev
  ```

2. Reference the twigs modules you want to use in your angular module's declaration.

  ```javascript
   var App = angular.module('MyApp',['twigs']);
  ```
  
4. Reference the needed files in your index.html

  ```html
    <head>
    <!-- include twigs css for twigs.globalPopups -->
    <!-- after bootstrap.css and before yourOwn.css -->
    <link rel="stylesheet" href="bower_components/twigs/dist/styles/twigs.css">
    </head>

    <body>
    <!-- here goes your app/markup -->

    <!-- include angular -->
    <script src="bower_components/angular/angular.js"></script>
    <!-- include twigs -->
    <script src="bower_components/twigs/dist/twigs.js"></script>
    </body>
  ```


# Docu

* API reference http://hatchteam.github.io/twigs/docs/#/api/


## Development Info

 1. check out the code
 2. run **npm install**
 3. run **gulp test**

## Create a new twigs release
(this tutorial is only relevant for twigs core developers)

 1. merge your changes into master
 2. change version number in bower.json {
     "name": "twigs",
     "version": "0.1.4.1",
     ...
 3. gulp build
 4. commit the version number and dist folder
   1. run gulp docu if the docu changed
   2. commit the new docu to "gh-pages" branch
   3. push gh-pages branch
 5. push master
 6. create new release on github
   1. make sure that all branches (i.e. hotfix and develop) have at least the version of your new release
