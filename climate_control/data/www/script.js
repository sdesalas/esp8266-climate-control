
const SECOND = 1000;
const MINUTE = 60*SECOND;
const HOUR = 60*MINUTE;
const DAY = 24*HOUR;

setTimeout(async () => { await updateBanner(); updateChart(offset); }, 1);

let metrics = {};
async function updateBanner() {
  const res = await fetch('../metrics/current.json');
  if (res.ok) {
    const json = await res.json();
    if (json) {
      metrics = json;
      const el = {
        banner: document.querySelector('.banner'),
        tempIn: document.getElementById('tempIn'),
        tempOut: document.getElementById('tempOut'),
        fan: document.getElementById('fan'),
        fanEnabled: document.querySelector('.box-red'),
      };
      el.tempIn.innerText = `${Number(json.inside).toFixed(1)}°C`;
      el.tempOut.innerText = `${Number(json.outside).toFixed(1)}°C`;
      el.fan.innerText = json.fan === 1 ? 'ON' : 'OFF';
      if (!json.enabled) el.fanEnabled.classList.add('disabled');
      el.banner.classList.remove('hidden');
    }
  }
}

async function updateChart(offset) {
  offset = Number(offset) || 0;
  const res = await fetch(`../metrics/history.csv?offset=${offset}`);
  if (res.ok) {
    const csv = await res.text();
    // @see https://gionkunz.github.io/chartist-js/api-documentation.html
    // @see https://chartist.dev/api/classes/LineChart
    // @see https://codesandbox.io/p/sandbox/github/chartist-js/chartist/tree/main/sandboxes/line/timeseries
    const data = {
      series: [
        {
          name: 'Inside',
          data: [],
          showArea: true,
        }, {
          name: 'Outside',
          data: [],
        }, {
          name: 'Fan ON/OFF',
          data: [],
          lineSmooth: Chartist.Interpolation.step()
        }
      ]
    };
    const d0 = data.series[0].data;
    const d1 = data.series[1].data;
    const d2 = data.series[2].data;
    // Due to the need to minimize flash wear levelling, each CSV measurement
    // is 5 minutes apart, oldest first, with a maximum of 24hrs per file.
    // We need to take into account the remaining metrics count when viewing older files,
    // as the starting time on each chart will be offset by that much.
    // For example if the current metrics count has 6 hours worth of data,
    // The starting X axis timestamp for each day will be set back by 6 hours from current time. 
    const frequency = 5*MINUTE;
    const measurements = csv.split('\n');
    const duration = measurements.length*frequency;
    const remainder = (metrics.count||0)*frequency;
    console.log(`We have ${measurements.length} measurements over ${Math.round(duration/HOUR)} hours, with ${Math.round(remainder/HOUR)} hours on latest file`)
    const start = Date.now() - DAY*offset - remainder;
    for (let i = 0; i < measurements.length; i++) {
      const line = measurements[i];
      if (!line) continue;
      const x = new Date(start + (i*frequency));
      const points = line.split(',').map(p => Number(String(p).trim()));
      d0.push({ x, y: points[0]});
      d1.push({ x, y: points[1]});
      d2.push({ x, y: points[2]});
    }
    draw(data);
    document.querySelector('footer').innerText = `${Math.round(duration/HOUR)} hours`;
    document.getElementById('chart48h').classList.remove('hidden');
  }
}

function draw(data) {
  new Chartist.LineChart('.ct-chart', data,
    {
      // showLine: false,
      plugins: [
        Chartist.plugins.tooltip({
          transformTooltipTextFnc: (txt) => {
            // 1714157648091,23.93 => 25 Jun, 8:15pm
            items = txt.split(',');
            const d = new Date(Number(items[0]));
            items[0] = new Intl.DateTimeFormat('en-GB', {weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false}).format(d);
            items[1] = `${items[1]} °C`;
            
            return items.join(' &raquo; ');
          }
        })
      ],
      axisY: {
        low: 0,
        high: 40
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 8,
        labelInterpolationFnc: value =>
          new Date(value).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric'
          })
      }
    }
  );
}


/*
// @see https://gionkunz.github.io/chartist-js/examples.html#example-timeseries-moment
new Chartist.LineChart('.ct-chart', 
  {
    series: [
      {
        name: 'series-1',
        data: [
          { x: new Date(143134652600), y: 53 },
          { x: new Date(143234652600), y: 40 },
          { x: new Date(143340052600), y: 45 },
          { x: new Date(143568652600), y: 40 },
        ]
      },
      {
        name: 'series-2',
        data: [
          { x: new Date(143134652600), y: 53 },
          { x: new Date(143234652600), y: 35 },
          { x: new Date(143334652600), y: 30 },
          { x: new Date(143384652600), y: 30 },
          { x: new Date(143568652600), y: 10 }
        ]
      }
    ]
  },
  {
    axisX: {
      type: Chartist.FixedScaleAxis,
      divisor: 5,
      labelInterpolationFnc: value =>
        new Date(value).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric'
        })
    }
  }
);

*/