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
  DEEP_PINK,
  TEAL1,
} from "./consts";
import {
  getProgressCharts,
  getDistributionCharts,
  getProfitPerformanceChart,
  getBarCharts,
  getHorontalBarCharts,
} from "./charts";
import { createDougnutChartDOM, createGaugeChartDOM } from "./dom";

const currentJSONversion = 2;

function getLastDayOfMonthFiveYearsAgo() {
  // Parse the input date string into a Date object
  const date = new Date();

  // Subtract 5 years from the given date
  date.setFullYear(date.getFullYear() - 5);

  // Set the day to 0 to get the last day of the previous month
  date.setDate(0);

  // Format the date as "dd.mm.yyyy"
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${year}-${month}-`;
}

const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(id);

  if (legendContainer) {
    let listContainer = legendContainer.querySelector("ul");

    if (!listContainer) {
      listContainer = document.createElement("ul");
      legendContainer.appendChild(listContainer);
    }
    return listContainer;
  }
  return null;
};

const htmlLegendPlugin = {
  id: "htmlLegend",
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID);
    if (ul) {
      // Remove old legend items
      while (ul.firstChild) {
        ul.firstChild.remove();
      }

      // Reuse the built-in legendItems generator
      const items = chart.options.plugins.legend.labels.generateLabels(chart);

      items.forEach((item) => {
        const li = document.createElement("li");
        li.style.alignItems = "center";
        li.style.cursor = "pointer";
        li.style.display = "flex";
        li.style.flexDirection = "row";
        li.style.marginLeft = "10px";

        li.onclick = () => {
          const { type } = chart.config;
          if (type === "pie" || type === "doughnut") {
            // Pie and doughnut charts only have a single dataset and visibility is per item
            chart.toggleDataVisibility(item.index);
          } else {
            chart.setDatasetVisibility(
              item.datasetIndex,
              !chart.isDatasetVisible(item.datasetIndex)
            );
          }
          chart.update();
        };

        // Color box
        const boxSpan = document.createElement("span");
        boxSpan.style.background = item.fillStyle;
        boxSpan.style.borderColor = item.strokeStyle;
        boxSpan.style.borderWidth = item.lineWidth + "px";
        boxSpan.style.display = "inline-block";
        boxSpan.style.flexShrink = 0;
        boxSpan.style.height = "20px";
        boxSpan.style.marginRight = "10px";
        boxSpan.style.width = "20px";

        // Text
        const textContainer = document.createElement("p");
        textContainer.style.color = "white"; // item.fontColor;
        textContainer.style.margin = 0;
        textContainer.style.padding = 0;
        textContainer.style.textDecoration = item.hidden ? "line-through" : "";

        const text = document.createTextNode(item.text);
        textContainer.appendChild(text);

        li.appendChild(boxSpan);
        li.appendChild(textContainer);
        ul.appendChild(li);
      });
    }
  },
};

function getCurrentYearAndMonth() {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1; // Note: January is month 0 in JavaScript

  // Adding a leading zero for single-digit months (e.g., 1 becomes 01)
  if (month < 10) {
    month = `0${month}`;
  }

  return `${year}-${month}`;
}

function saveData() {
  getData().then((history) => {
    const dateKey = getCurrentYearAndMonth();
    history[dateKey] = DATA;
    localStorage.setItem("history", JSON.stringify(history));
    alert("Saved");
  });
}

function getData() {
  const data = localStorage.getItem("history");
  const history = JSON.parse(data || "{}");
  return Promise.resolve(history);
}

let investors = [];

function calculateInvestmentProfit(amount, myReturn, expenseRate) {
  // Convert the percentage values to decimals
  const returnDecimal = myReturn / 100;
  const expenseDecimal = expenseRate / 100;

  // Calculate the returns and expenses
  const returns = amount * returnDecimal;
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
  let lowestValue = arr[0];
  let highestValue = arr[0];

  for (let i = 1; i < arr.length; i++) {
    const currentValue = arr[i];
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
    data.map((d) => Number(d[field]))
  );

  data.sort((a, b) => {
    return b[field] - a[field];
  });

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
          min: lowest >= 0 ? 0 : lowest,
          max: highest * 1.5,
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
  const renderCells = (name, profit, annualReturn, color) => `
  <td>
  <div class="legend-color" style="background-color: ${color};"></div>
  </td>
  <td>
    ${name}
  </td>
  <td id="profit-value">
    ${parseInt(profit)} (${annualReturn}%)
  </td>
`;

  investors.forEach((investor) => {
    const tr = document.createElement("tr");
    tr.innerHTML = renderCells(
      investor.name,
      investor.currentYearProfit,
      investor.annualReturn,
      investor.color
    );
    legendsTable.appendChild(tr);
  });
}

function printDetails(funds, profit, annualReturn, qqq, spy) {
  const fundsElem = document.getElementById("funds-value");
  const profitElem = document.getElementById("profit-value");
  const spyElem = document.getElementById("spy-value");
  const qqqElem = document.getElementById("qqq-value");

  fundsElem.textContent = funds;
  profitElem.textContent = `${profit} (${annualReturn}%)`;
  spyElem.textContent = qqq + "%";
  qqqElem.textContent = spy + "%";
}

function addTextInsideDoughnut(chart, text) {
  var width = chart.width,
    height = chart.height,
    ctx = chart.ctx;

  ctx.restore();
  var fontSize = (height / 210).toFixed(2);
  ctx.font = fontSize + "em sans-serif";
  ctx.fillStyle = "white";

  ctx.textBaseline = "middle";

  const textX = Math.round((width - ctx.measureText(text).width) / 2);
  const textY = height / 2;

  ctx.fillText(text, textX, textY);
  ctx.save();
}

function buildDougthnutChart(chart) {
  const { legends, data, field, getBackgorundColor, key, text, type } = chart;

  if (!legends) {
    const legendsElem = document.getElementById(`legend-container-${key}`);
    if (legendsElem) {
      legendsElem.style.display = "none";
    }
  }
  new Chart(document.getElementById(`chart-doughnut-${key}`), {
    type,
    data: getDataForChart(data, field, field, getBackgorundColor),
    options: {
      plugins: {
        htmlLegend: {
          // ID of the container to put the legend in
          containerID: `legend-container-${key}`,
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
          type === "doughnut" ? addTextInsideDoughnut(chart, text) : null;
        },
      },
      legends ? htmlLegendPlugin : false,
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
    text: Math.ceil(progressValue).toLocaleString(),
    data: [
      {
        name: "Progress",
        value: progressValue.toFixed(2),
      },
      {
        name: "Remaining",
        value: remainingValue < 0 ? 0 : remainingValue.toFixed(2),
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
  let totalFunds = 0;
  let investedFunds = 0;

  const chartsInvestors = investors.map((investor, index) => {
    const { funds, annualReturn, expenseRates } = investor;
    investor.currentYearProfit = calculateInvestmentProfit(
      funds,
      annualReturn,
      expenseRates
    );
    investor.color = COLORS[index];
    investor.annualNetReturn = (investor.currentYearProfit / funds) * 100;

    totalProfit += Math.ceil(investor.currentYearProfit);
    totalFunds += Math.ceil(funds);
    investedFunds += annualReturn > 0 ? Math.ceil(funds) : 0;
    return investor;
  });

  const totalProfitPrecentage = (
    (totalProfit / (investedFunds - totalProfit)) *
    100
  ).toFixed(2);

  addDistributionLegends(chartsInvestors);

  const chartsToRender = [
    ...getHorontalBarCharts(),
    ...getBarCharts({
      chartsInvestors: [
        ...chartsInvestors,
        {
          name: "SPY",
          last5yearsReturn: spy.fiveYearsReturn,
          color: TEAL1,
          annualNetReturn: spy.returnYTD,
        },
        {
          name: "QQQ",
          color: DEEP_PINK,
          last5yearsReturn: qqq.fiveYearsReturn,
          annualNetReturn: qqq.returnYTD,
        },
      ],
    }),
    ...getDistributionCharts({
      chartsInvestors,
    }),
    ...getProgressCharts({
      totalProfit,
      totalProfitPrecentage,
      totalFunds,
      investedFunds,
      spy: spy.returnYTD,
    }),
    getProfitPerformanceChart(
      totalProfitPrecentage,
      spy.returnYTD,
      qqq.returnYTD
    ),
  ];

  chartsToRender.forEach((chart) => {
    if (chart.type === "bar") {
      buildBarChart(chart);
    } else if (chart.type === "doughnut" || chart.type === "pie") {
      if (chart.container) {
        const container = document.querySelector(chart.container);
        container.appendChild(createDougnutChartDOM(chart.key, chart.name));
      }
      buildDougthnutChart(chart);
    } else if (chart.type === "gauge") {
      if (chart.container) {
        const container = document.querySelector(chart.container);
        container.appendChild(createGaugeChartDOM(chart.key, chart.name));
      }
      buildGauge(chart);
    }
  });

  // printDetails(totalFunds, totalProfit, totalProfitPrecentage, spy, qqq);

  // printLegends(chartsInvestors);
}
window.onload = function () {
  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", saveData);

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
  const fiveYearsAgoDate = getLastDayOfMonthFiveYearsAgo();
  const savedSymbol = localStorage.getItem(symbol);
  if (savedSymbol) {
    const { date, interest, returnYTD, fiveYearsReturn, version } =
      JSON.parse(savedSymbol);
    if (date === getCurrentDate() && currentJSONversion === version) {
      return Promise.resolve({ returnYTD, fiveYearsReturn });
    }
  }

  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    const metaData = data["Meta Data"];
    const latestRefreshedDate = metaData["3. Last Refreshed"];
    const timeSeries = data["Monthly Time Series"];

    const lastDate = timeSeries[latestRefreshedDate];
    const endDatePrice = parseFloat(lastDate["4. close"]);
    const timeSeriesDates = Object.keys(timeSeries);
    const fiveYearsDay = timeSeriesDates.find((d) =>
      d.includes(fiveYearsAgoDate)
    );

    const fiveYearsAgoDateData = timeSeries[fiveYearsDay];
    const fiveYearsAgoPrice = parseFloat(fiveYearsAgoDateData["4. close"]);

    const startDateData = timeSeries[LAST_DAY_OF_LAST_YEAR];
    const startDatePrice = parseFloat(startDateData["4. close"]);

    const returnYTD = ((endDatePrice - startDatePrice) / startDatePrice) * 100;

    const fiveYearsReturn =
      ((endDatePrice - fiveYearsAgoPrice) / fiveYearsAgoPrice) * 100;

    const returnYTDFixed = returnYTD.toFixed(2);
    const interest = returnYTDFixed;

    localStorage.setItem(
      symbol,
      JSON.stringify({
        version: 2,
        interest,
        fiveYearsReturn,
        returnYTD,
        date: getCurrentDate(),
      })
    );
    return {
      returnYTDFixed,
      interest,
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return 0;
  }
}

async function imporantETF() {
  return Promise.all([fetchSPYData("SPY"), fetchSPYData("QQQ")]);
}

function addDistributionLegends(investors) {
  const legends = document.getElementById("distribution-legends");
  investors.forEach((investor) => {
    const investorLegend = document.createElement("span");
    investorLegend.classList.add("investor-legend");
    const colorBox = document.createElement("span");
    colorBox.classList.add("legend-color-box");
    colorBox.style.width = "20px";
    colorBox.style.height = "20px";
    colorBox.style.backgroundColor = investor.color;
    investorLegend.appendChild(colorBox);

    const text = document.createElement("span");
    text.textContent = investor.name;
    investorLegend.appendChild(text);
    legends.appendChild(investorLegend);
  });
}
