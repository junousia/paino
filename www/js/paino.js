var public_spreadsheet_key = '1v1gLW2FjISr9x1j-xnTwY1SEvwLOQoLJcocJJm2e25c';
var form_entry = 'entry.1845009733';
var public_spreadsheet_form = 'https://docs.google.com/forms/d/e/1FAIpQLScsdt1GaiNoiX28-1mo0o65jJZ_6JvlUg1PDsZ9ZjjTYitQ8Q/formResponse';
var graph, xAxis, yAxis, axes, hoverDetail, preview, previewXAxis, legend, shelving, order, highlight;

var series_data;

var min_value = 10000.0;
var max_value = 0.0;

var palette = new Rickshaw.Color.Palette(
    {
        scheme: 'colorwheel'
    }
);

var date_options = { weekday: 'long', year: undefined, month: 'long', day: 'numeric' };
var timeline_options = { weekday: undefined, year: undefined, month: 'numeric', day: 'numeric' };

$(document).ready(function(e) {
    $("#success-alert").hide();
    $("#add-weight").submit(function(event){
        // cancels the form submission
        console.log(event)
        event.preventDefault();
        submitForm();
    });

    function submitForm(){
        // Initiate Variables With Form Content
        var weight = $("#weight").val();
        $("#weight").value = "";

        $.ajax({
            type: "POST",
            url: public_spreadsheet_form,
            data: form_entry + '=' + weight,
            dataType: 'xml',
            beforeSend: function(xhr){
                xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            },
            statusCode: {
                0: function () {
                    formSuccess();

                }
            }
        });
    }

    function formSuccess(){
        console.log("setting values")
        $("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
            $("#success-alert").alert('hide');
        });
        $(".collapse").collapse('hide')
    }
});


function get_data() {
    Tabletop.init(
        {
            key: public_spreadsheet_key,
            callback: update_data,
            simpleSheet: false,
            postProcess: function(element) {
                // Convert string date into Date date
                element['timestamp'] = Date.parse(element['timestamp']);
                element['paino'] = parseFloat(element['paino']);
                delete element['rowNumber'];
            }
        }
    )
}

function update_data(data, tabletop) {
    var years = [];

    chart_data = tabletop.sheets("Tulokset").elements


    if (tabletop.foundSheetNames.includes("Tietoja")) {
        details = tabletop.sheets("Tietoja").elements[0]

        for (var key in details) {
            var x = document.createElement("LI");
            var t = document.createTextNode(key + ": " + details[key]);
            x.classList.add('list-group-item');
            x.appendChild(t);
            document.getElementById("details").appendChild(x);
        }
    }

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

        if (o.y > max_value) {
            max_value = o.y
        }
        if (o.y < min_value) {
            min_value = o.y
        }
    });

    var all_series = [];

    years.forEach(function(o, i, a) {
        all_series.push(
            {
                name: o.toString(),
                data: chart_data.filter(function(x) {
                    var date = new Date(x.x);
                    var year = date.getFullYear();
                    return year == o;
                }),
                color: palette.color(i)
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
            min: min_value - 1,
            max: max_value + 1,
            width: document.querySelector(".container-fluid").offsetWidth - 
            document.querySelector(".y_axis").offsetWidth,
            height: 250,
            renderer: 'line',
            interpolation: 'basis',
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
            pixelsPerTick: 50,
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
}

var resize = function() {
    graph.configure({
        width: document.querySelector(".container-fluid").offsetWidth - 
        document.querySelector(".y_axis").offsetWidth,

    });
    graph.render();
}

window.addEventListener('resize', resize); 
resize();