GCB Activity Creator
===========================
This is a web application aimed to create, using an interactive user interface, activity javascript files for Google Course Builder.

It's developed as a part of **[Domofera MOOC](https://moocdomofera.appspot.com/)**, belonging to **[Domofera](https://domofera.com/)**. 

The **developer team** is:
 - [Alex Jover](https://github.com/alexjoverm)
 - [Elena Torró](https://github.com/elenatorro)

1. Environment overview
----------
In order to create the web application, I'm using the next **technologies**:
 -  **AngularJS**, as the frontend framework
 -  **jQuery, jQueryUI, Bootstrap...**, to provide a better interface
 -  **LESS**, as the preprocessor
 -  **Ruby & Sinatra**, as the backend

Also, I'm using **Yeoman**, which makes a faster development with scaffolding, easier testing and better and minimized production version.
 
 2. Installation and getting started
----------

### 2.1. First Steps

I've installed ***Bower, Grunt and Yeoman*** (search for the instructions), so I can use Yeoman now.

Next step is to install ***AngularJS generator*** for Yeoman:
```
npm install --global generator-angular
```
You can now create your application, typing:
```
yo angular
```
*Select Yes to the question that asks if you like to use Bootstrap*.

At this point you have your app, which you can test typing `grunt serve` or make the production version with just `grunt`.

### 2.2. Include LESS

I wanted to use **LESS**, so I had to include it myself since is not included in the generator. To do so, install it:
```
npm install grunt-contrib-less --save-dev
```
And now, make some changes in the root file `Gruntfile.js`. First add the next code between `yeoman: appConfig,` and `watch`:
```javascript
 less: {
     development: {
        options: {
            compress: true,
            yuicompress: true,
            optimization: 2
        },
        files: {
            'app/styles/main.css': 'app/styles/main.less'
        }
     }
},
``` 
Next, insert the next code within `watch:`, located after the code we've inserted:
```javascript
less: {
      files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
      tasks: ['less']
},
```

Finally, add `'less',` to any `grunt.registerTask` that you'll see by the end.



### 2.3. Include additional libraries

I want to make the items on the list sortable by the user. For that, **jQueryUI** comes with ***Sortable*** widget. In addition, exists **AngularUI** which is a jQueryUI version adapted to AngularJS. We can install the AngularUI widgets separately, so we don't need to install the full library.

To install it, we'll use **bower**:
```
bower install angular-ui-sortable --save
```
This will install and include in your `index.html` AngularUI-sortable and jQueryUI.

Despite, we have to include it in `app.js` file, in the AngularJS module, just type **ui.sortable** at the end:
```javascript
angular.module('gcbCreatorApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.sortable'
]
```

To make that work in touchable devices, also I've installed **jQueryUI touch punch**:
```
bower install jquery-ui-touch-punch-improved --save
```


 3. Frontend development
----------

### Views
I have some views:
 -  **main.html**, where will be most of the functionality
 -  **instructions.html**, which teach some tips about how to use the app
 -  **about.html**, displays team information and contact page

In order to create `instructions.html`, I've used the AngularJS generator, it will take the job for us:

```
yo angular:route instructions
```
*This will create the view, controller and the route.*

I've used **AngularJS directives** to build a dynamic *User Interface*, using the minimum code.
  - **ng-repeat**: this one will create one question block for each object in `$scope.preguntas`, keeping it synchronized with the interface.
  - **ng-show & ng-hide**: since I have to get a common ***model*** for the 4 questions types, which have some variables different, I use these directives to show or hide inputs according to the question types.
  - **ng-click**: basically, I use that one to make changes with the UI and the $scope at the same time, such as to delete one question entry.
  - **ui-sortable**: this make that the children of the container that have it, could be sortable with the mouse. As a matter of fact, this feature **must be deactivated and reactivated** when the user is typing, because it will take the **click event** of the whole block for itself.


### Controllers
Each view has it's own controller, but for the `main.html` I've created a second controller, to separate the code which is getting bigger.

To create a *second controller*:
  - Create `main2.js` in the controllers folder
  - Add it to `index.html`: `<script src="scripts/controllers/main2.js"></script>`
  - In `main.html`, add the controller directive `<div class="container" ng-controller="Main2Ctrl">`, as you can see in the `main.html` of the project.

The aim of separate the controllers, is to keep in `main.js` the `$scope` and models functionalities, and to put apart others functionalities in `main2.js`, like jQuery and code related to the UI.


### Animations
Apart from the typical *css transitions*, I've done more sophisticated animations. AngularJS has three ways to make animations, based on css classes *(since angular 1.2)*: ***Css transition, Css keyframes an JS way***. I've used the least code needed way in each case.

**Views animations** are done in the `.less` at the top *(the div which include the ng-view directive has the .view class)*:

```less
//******************** ANIMACIONES
.view.ng-enter{
    animation: view_enter (@anim-view-dur * 2);
}

.view.ng-leave{
    animation: view_leave @anim-view-dur;
}

@keyframes view_enter{
    0% { opacity: 0; }
    50% { opacity: 0; }
    100% { opacity: 1; }
}
@keyframes view_leave{
    0% { opacity: 1; }
    100% { opacity: 0; }
}
```

**Question animations** are made by the JS way. To make it global, I wrote the code in the `app.js` instead of in a controller:

```javascript
//*********************  ANIMACIONES
// Animacion de las preguntas

mainModule.animation('.question-wrapper', function() {
    return {
        enter : function(element, done) { 
            var height = jQuery(element).height();
            jQuery(element).css({ 'max-height': 0, padding: '0 15px', 'opacity': 0 });
            jQuery(element).animate({'max-height': height+30, padding: '10px 15px', 'opacity': 1 }, 400, done);
        },

        leave : function(element, done) {
            var height = jQuery(element).height();
            jQuery(element).css({ 'max-height': height+30, padding: '10px 15px', 'opacity': 1 });
            jQuery(element).animate({'max-height': 0, padding: '0 15px', 'opacity': 0 }, 400, done);
        }
    };
});
```



### Main navbar

I've added a controller to the Main Navbar, in order to make dinamically the `active` class *(within `app.js`)*:

```javascript
function HeaderController($scope, $location) 
{ 
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
}
```
and in `index.html`, where the navbar is, the following code:
```html
<nav ng-controller="HeaderController" id="nav-list" class="collapse navbar-collapse" role="navigation" >
```






