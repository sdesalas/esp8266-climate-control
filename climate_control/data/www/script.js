
const SECOND = 1000;
const MINUTE = 60*SECOND;
const HOUR = 60*MINUTE;

setTimeout(async () => { await updateBanner(); updateChart(); }, 1);

async function updateBanner() {
  const res = await fetch('../metrics/current.json');
  if (res.ok) {
    const json = await res.json();
    if (json) {
      const el = {
        banner: document.querySelector('.banner'),
        tempIn: document.getElementById('tempIn'),
        tempOut: document.getElementById('tempOut'),
        fan: document.getElementById('fan'),
        fanEnabled: document.querySelector('.box-red'),
      };
      el.tempIn.innerText = `${json.inside}°C`;
      el.tempOut.innerText = `${json.outside}°C`;
      el.fan.innerText = json.onoff === 1 ? 'ON' : 'OFF';
      if (!json.enabled) el.fanEnabled.classList.add('disabled');
      el.banner.classList.remove('hidden');
    }
  }
}

async function updateChart() {
  const res = await fetch('../metrics/history.csv');
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
    // Each measurement is 5 minutes apart, oldest first.
    // So we can calculate X axis timestamps.
    const measurements = csv.split('\n');
    console.log(`We have ${measurements.length} measurements`)
    const interval = 5 * MINUTE;
    const range = (measurements.length * interval);
    const start = Date.now() - range;
    for (let i = 0; i < measurements.length; i++) {
      const line = measurements[i];
      if (!line || i > 48*HOUR/interval) continue; 
      const x = new Date(start + (i*interval));
      const points = line.split(',').map(p => Number(String(p).trim()));
      d0.push({ x, y: points[0]});
      d1.push({ x, y: points[1]});
      d2.push({ x, y: points[2]});
    }
    draw(data);
    document.querySelector('footer').innerText = `Previous ${Math.round(range/HOUR)} hours`;
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