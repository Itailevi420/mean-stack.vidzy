// We create an 'Angular' module for our app.
// The angular object is available in the global space, so it’s everywhere.
// The first argument is the name of the module (this is the same name we used with ng-app above), the second argument is an array of  dependencies.
const app = angular.module('Vidzy', ['ngRoute', 'ngResource']);

// We're using the 'config()' method of the 'app' module to provide configuration for our app. This code will be run as soon as 'Angular' detects 'ng-app' and tries to start up.
// The 'config()' method expects an array. 
// '$routeProvider' is a dependency defined in the 'ngRoute' module, and the second argument is our configuration function.
app.config(['$routeProvider', ($routeProvider) => {
  $routeProvider
    .when('/', {
      // With this, we’re telling 'Angular' that when the user navigates to the root of the site, display 'partials/home.html' and attach 'HomeCtrl' controller to it.
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl'
    })
    // we’re telling 'Angular' that when the user navigates to the '/add-video' directory of the site, display 'partials/video-form.html'
    .when('/add-video', {
      templateUrl: 'partials/video-form.html',
      controller: 'AddVideoCtrl',
    })
    .when('/video/:id', {
      templateUrl: 'partials/video-form.html',
      controller: 'EditVideoCtrl',
    })
    .when('/video/delete/:id', {
      templateUrl: 'partials/video-delete.html',
      controller: 'DeleteVideoCtrl',
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

// We’re using the controller method of the 'app' module to define a new controller,.
// THE FIRST parameter is a string that specifies the name of this controller. (By convention, we append 'Ctrl ' to our Angular controller names.)
// THE SECOND argument is an array, We’re specifying a dependency to '$scope' and '$resource'. Both of these are built-in 'Angular' services, and that’s why they are prefixed with a '$' sign.
app.controller('HomeCtrl', ['$scope', '$resource',
  ($scope, $resource) =>{
    // '$resource' to consume a RESTful API.
    const Videos = $resource('/api/videos');
    // We use the query method to get all videos.
    // The query method gets a callback method that will be executed when the query result is ready.
    Videos.query((videos) => {
      // '$scope' to pass data to the view.
      $scope.videos = videos;
    });
  }]);
  // Remember, '$scope' is the glue between views and controllers.

  //  '$scope' as the glue between the controller and the view.
  // '$resource' for working with our RESTful API
  // '$location' for changing the URL in the browser address bar. (All of these are built-in Angular services).
app.controller('AddVideoCtrl', ['$scope', '$resource', '$location', 
  ($scope, $resource, $location) => {
    // We define the save method on the '$scope'. This method will be called when the user clicks the 'Save' button.
    $scope.save = () => {
      // We call the '$resource' method passing the address of our API (/api/videos).
      const Videos = $resource('/api/videos');
      // This returns an object with methods to work with the API. 
      // The videos.save method takes two parameters: the object to post, and the callback function, which will indicate that the asynchronous call is complete.
      Videos.save($scope.video, () => {
        // In the callback, we use the $location service to change the browser’s address to the root of the site.
        $location.path('/');
      });
    };
  }]
);

//  $routeParams, which we use for accessing parameters in the route (URL). In this case, the ID of the video to edit will be our route parameter.
app.controller('EditVideoCtrl', ['$scope', '$resource', '$location', '$routeParams', ($scope, $resource, $location, $routeParams) => {
  // First we use the $resource service to get an object to work with our API endpoint.
  // The first argument is the URL to our endpoint.
  // We have a route parameter indicated by a colon (:id). We’re using a parameterized route because the two API endpoints included route parameters. 
  // GET /api/videos/:id
  //PUT /api/videos/:id
  // Second argument to this method is an object that provides default values for the :id parameter in our route 
  // Here, ‘@_id’ tells Angular to look for a property called _id in the object included in the body of the request. So, when we send a request to PUT /api/videos/:id, Angular will use the _id property of the video object in the body of the request, to set the :id parameter in the route.
  const Videos = $resource('/api/videos/:id', { id: '@_id' }, {
    // The third argument to the $resource method is used for extending the $resource service. For some reason only known to developers of Angular, by default you cannot send HTTP PUT requests using $resource service. You need to extend it by adding an update method that uses HTTP PUT.
    update: {method: 'PUT'}
  });
// Next, we use Videos.get to get the video with the given ID.
// This is to populate the form upon page load.
// The first argument to Videos.get provides the value for the :id parameter in the route. We use $routeParams.id, which gives us access to the parameters in the browser’s address bar.
// Remember the declaration of the route for the edit page ( .when('/video/:id', {  templateUrl: 'partials/video-form.html',   })).  There, we used a route parameter (:id). So, we can access it with $routeParams.
  Videos.get({ id: $routeParams.id }, (video) => {
    $scope.video = video;
  });
// We define a save method, which will be called when the user clicks the Save button.
  $scope.save = () => {
    // Note that here, instead of using Videos.save, we’re using Videos.update. This is the new method we defined earlier when extending the $resource service. So, this will issue an HTTP PUT request to our API endpoint.
    Videos.update($scope.video, () => {
      $location.path('/');
    });
  }
}]);

app.controller('DeleteVideoCtrl', ['$scope','$resource', '$location', '$routeParams', 
  ($scope,$resource, $location, $routeParams,) => {
    const Videos = $resource('/api/videos/:id');
    Videos.get({ id: $routeParams.id }, (video) => {
      $scope.video = video;
    })

    $scope.delete = () => {
      Videos.delete({ id: $routeParams.id}, (video) => {
        $location.path('/');
      });
    }
  }
]);