import Chart from "chart.js/auto";
import DATA from "../investors";
import { COLORS, LIME, YELLOW, RED, ORANGE } from "./consts";

let investors = [];

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

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

function getDataForChart(investors, field, label, backgroundColor) {
  return {
    labels: investors.map((investor) => investor.name),
    datasets: [
      {
        label,
        data: investors.map((investor) => investor[field]),
        fill: true,
        borderColor: "#000",
        backgroundColor,
      },
    ],
  };
}

function buildBarChart(chart) {
  const { key, data, field, getBackgorundColor } = chart;
  new Chart(document.getElementById(`chart-bar-${key}`), {
    type: "bar",
    data: getDataForChart(investors, field, `${field} (%)`, getBackgorundColor),
    options: {
      title: {
        text: field,
        display: true,
      },
      scales: {
        y: {
          min: -20,
          max: 20,
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

function addTextInsideDoughnut(chart, text) {
  var width = chart.width,
    height = chart.height,
    ctx = chart.ctx;

  ctx.restore();
  var fontSize = (height / 150).toFixed(2);
  ctx.font = fontSize + "em sans-serif";
  // ctx.strokeStyle = "white";
  ctx.fillStyle = "white";

  ctx.textBaseline = "middle";

  const textX = Math.round((width - ctx.measureText(text).width) / 2);
  const textY = height / 2;

  ctx.fillText(text, textX, textY);
  ctx.save();
}

function buildDougthnutChart(chart) {
  const { data, field, getBackgorundColor, key } = chart;

  const total = data.reduce((acc, investor) => {
    acc += parseInt(investor[field]);
    return acc;
  }, 0);

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
          // labels: {
          //   color: 'white'
          // },
          display: false,
        },
      },
    },
    plugins: [
      {
        id: "text",
        beforeDraw: function (chart) {
          addTextInsideDoughnut(chart, total.toLocaleString());
        },
      },
    ],
  });
}

function buildGauge(chart) {
  const { key, progressValue, remainingValue } = chart;
  buildDougthnutChart({
    key,
    type: "doughnut",
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
      getColorForProgress(
        data.dataIndex,
        data.raw / (progressValue + remainingValue)
      ),
  });
}

function getColorForProgress(index, progress) {
  // console.log("SSSSS", data);
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

function getProgressCharts({
  totalProfit,
  totalProfitPrecentage,
  totalMoney,
  investedMoney,
}) {
  return [
    {
      key: "profit-progress",
      type: "gauge",
      progressValue: totalProfit,
      remainingValue: Math.ceil(DATA.profitGoal - totalProfit),
    },
    // {
    //   key: "profit-progress-in-precentage",
    //   type: "gauge",
    //   progressValue: totalProfitPrecentage,
    //   remainingValue: 10 - totalProfitPrecentage,
    // },
    {
      key: "total-money-progress",
      type: "gauge",
      progressValue: totalMoney,
      remainingValue: Math.ceil(DATA.moneyGoal - totalMoney),
    },
    {
      key: "progress-invested-money",
      type: "gauge",
      progressValue: investedMoney,
      remainingValue: Math.ceil(totalMoney - investedMoney),
    },
  ];
}

function getDistributionCharts({ chartsInvestors }) {
  const getInvestorColor = (data) => chartsInvestors[data.dataIndex].color;

  return [
    {
      key: "total-money",
      type: "doughnut",
      data: chartsInvestors,
      field: "money",
      getBackgorundColor: getInvestorColor,
    },
    {
      key: "current-year-profit",
      type: "doughnut",
      data: chartsInvestors,
      field: "currentYearProfit",
      getBackgorundColor: getInvestorColor,
    },

    {
      key: "invested-money-per-investor",
      type: "doughnut",
      field: "money",
      data: chartsInvestors.filter((i) => i.yield > 0),
      getBackgorundColor: getInvestorColor,
    },
  ];
}

function getBarCharts({ chartsInvestors }) {
  const getInvestorColor = (data) => chartsInvestors[data.dataIndex].color;

  return [
    {
      key: "yield",
      type: "bar",
      data: chartsInvestors,
      field: "yield",
      getBackgorundColor: getInvestorColor,
    },
    {
      key: "current-year-profit-in-precentage",
      type: "bar",
      data: chartsInvestors,
      field: "currentYearProfitInPrecentage",
      getBackgorundColor: getInvestorColor,
    },
  ];
}

window.onload = function () {
  investors = DATA.investors || [];

  let totalProfit = 0;
  let totalMoney = 0;
  let investedMoney = 0;

  const chartsInvestors = investors
    // .filter((investor) => investor.money > 0)
    .map((investor, index) => {
      const { money, yield: myYield, expenseRates } = investor;
      investor.currentYearProfit = calculateInvestmentProfit(
        money,
        myYield,
        expenseRates
      );
      investor.color = COLORS[index];
      investor.currentYearProfitInPrecentage =
        (investor.currentYearProfit / money) * 100;
      totalProfit += Math.ceil(investor.currentYearProfit);
      totalMoney += Math.ceil(money);
      investedMoney += myYield > 0 ? Math.ceil(money) : 0;
      return investor;
    });

  const totalProfitPrecentage = Math.ceil((totalProfit / investedMoney) * 100);

  const chartsToRender = [
    // {
    //   key: "yield",
    //   type: "bar",
    //   data: chartsInvestors,
    //   field: "yield",
    //   getBackgorundColor: getInvestorColor,
    // },
    // {
    //   key: "current-year-profit-in-precentage",
    //   type: "bar",
    //   data: chartsInvestors,
    //   field: "currentYearProfitInPrecentage",
    //   getBackgorundColor: getInvestorColor,
    // },
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
    }),
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
};
