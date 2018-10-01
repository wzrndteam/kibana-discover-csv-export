"use strict";
    
module.exports = function (kibana) {
  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],

    uiExports: {
        navbarExtensions: ['plugins/kibana-discover-csv-export/app']
    },

    init(server, options) {
      let call = server.plugins.elasticsearch.callWithRequest;

      var convertResponseToCSV = function (req, res) {
          // If you received a total count from the client, it was the actual total count.
        let total = res.hits.total > req.payload.total ? res.hits.total : req.payload.total;

        let hits = res.hits.hits;
        let columns = [];

        let rows = [];
        for (var column in hits[0]._source) {
            columns.push(column);
        }

        // remove latest items for sliding window alg.
        let last_timestamp = '';
        if (hits.length == req.payload.size && total - req.payload.from + hits.length > 0) {
            last_timestamp = hits[hits.length-1]._source['@timestamp'];
            hits = hits.filter(function (n) { return last_timestamp != n._source['@timestamp'] });
        }

        for (var item_key in hits) {
            let item = hits[item_key];
            let row = [];
            for (var idx in columns) {
                let key = columns[idx];
                row.push(item._source[key]);
            }
            rows.push(row);
        }

        let nonAlphaNumRE = /[^a-zA-Z0-9]/;
        let allDoubleQuoteRE = /"/g;
        let separator = ',';
        let quoteValues = true;

        function escape(val) {
            var type = typeof val;
            var isObject = !!val && (type == 'object' || type == 'function');
            if (isObject) val = val.valueOf();
            val = String(val);
            if (quoteValues && nonAlphaNumRE.test(val)) {
                val = '"' + val.replace('\\', '\\\\').replace(allDoubleQuoteRE, '""') + '"';
            }
            return val;
        }

        // escape each cell in each row
        let csvRows = rows.map(function (row) {
            return row.map(escape);
        });

        if (req.payload.from == 0) {
            // add the columns to the rows
            csvRows.unshift(columns.map(function (col) {
                return escape(col);
            }));
        }

        let csv = csvRows.map(function (row) {
            return row.join(separator) + '\r\n';
        }).join('');

        return {
                total: total,
                length: rows.length,
                csv: csv,
                last_timestamp
            };
      }

      server.route({        
        path: '/api/kibana-discover-csv-export/download',
        method: 'POST',
        handler(req, reply) {
            let _req = {};
            if (typeof(req.payload.json_body) != "undefined") {
                _req = {
                    index: req.payload.index,
                    body: req.payload.json_body,
                    size: req.payload.size,
                    from: 0
                }
            }
            else {
                _req = {
                    index: req.payload.index,
                    q: req.payload.query,
                    size: req.payload.size,
                    from: 0
                }
            }
            call(req, 'search', _req).then(function (res) {
                let result = convertResponseToCSV(req, res);
                reply(result);
            });
        }
      });
    }
  });
};
