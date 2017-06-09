"use strict";
    
const module = require('ui/modules').get('kibana-discover-csv-export');

module.directive('kibanaDiscoverCsvExportButton', () => {
    return {
        restrict: 'E',
        scope: {},
        template: require('./download-button.html'),
        controllerAs: 'kibanaDiscoverCsvExportButton',
        controller: function discoverController($scope, config, courier, $route, $window, Notifier,
            AppState, timefilter, Promise, Private, kbnUrl, highlightTags) {
                $scope.download = {
                    state: 'Ready to export.',
                    progress: 0,
                    processing: true,
                    status: 0
                };

                let self = this;

                self.sort = null;
                self._saveAs = require('@spalger/filesaver').saveAs;
                self.csv = [];
                
                self.from = 0;
                self.total = -1;

                self.exportAsCsv = function (formatted) {
                    //let csv = new Blob([self.toCsv(formatted)], { type: 'text/plain' });
                    let csv = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
                    self._saveAs(csv, 'kibana-discover-csv-export.csv');
                };
                
                const max_count = 500000;
                const max_size = 10000;

                let started_at = performance.now();
                self.msToTime = function (s) {
                    // Pad to 2 or 3 digits, default is 2
                    function pad(n, z) {
                        z = z || 2;
                        return ('00' + n).slice(-z);
                    }

                    var ms = s % 1000;
                    s = (s - ms) / 1000;
                    var secs = s % 60;
                    s = (s - secs) / 60;
                    var mins = s % 60;
                    var hrs = (s - mins) / 60;

                    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
                }

                self.callApi = function () {
                    try {
                        if (!$scope.download.processing) {
                            $scope.download.state = 'Stopped process';
                            $scope.download.status = 400;
                            return false;
                        }
                        let requested_at = performance.now();
                        $.post('../api/kibana-discover-csv-export/download',
                        {
                            index: index,
                            // query: query_string
                            json_body: params,
                            from: self.from,
                            // send total count to server because server does not known actual total count.
                            total: self.total,
                            size: max_size
                        }).done(function (data) {
                            if (!$scope.download.processing || typeof self.csv == 'undefined') {
                                return false;
                            }
                            self.csv.push(data.csv);
                            if (self.total == -1 && data.total > max_count && !confirm('There is too many data.\nOnly about 500,000 data will be downloaded.')) {
                                $scope.download.processing = false;
                                $scope.download.state = 'Stopped process';
                                $scope.download.status = 400;
                                return false;
                            }
                            self.total = self.total == -1 ? data.total : self.total;
                            self.from += data.length;
                            let responsed_at = performance.now();
                            if (data.last_timestamp == "" || self.from >= max_count) {
                                $scope.download.state = 'Export completed.';
                                $scope.download.processing = false;
                                $scope.download.status = 200;
                            } else {
                                // rebuild params
                                params_body.query.filtered.filter.bool.must.map(function (n) {
                                    let is_epoch_millis = false;
                                    for (let item in n.range) {
                                        if (n.range[item].format == 'epoch_millis') {
                                            is_epoch_millis = true;
                                            n.range[item].lte = Date.parse(data.last_timestamp);
                                            break;
                                        }
                                    }
                                    return n;
                                });
                                params = angular.toJson(params_body);

                                let progress = self.from / self.total;
                                $scope.download.progress = progress * 80 + 15;
                                
                                let remain_sec = (responsed_at - started_at) / self.from * (self.total - self.from);

                                $scope.download.state = 'Retrieving data : ' + self.from + '/' + self.total + ' (' + self.msToTime(remain_sec) + ' remains)';
                                $scope.download.status = 100;
                                self.callApi();
                            }
                        }).fail(function (data) {
                            $scope.download.state = 'Retrieving data : Error: ' + data.statusText + ', ' + data.state();
                            $scope.download.processing = false;
                            $scope.download.status = 500;
                        });
                    } catch(e) {
                        $scope.download.state = 'Error: ' + e.message;
                        $scope.download.processing = false;
                        $scope.download.status = 501;
                    }
                }

                $scope.download.state = 'Getting query string.';
                $scope.download.progress = 0;
                var index = $route.current.locals.savedSearch.searchSource._state.index.id;
                //var query_string = $route.current.locals.savedSearch.searchSource._state.query.query_string.query;

                $scope.download.state = 'Getting parameters.';
                $scope.download.progress = 5;
                // copy params from savedSearch history
                var params_body = angular.copy($route.current.locals.savedSearch.searchSource.history[0].fetchParams.body);
                // aggs doesn't used.
                params_body.aggs = undefined;
                // remove $state in filter because elasticsearch cannot parse it.
                params_body.query.filtered.filter.bool.must.map(function (query) { query['$state'] = undefined; return query; })
                params_body.query.filtered.filter.bool.must_not.map(function (query) { query['$state'] = undefined; return query; })

                var params = angular.toJson(params_body);

                $scope.download.state = 'Begin request to export';
                $scope.download.progress = 10;

                $scope.$on('$destroy', function () {
                    $scope.download.processing = false;
                })

                self.callApi();
                self.interval = setInterval(function () {
                    if (!$scope.download.processing) {
                        clearInterval(self.interval);
                        
                        if ($scope.download.status == 200) {
                            $scope.download.state = 'Converting csv to blob object.';
                            self.exportAsCsv(self.csv.join(''));
                            $scope.download.state = 'Starting to download.';
                        }
                        switch ($scope.download.status) {
                            case 200:
                            case 400:                            
                                $scope.$parent.close();
                        }
                        self.csv = undefined;
                    }
                }, 100);
            }

    }
})