var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1v1gLW2FjISr9x1j-xnTwY1SEvwLOQoLJcocJJm2e25c/pubhtml';

var graph, xAxis, yAxis, axes, hoverDetail, preview, previewXAxis;

var seriesData;

function get_data() {
    Tabletop.init( { key: public_spreadsheet_url,
                     callback: updateData,
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

function updateData(chartData, tabletop) {
  chartData.forEach(function(o) {
    Object.defineProperty(o, 'y',
        Object.getOwnPropertyDescriptor(o, 'Paino'));
    delete o['Paino'];
    Object.defineProperty(o, 'x',
        Object.getOwnPropertyDescriptor(o, 'Timestamp'));
    delete o['Timestamp'];
  });

  data = [
      {
		name: 'Paino',
        color: 'steelblue',
        data: chartData
      }
  ]
  seriesData = data;
  draw()
}

$(window).on('load', function() {
	get_data()
});

function draw() {
	graph = new Rickshaw.Graph( {
	    element: document.querySelector(".chart"),
	    min: "auto",
		width: 2000,
		height: 300,
	    renderer: 'line',
		interpolation: 'linear',
	    series: seriesData
	} );

	graph.render();

	hoverDetail = new Rickshaw.Graph.HoverDetail(
	  {
	    graph: graph,
	    formatter: function(series, x, y) { return y + " kg" }
	  }
	);

	axes = new Rickshaw.Graph.Axis.Time( {
	    graph: graph,
		pixelsPerTick: 50,
	    tickFormat: function(x) { return new Date(x).toLocaleDateString("fi-FI"); }
	} );

	yAxis = new Rickshaw.Graph.Axis.Y({
	    graph: graph,
	    orientation: 'left',
	    tickFormat: function(y) { return y + " kg" },
	    element: document.querySelector('.y_axis')
	});

	xAxis = new Rickshaw.Graph.Axis.X(
	  {
	      graph: graph,
	      orientation: 'bottom',
	      element: document.querySelector('.x_axis'),
	      pixelsPerTick: 50,
	      tickFormat: function(x) { return new Date(x).toLocaleDateString("fi-FI"); }
	  }
	);

	xAxis.render();
	yAxis.render();
	axes.render();

	var annotator = new Rickshaw.Graph.Annotate({
	    graph: graph,
	    element: document.querySelector('.preview')
	});

	seriesData[0].data.forEach(function(s) {
	    if (s['Kommentti']) {
	      annotator.add(s['x'], s['y'] + ' kg: ' + s['Kommentti'])
	      annotator.update()
		  console.log(s)
	    }
	});
}
