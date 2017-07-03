var app = angular.module("traveldiary", ["ngRoute"]);

app.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl: "pages/login.html",
    controller: "session"
  })
  .when("/travels",{
    templateUrl: "pages/travels.html",
    controller: "travelscontroller"
  })
  .otherwise({
    template : "<h2>Ups! Wrong page!</h2>"
  });
});

app.controller("session", function($scope, $http, $interval){

});

app.controller("maincontroller", function($scope, $http, $interval){
  $scope.page = {};
  $scope.page.title = "Travel Diary"
});

app.controller("travelscontroller", function($scope, $http, $interval){
  $scope.message = "Olá mundo!";
});

app.controller("chatcontroller", function ($scope, $http, $interval) {

  $scope.name = "Nome";
  $scope.message = "";
  $scope.messages = [];

  $scope.sendMessage = function(){
    // var data = { message: $scope.message, name: $scope.name, date: new Date().toLocaleString()}
    //
    // $http.post("/message", data).then(function (response) {
    //   $scope.messages = response.data;
    // });
    //
    // $scope.message = "";
  }
});
