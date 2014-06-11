'use strict';

angular.module('yeomanAngularRestuarantApp');

var app = angular.module('yeomanAngularRestuarantApp');

app.controller('MainCtrl', ['$scope','$http','$location',function ($scope,$http,$location) {
    $scope.tables = [];
    $scope.foods = [];
    $scope.currentTable = 0;
    var server = 'http://localhost:3000/restaurant';

    $scope.selectTable = function (table) {
    	$scope.currentTable = table.table;
    	$location.path('/tables/' + table._id);
    };

    $http.get(server + '/tables').success(function (data) {
    	$scope.tables = data.tables;
    });

    $http.get(server + '/foods').success(function (data) {
    	$scope.foods = data.foods;
    });    
}]);

app.controller('TableCtrl', ['tableFactory','$scope','$stateParams',function (tableFactory,$scope,$stateParams) {
    $scope.table = [];

    var table_id = $stateParams.table_id;

    if (table_id.length == 0) {
    	location.href = '/';
    }
    
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
    var server = 'http://localhost:3000/restaurant';
	var table = [];
	var tempTable = [];
	var tabs = [];

	var getFood = function (food) {
		$http.get(server + '/foods/' + food.foods).success(function(data){
			food.foods = data.food;
			tempTable.total += food.foods.cents;
		});
	};

	var getTabitems = function(tabitems) {
		var items = [];

		angular.forEach(tabitems, function (tabitem) {
			items.push($http.get( server + '/tabitems/' + tabitem));
		});

		$q.all(items).then(function (results) {
			var tabitems = [];

    		angular.forEach(results, function (result) {
    			var food = result.data.tabitem;
				tabitems.push(food);
				getFood(food);
    		});

    		table = tempTable;
    		table.tabs.tabitems = tabitems;
		});
	};

	var getTabs = function () {
    	$http.get(server + '/tabs/' + tabs).success( function (data) {
    		tempTable.tabs = data.tab;
    		getTabitems(data.tab.tabitems);
    	}).error( function (error) {
    		table = tempTable;
    	});
	};

	var tableFactory = {
		getTable: function (table_id) {
		    return $http.get(server + '/tables/' + table_id).success(function (data) {
		    	table = [];
		    	tempTable = data.table;
		    	tabs = tempTable.tabs;
		    	tempTable.total = 0;

		    	getTabs();

		    	return table;
		    });
		}
	};

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