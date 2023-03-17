var createSynchronizedTimeSeriesChart = async (
  ts_chart_spec_file,
  data_file,
) => {
  let { parent_div, time_field, time_fmt_field, charts } = await fetch(
    ts_chart_spec_file,
  ).then((response) => response.json())

  //get all data from json file
  let monthly_data = await fetch(data_file).then((response) => response.json())
  let time_values = monthly_data[time_field].map((x) => Date.parse(x))
  let time_values_fmt = monthly_data[time_fmt_field]

  let ts_charts = []
  charts.forEach(function (chart, i) {
    let chart_data = monthly_data[chart.value_field].map((x) => parseFloat(x))

    chart_data = chart_data.map((val, j) => {
      return [time_values[j], val]
    })

    ts_charts[i] = Highcharts.chart(chart.chart_div, {
      chart: {
        marginLeft: 40,
        marginRight: 40,
        spacingTop: 20,
        spacingBottom: 20,
      },
      title: {
        text: chart.chart_title,
        align: 'left',
        margin: 0,
        x: 30,
      },
      xAxis: {
        type: 'datetime',
        crosshair: true,
        categories: time_values_fmt,
        labels: {
          format: '{value: %b %Y}',
        },
        crosshair: {
          width: 1,
          color: 'gray',
          dashStyle: 'shortdot',
        },
        offset: 5,
        endOnTick: false,
        startOnTick: false,
      },
      yAxis: [
        {
          title: {
            text: null,
          },
          crosshair: false,
        },
      ],
      series: [
        {
          label: { enabled: false },
          data: chart_data,
          name: chart.chart_title,
          type: 'line',
          color: chart.color_spec.color,
          zones: chart.color_spec.zones,
        },
      ],

      tooltip: {
        xDateFormat: '%b %Y',
        headerFormat: '<span style="font-size:12px">{point.key}</span><br/>',
        pointFormatter: function () {
          let pointIndex = this.index
          let point
          let result = ''
          ts_charts.forEach(function (chart) {
            point = chart.series[0].points[pointIndex]
            result +=
              '<span style="color: ' +
              point.color +
              '; fill: ' +
              point.color +
              ';">&#x2B24;</span> ' +
              point.series.name +
              ': <b>' +
              point.y +
              '</b><br/>'
          })

          return result
        },
        followPointer: true,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      exporting: {
        enabled: false,
      },
      chart: {
        animation: false,
      },
    })
  })

  // Get the data. The contents of the data file can be viewed at
  ;['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document
      .getElementById(parent_div)
      .addEventListener(eventType, function (e) {
        var chart, point, i, event

        for (i = 0; i < ts_charts.length; i++) {
          chart = ts_charts[i]
          // Find coordinates within the chart
          event = chart.pointer.normalize(e)
          // Get the hovered point
          point = chart.series[0].searchPoint(event, true)
          chart.xAxis[0].drawCrosshair(event, point) // Show the crosshair
        }
      })
  })
  document
    .getElementById(parent_div)
    .addEventListener('mouseleave', function (e) {
      var chart, i

      for (i = 0; i < ts_charts.length; i++) {
        chart = ts_charts[i]
        chart.xAxis[0].hideCrosshair() // Show the crosshair
      }
    })
}
