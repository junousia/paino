var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1v1gLW2FjISr9x1j-xnTwY1SEvwLOQoLJcocJJm2e25c/pubhtml';

function renderSpreadsheetData() {
    Tabletop.init( { key: public_spreadsheet_url,
                     callback: draw,
                     simpleSheet: true,
					 postProcess: function(element) {
                       // Convert string date into Date date
                       element['timestamp'] = Date.parse(element['timestamp']);
                       element['paino'] = parseFloat(element['paino']);
					   delete element['rowNumber'];
                     }
                   }
                 )
}

function draw(data, tabletop) {
  // draw chart
  drawChart(data);
}

var config = {
	color1: "red",
	color2: "red",
	color3: "red",
	color4: "red",
	color5: "red",
	filter: "Paino",
	xAxis: "Month",
	xAxisLabel: "Month",
	yAxis: [
		"asdf",
		"asdf",
		"asdf",
		"asdf",
	],
	yAxisLabel: "Paino",
	width: 600,
	title: "",
	showLegend: true,
	height: 400,

}

var innerHtml = $('#canvas-svg').html();

$('#canvas-svg').html(innerHtml);

var loadingSelectAll = true;

function drawChart(chartData, currentFilters) {
  $('#canvas-svg').html(innerHtml);

  data = chartData;

  var yAxisTypeMap = {};
  var yAxisType = "";

  var count = 0;
  chartData.forEach(function(o) {
    Object.defineProperty(o, 'y',
        Object.getOwnPropertyDescriptor(o, 'Paino'));
    delete o['Paino'];
    Object.defineProperty(o, 'x',
        Object.getOwnPropertyDescriptor(o, 'Timestamp'));
    delete o['Timestamp'];
  });

  seriesData = [
      {
		name: 'Paino',
        color: 'steelblue',
        data: chartData
      }
  ]

  var margin = {top: 20, left: 20, bottom: 20, right: 20};
  var width = config.width, height = config.height;

  var graph = new Rickshaw.Graph( {
      element: $('#canvas-svg').find('.chart-area')[0],
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
      min: "auto",
      renderer: 'line',
      series: seriesData
  } );

  graph.render();

  var hoverDetail = new Rickshaw.Graph.HoverDetail(
	{
      graph: graph,
      formatter: function(series, x, y) { return y + " kg" }
    }
  );

  var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
      graph: graph
  } );

  var axes = new Rickshaw.Graph.Axis.Time( {
      graph: graph
  } );

  function yFormat(n) {
    return n + " kg"
  }

  var yAxis = new Rickshaw.Graph.Axis.Y({
      graph: graph,
      orientation: 'left',
      tickFormat: yFormat,
      element: $('#canvas-svg').find('.y_axis')[0]
  });
  yAxis.render();

  var format = function(n) {
    if (chartData[n]) {
      var axisLabel = chartData[n][config.xAxis].toString();
      if (axisLabel && axisLabel.length < 12) {
        return axisLabel;
      } else {
        return axisLabel.substring(0, 12) + ' ...';
      }
    } else {
      return "";
    }
  }

  var xAxis = new Rickshaw.Graph.Axis.X( {
      graph: graph,
      orientation: 'bottom',
      element: $('#canvas-svg').find('.x_axis')[0],
      pixelsPerTick: 50,
	  tickFormat: function(x){
                return new Date(x).toLocaleDateString();
              }
  } );
  xAxis.render();

  axes.render();
}

renderSpreadsheetData();
