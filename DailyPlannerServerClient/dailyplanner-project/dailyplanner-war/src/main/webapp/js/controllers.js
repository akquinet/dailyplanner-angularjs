/*global
    angular
 */

(function (angular) {
    "use strict";

    angular.module("controllers", [
        "services"
    ])

        .controller("taskListController", [
            "$scope",
            "serverTaskStorage",
            "$filter",
            "$log",

            function ($scope, storage, $filter, $log) {
                $scope.tasks = storage.getTasks();

                $scope.remainingTasks = 0;
                $scope.completedTasks = 0;

                $scope.newTaskTitle = null;
                $scope.selectedTask = null;


                // count remaining and completed tasks
                $scope.$watch("tasks", function () {
                    $scope.remainingTasks = $filter("filter")($scope.tasks, { done: false }).length;
                    $scope.completedTasks = $filter("filter")($scope.tasks, { done: true }).length;
                }, true);


                $scope.showTaskDeleteView = function () {
                    $scope.$broadcast("showTaskDeleteView");
                };

                $scope.hideTaskDeleteView = function () {
                    $scope.$broadcast("hideTaskDeleteView");
                };

                $scope.$on("editTaskFormValidStateChanged", function (event, args) {
                    if ($scope.selectedTask) {
                        $scope.selectedTask.valid = args.valid;
                    }
                });


                $scope.selectTask = function (task, taskIndex) {
                    if ($scope.selectedTask) {
                        if (!$scope.saveTask()) { return; }
                    }

                    $scope.selectedTask = angular.copy(task);
                    $scope.selectedTask.index = taskIndex;
                    $scope.selectedTask.duration = $filter("formatDuration")(task.duration);
                    $scope.selectedTask.valid = true;
                };


                $scope.addNewTask = function () {
                    var newTask;

                    if (!$scope.newTaskTitle) { return; }

                    newTask = {
                        title: $scope.newTaskTitle,
                        description: "",
                        duration: 0,
                        done: false
                    };

                    $scope.selectedTask = null;
                    $scope.newTaskTitle = null;
                    $scope.tasks.unshift(newTask);
                    storage.saveTasks($scope.tasks);
                };

                $scope.deleteTask = function (taskIndex) {
                    $scope.selectedTask = null;

                    $scope.tasks.splice(taskIndex, 1);
                    storage.saveTasks($scope.tasks);
                };

                $scope.toggleTaskStatus = function (task, event) {
                    if (event) { event.stopPropagation(); }

                    $scope.selectedTask = null;

                    task.done = !task.done;

                    $scope.tasks.sort(function (a, b) {
                        return (a.done ? 1 : 0) - (b.done ? 1 : 0);
                    });

                    storage.saveTasks($scope.tasks);
                };

                $scope.saveTask = function () {
                    var taskCouldBeSaved,
                        taskToSaveIndex,
                        duration,
                        hours,
                        minutes,
                        durationInMinutes;

                    taskCouldBeSaved = false;

                    if ($scope.selectedTask && $scope.selectedTask.valid) {
                        taskToSaveIndex = $scope.selectedTask.index;

                        // determine duration
                        if ($scope.selectedTask.duration) {
                            duration = $scope.selectedTask.duration.toString();

                            hours = duration.match(/([0-9]+)h/);
                            minutes = duration.match(/([0-9]+)m/);

                            durationInMinutes = (hours && hours[1]) ? parseInt(hours[1], 10) * 60 : 0;
                            durationInMinutes += (minutes && minutes[1]) ? parseInt(minutes[1], 10) : 0;
                        }

                        $scope.tasks[taskToSaveIndex].title = $scope.selectedTask.title;
                        $scope.tasks[taskToSaveIndex].description = $scope.selectedTask.description;
                        $scope.tasks[taskToSaveIndex].duration = durationInMinutes || 0;

                        $scope.selectedTask = null;
                        storage.saveTasks($scope.tasks);

                        taskCouldBeSaved = true;

                        $log.info("saved task: ", $scope.tasks[taskToSaveIndex]);
                    } else {
                        $log.error("task could not be saved");
                    }

                    return taskCouldBeSaved;
                };
            }
        ])

        .controller("authenticationController", [
            "$scope",
            "authentication",
            "$log",
            "$window",

            function ($scope, authentication, $log, $window) {
                $scope.authenticatedUser = authentication.getAuthenticatedUser();

                $scope.logout = function () {
                    authentication.logout(function () {
                        $log.log("Session successfully deleted");
                        $window.location.reload(true);
                    }, function () {
                        $log.error("Could not logout.");
                    });

                };
            }
        ]);
}(angular));