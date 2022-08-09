/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 95.98684210526316, "KoPercent": 4.0131578947368425};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1526809210526316, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.09421052631578947, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.006973684210526316, 500, 1500, "Delete"], "isController": false}, {"data": [0.08578947368421053, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "Create"], "isController": false}, {"data": [7.894736842105263E-4, 500, 1500, "Get Student"], "isController": false}, {"data": [0.0, 500, 1500, "Get Final Student "], "isController": false}, {"data": [0.03368421052631579, 500, 1500, "Put"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30400, 1220, 4.0131578947368425, 81519.89875000005, 0, 480390, 111400.0, 270346.7, 362977.6000000003, 448995.73000000004, 33.79677907801498, 53.520432173185704, 9.102923855662183], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 3800, 90, 2.3684210526315788, 83514.89999999983, 70, 448392, 95872.5, 136095.6, 167839.44999999998, 174715.02999999997, 4.332424664265591, 1.4100020365246202, 3.3544592923810894], "isController": false}, {"data": ["Delete", 3800, 81, 2.1315789473684212, 195347.51763157896, 55, 464445, 161600.5, 390440.8, 427811.85, 449651.44, 4.304485727231536, 1.4095575689567286, 1.0502726144794972], "isController": false}, {"data": ["Get Specific Student", 3800, 3, 0.07894736842105263, 82601.03289473688, 72, 459152, 111174.0, 165932.5, 168270.4, 174826.91, 4.429596230646744, 2.853918090791569, 0.7087820697667235], "isController": false}, {"data": ["Debug Sampler", 3800, 0, 0.0, 0.045789473684210595, 0, 22, 0.0, 0.0, 0.0, 1.0, 9.530569301033063, 2.7618052677400264, 0.0], "isController": false}, {"data": ["Create", 3800, 81, 2.1315789473684212, 6892.39052631579, 614, 184439, 7223.0, 10100.0, 10285.0, 10685.859999999997, 19.669653348240857, 9.233661772869855, 6.377270421499967], "isController": false}, {"data": ["Get Student", 3800, 753, 19.81578947368421, 6531.49842105263, 117, 170735, 5418.5, 10451.7, 11468.599999999999, 22766.109999999957, 12.853861739804012, 121.97988753822334, 1.9515063753462933], "isController": false}, {"data": ["Get Final Student ", 3800, 91, 2.3947368421052633, 202069.5705263157, 76, 480390, 172784.5, 384380.2, 439792.8499999998, 467481.30999999994, 4.303608235747129, 3.329356138092029, 0.7054336327691454], "isController": false}, {"data": ["Put", 3800, 121, 3.1842105263157894, 75202.2342105264, 69, 178483, 37992.5, 170390.0, 170659.9, 170824.0, 9.450079952650125, 3.297874388697953, 3.1800616757602964], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 81, 6.639344262295082, 0.26644736842105265], "isController": false}, {"data": ["503/Service Unavailable", 844, 69.18032786885246, 2.776315789473684], "isController": false}, {"data": ["405/Method Not Allowed", 162, 13.278688524590164, 0.5328947368421053], "isController": false}, {"data": ["500/Internal Server Error", 5, 0.4098360655737705, 0.01644736842105263], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 41, 3.360655737704918, 0.13486842105263158], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: bad record MAC", 6, 0.4918032786885246, 0.019736842105263157], "isController": false}, {"data": ["404/Not Found", 81, 6.639344262295082, 0.26644736842105265], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30400, 1220, "503/Service Unavailable", 844, "405/Method Not Allowed", 162, "400/Bad Request", 81, "404/Not Found", 81, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 41], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 3800, 90, "400/Bad Request", 81, "503/Service Unavailable", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 3800, 81, "405/Method Not Allowed", 81, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Specific Student", 3800, 3, "503/Service Unavailable", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 3800, 81, "503/Service Unavailable", 81, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 3800, 753, "503/Service Unavailable", 740, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 7, "Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: bad record MAC", 6, "", "", "", ""], "isController": false}, {"data": ["Get Final Student ", 3800, 91, "404/Not Found", 81, "503/Service Unavailable", 5, "500/Internal Server Error", 5, "", "", "", ""], "isController": false}, {"data": ["Put", 3800, 121, "405/Method Not Allowed", 81, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 34, "503/Service Unavailable", 6, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
