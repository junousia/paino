var public_spreadsheet_key = '1v1gLW2FjISr9x1j-xnTwY1SEvwLOQoLJcocJJm2e25c';

var graph, xAxis, yAxis, axes, hoverDetail, preview, previewXAxis, legend, shelving, order, highlight;

var series_data;

var colors = ["red", "blue", "green", "purple", "cyan", "pink"]

var date_options = { weekday: 'long', year: undefined, month: 'long', day: 'numeric' };
var timeline_options = { weekday: undefined, year: undefined, month: 'numeric', day: 'numeric' };

function get_data() {
    Tabletop.init(
        {
            key: public_spreadsheet_key,
            callback: update_data,
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

function update_data(chart_data) {
    var years = [];

    chart_data.forEach(function(o) {
        Object.defineProperty(o, 'y',
                              Object.getOwnPropertyDescriptor(o, 'Paino'));
        delete o['Paino'];
        Object.defineProperty(o, 'x',
                              Object.getOwnPropertyDescriptor(o, 'Timestamp'));
        delete o['Timestamp'];
        var date = new Date(o.x);
        if ( ! years.includes(date.getFullYear())) {
            years.push(date.getFullYear())
        }
    });

    var all_series = [];

    years.forEach(function(o) {
        all_series.push(
            {
                name: o.toString(),
                data: chart_data.filter(function(x) {
                    var date = new Date(x.x);
                    var year = date.getFullYear();
                    return year == o;
                }),
                color: colors.shift()
            }
        );
    });

    all_series.forEach(function(s) {
        s['data'].forEach(function(y) {
            var date = new Date(y.x);
            date.setFullYear(1900);
            y.x = date.valueOf();
        });
    });

    console.log(all_series);

    series_data = all_series;

    draw()
}

$(window).on('load', function() {
    get_data()
});

function draw() {
    graph = new Rickshaw.Graph(
        {
            element: document.querySelector(".chart"),
            min: 'auto',
            width: 500,
            height: 300,
            renderer: 'line',
            interpolation: 'linear',
            series: series_data
        }
    );

    graph.render();


    hoverDetail = new Rickshaw.Graph.HoverDetail(
        {
            graph: graph,
            yFormatter: function(y) {
                return y + " kg"
            },
            xFormatter: function(x) {
                return new Date(x).toLocaleDateString("fi-FI", date_options);
            }
        }
    );

    axes = new Rickshaw.Graph.Axis.Time(
        {
            graph: graph
        }
    );

    yAxis = new Rickshaw.Graph.Axis.Y(
        {
            graph: graph,
            orientation: 'left',
            tickFormat: function(y) { return y + " kg" },
            element: document.querySelector('.y_axis')
        }
    );

    legend = new Rickshaw.Graph.Legend(
        {
            graph: graph,
            element: document.querySelector('.legend')
        }
    );

    shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
        graph: graph,
        legend: legend
    } );

    order = new Rickshaw.Graph.Behavior.Series.Order( {
        graph: graph,
        legend: legend
    } );

    highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
        graph: graph,
        legend: legend
    } );

    xAxis = new Rickshaw.Graph.Axis.X(
        {
            graph: graph,
            orientation: 'bottom',
            width: 500,
            element: document.querySelector('.x_axis'),
            pixelsPerTick: 50,
            timeUnit: Rickshaw.Fixtures.Time('month'),

            tickFormat: function(x) {
                return new Date(x).toLocaleDateString("fi-FI", timeline_options);
            }
        }
    );

    xAxis.render();
    yAxis.render();
    axes.render();

    var annotator = new Rickshaw.Graph.Annotate(
        {
            graph: graph,
            element: document.querySelector('.preview'),
        }
    );

    series_data[0].data.forEach(
        function(s) {
            if (s['Kommentti']) {
                annotator.add(s['x'], s['y'] + ' kg: ' + s['Kommentti']);
                annotator.update();
            }
        }
    );
}
