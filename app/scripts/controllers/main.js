'use strict';

angular.module('yeomanAngularRestuarantApp');

var app = angular.module('yeomanAngularRestuarantApp');

app.controller('MainCtrl', ['$scope','$http','$location',function ($scope,$http,$location) {
    $scope.tables = [];
    $scope.foods = [];
    $scope.currentTable = 0;

    $scope.selectTable = function (table) {
    	$scope.currentTable = table.table;
    	$location.path('/tables/' + table._id);
    };

    $http.get('http://localhost:3000/restaurant/tables').success(function (data) {
    	$scope.tables = data.tables;
    });

    $http.get('http://localhost:3000/restaurant/foods').success(function (data) {
    	$scope.foods = data.foods;
    });    
}]);

app.controller('TableCtrl', ['tableFactory','$scope','$stateParams',function (tableFactory,$scope,$stateParams) {
    $scope.table = [];

    var table_id = $stateParams.table_id;

    console.log($scope.foods);
    
    tableFactory.getTable(table_id).success(function (table) {
    	$scope.table = table;
    });

    $scope.addFood = function (food) {
    	var tabitem = {
    		cents: food.cents,
    		foods: food
    	}
    	$scope.table.table.tabs.tabitems.push(tabitem);
    	$scope.table.table.total += food.cents;
    };
}]);

app.factory('tableFactory', ['$http','$q', function ($http,$q) {

	var tableFactory = {

		getTable: function (table_id) {
		    return $http.get('http://localhost:3000/restaurant/tables/' + table_id).success(function (data) {
		    	var table = [];
		    	var tempTable = data.table;
		    	var tabs = tempTable.tabs;
		    	tempTable.total = 0;

		    	$http.get('http://localhost:3000/restaurant/tabs/' + tabs).success( function (data) {
		    		tempTable.tabs = data.tab;
		    		var items = [];

		    		angular.forEach(data.tab.tabitems, function (tabitem) {
						items.push($http.get('http://localhost:3000/restaurant/tabitems/' + tabitem));
		    		});

		    		$q.all(items).then(function (results) {
		    			var tabitem = [];

			    		angular.forEach(results, function (result) {
							tabitem.push(result.data.tabitem);
			    		});
			    	
			    		var foods = [];

			    		angular.forEach(tabitem, function (food) {

							$http.get('http://localhost:3000/restaurant/foods/' + food.foods).success(function(data){
								food.foods = data.food;
								tempTable.total += food.foods.cents;
							})
			    		});

			    		table = tempTable;
			    		table.tabs.tabitems = tabitem;
		    		});
		    	}).error( function (error) {
		    		table = tempTable;
		    	});

		    	return table;
		    });
		}
	}

	return tableFactory;
}]);

app.directive('tableMenu', function () {
	return {
		restrict: 'E',
		templateUrl: 'views/table-menu.html'
	}
});

app.directive('tabItems', function () {
	return {
		restrict: 'E',
		templateUrl: 'views/tab.html'
	}
});

app.directive('foods', function () {
	return {
		restrict: 'E',
		templateUrl: 'views/foods.html'
	}
});