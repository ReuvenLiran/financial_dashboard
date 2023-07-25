import Chart from "chart.js/auto";
import DATA from "../investors";
import {
  LAST_DAY_OF_LAST_YEAR,
  COLORS,
  LIME,
  YELLOW,
  RED,
  ORANGE,
  API_KEY,
} from "./consts";
import {
  getProgressCharts,
  getDistributionCharts,
  getProfitPerformanceChart,
  getBarCharts,
} from "./charts";

let investors = [];

function calculateInvestmentProfit(amount, yieldPercentage, expenseRate) {
  // Convert the percentage values to decimals
  const yieldDecimal = yieldPercentage / 100;
  const expenseDecimal = expenseRate / 100;

  // Calculate the returns and expenses
  const returns = amount * yieldDecimal;
  const expenses = (returns + amount) * expenseDecimal;

  // Calculate the profit
  const profit = returns - expenses;

  return profit;
}

function getDataForChart(data, field, label, backgroundColor) {
  return {
    labels: data.map((obj) => obj.name),
    datasets: [
      {
        label,
        data: data.map((obj) => obj[field]),
        fill: true,
        borderColor: "#000",
        backgroundColor,
      },
    ],
  };
}

function findLowestAndHighestValues(arr) {
  let lowestValue = arr[0].value;
  let highestValue = arr[0].value;

  for (let i = 1; i < arr.length; i++) {
    const currentValue = arr[i].value;
    if (currentValue < lowestValue) {
      lowestValue = currentValue;
    }
    if (currentValue > highestValue) {
      highestValue = currentValue;
    }
  }

  return {
    lowest: lowestValue,
    highest: highestValue,
  };
}

function buildBarChart(chart) {
  const { key, data, field, getBackgorundColor } = chart;

  const { lowest, highest } = findLowestAndHighestValues(
    data.map((d) => d[field])
  );
  new Chart(document.getElementById(`chart-bar-${key}`), {
    type: "bar",
    data: getDataForChart(data, field, `${field} (%)`, getBackgorundColor),
    options: {
      plugins: {
        legend: {
          display: true,
        },
      },
      title: {
        text: field,
        display: true,
      },
      scales: {
        y: {
          min: lowest > 0 ? lowest : -10,
          max: highest,
          beginAtZero: false,
          ticks: { color: "white", beginAtZero: true },
        },
        x: {
          ticks: { color: "white", beginAtZero: true },
        },
      },
      barSpacing: 10,
    },
  });
}

function printLegends(investors) {
  const legendsTable = document.getElementById("legends");
  const renderCells = (name, profit, interestRate, color) => `
  <td>
  <div class="legend-color" style="background-color: ${color};"></div>
  </td>
  <td>
    ${name}
  </td>
  <td id="profit-value">
    ${parseInt(profit)} (${interestRate}%)
  </td>
`;

  investors.forEach((investor) => {
    const tr = document.createElement("tr");
    tr.innerHTML = renderCells(
      investor.name,
      investor.currentYearProfit,
      investor.interestRate,
      investor.color
    );
    legendsTable.appendChild(tr);
  });
}

function printDetails(funds, profit, interestRate, qqq, spy) {
  const fundsElem = document.getElementById("funds-value");
  const profitElem = document.getElementById("profit-value");
  const spyElem = document.getElementById("spy-value");
  const qqqElem = document.getElementById("qqq-value");

  fundsElem.textContent = funds;
  profitElem.textContent = `${profit} (${interestRate}%)`;
  spyElem.textContent = qqq + "%";
  qqqElem.textContent = spy + "%";
}

function addTextInsideDoughnut(chart, text) {
  var width = chart.width,
    height = chart.height,
    ctx = chart.ctx;

  ctx.restore();
  var fontSize = (height / 150).toFixed(2);
  ctx.font = fontSize + "em sans-serif";
  ctx.fillStyle = "white";

  ctx.textBaseline = "middle";

  const textX = Math.round((width - ctx.measureText(text).width) / 2);
  const textY = height / 2;

  ctx.fillText(text, textX, textY);
  ctx.save();
}

function buildDougthnutChart(chart) {
  const { data, field, getBackgorundColor, key, text } = chart;

  new Chart(document.getElementById(`chart-doughnut-${key}`), {
    type: "doughnut",
    data: getDataForChart(data, field, field, getBackgorundColor),
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          display: true,
        },
        legend: {
          display: false,
        },
      },
    },
    plugins: [
      {
        id: "text",
        beforeDraw: function (chart) {
          addTextInsideDoughnut(chart, text);
        },
      },
    ],
  });
}

function buildGauge(chart) {
  const { key, progressValue, goal } = chart;

  const remainingValue = Math.ceil(goal - progressValue);

  const goalText = `Goal: ${goal.toLocaleString()}`;
  document.querySelector(`#${key} .goal`).textContent = goalText;

  buildDougthnutChart({
    key,
    type: "doughnut",
    text: progressValue.toLocaleString(),
    data: [
      {
        name: "Progress",
        value: progressValue,
      },
      {
        name: "Remaining",
        value: remainingValue < 0 ? 0 : remainingValue,
      },
    ],
    field: "value",
    getBackgorundColor: (data) =>
      getColorForProgress(data.dataIndex, progressValue / goal),
  });
}

function getColorForProgress(index, progress) {
  if (index === 0) {
    if (progress <= 0.25) {
      return RED;
    } else if (progress > 0.25 && progress <= 0.5) {
      return ORANGE;
    } else if (progress > 0.5 && progress <= 0.75) {
      return YELLOW;
    } else if (progress > 0.75) {
      return LIME;
    }
  } else {
    return "transparent";
  }
}

function init(spy, qqq) {
  investors = DATA.investors || [];

  let totalProfit = 0;
  let totalMoney = 0;
  let investedMoney = 0;

  const chartsInvestors = investors.map((investor, index) => {
    const { funds, interestRate, expenseRates } = investor;
    investor.currentYearProfit = calculateInvestmentProfit(
      funds,
      interestRate,
      expenseRates
    );
    investor.color = COLORS[index];
    investor.currentYearProfitInPrecentage =
      (investor.currentYearProfit / funds) * 100;
    totalProfit += Math.ceil(investor.currentYearProfit);
    totalMoney += Math.ceil(funds);
    investedMoney += interestRate > 0 ? Math.ceil(funds) : 0;
    return investor;
  });

  const totalProfitPrecentage = (
    (totalProfit / (investedMoney - totalProfit)) *
    100
  ).toFixed(2);

  const chartsToRender = [
    ...getBarCharts({
      chartsInvestors,
    }),
    ...getDistributionCharts({
      chartsInvestors,
    }),
    ...getProgressCharts({
      totalProfit,
      totalProfitPrecentage,
      totalMoney,
      investedMoney,
      spy,
    }),
    getProfitPerformanceChart(totalProfitPrecentage, spy, qqq),
  ];

  chartsToRender.forEach((chart) => {
    if (chart.type === "bar") {
      buildBarChart(chart);
    } else if (chart.type === "doughnut") {
      buildDougthnutChart(chart);
    } else if (chart.type === "gauge") {
      buildGauge(chart);
    }
  });

  printDetails(totalMoney, totalProfit, totalProfitPrecentage, spy, qqq);

  printLegends(chartsInvestors);
}
window.onload = function () {
  imporantETF().then(([spy, qqq]) => {
    init(spy, qqq);
  });
};

function getCurrentDate() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

async function fetchSPYData(symbol) {
  const savedSymbol = localStorage.getItem(symbol);
  if (savedSymbol) {
    const { date, interest } = JSON.parse(savedSymbol);
    if (date === getCurrentDate()) {
      return Promise.resolve(interest);
    }
  }
  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    let startDatePrice;
    let endDatePrice;

    const metaData = data["Meta Data"];
    const latestRefreshedDate = metaData["3. Last Refreshed"];
    const timeSeries = data["Monthly Time Series"];

    const lastDate = timeSeries[latestRefreshedDate];
    endDatePrice = parseFloat(lastDate["4. close"]);

    const startDate = timeSeries[LAST_DAY_OF_LAST_YEAR];
    startDatePrice = parseFloat(startDate["4. close"]);
    const returnPercentage =
      ((endDatePrice - startDatePrice) / startDatePrice) * 100;
    const interest = Math.ceil(returnPercentage);

    localStorage.setItem(
      symbol,
      JSON.stringify({
        interest,
        date: getCurrentDate(),
      })
    );
    return interest;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return 0;
  }
}

async function imporantETF() {
  return Promise.all([fetchSPYData("SPY"), fetchSPYData("QQQ")]);
}
