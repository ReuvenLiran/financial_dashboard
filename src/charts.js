import DATA from "../investors";
import { COLORS } from "./consts";

export function getProgressCharts({
  totalProfit,
  totalProfitPrecentage,
  totalMoney,
  investedMoney,
  spy,
}) {
  return [
    {
      key: "mine-interest-rate-vs-goal-progress",
      type: "gauge",
      progressValue: totalProfitPrecentage,
      goal: spy,
    },
    {
      key: "profit-progress",
      type: "gauge",
      progressValue: totalProfit,
      goal: DATA.profitGoal,
    },
    // {
    //   key: "profit-progress-in-precentage",
    //   type: "gauge",
    //   progressValue: totalProfitPrecentage,
    //   remainingValue: 10 - totalProfitPrecentage,
    // },
    {
      key: "total-funds-progress",
      type: "gauge",
      goal: DATA.moneyGoal,
      progressValue: totalMoney,
    },
    {
      key: "progress-invested-funds",
      type: "gauge",
      goal: totalMoney,
      progressValue: investedMoney,
    },
  ];
}

export function getDistributionCharts({ chartsInvestors }) {
  const getInvestorColor = (data) => chartsInvestors[data.dataIndex].color;
  const investedMoney = chartsInvestors.filter((i) => i.interestRate > 0);
  const sumOfFunds = chartsInvestors.reduce((acc, investor) => {
    acc += parseInt(investor.funds);
    return acc;
  }, 0);

  const sumOfProfit = chartsInvestors.reduce((acc, investor) => {
    acc += parseInt(investor.currentYearProfit);
    return acc;
  }, 0);

  const sumOfInvestedFunds = investedMoney.reduce((acc, investor) => {
    acc += parseInt(investor.funds);
    return acc;
  }, 0);

  return [
    {
      key: "total-funds",
      type: "doughnut",
      data: chartsInvestors,
      field: "funds",
      text: sumOfFunds.toLocaleString(),
      getBackgorundColor: getInvestorColor,
    },
    {
      key: "current-year-profit",
      type: "doughnut",
      data: chartsInvestors,
      text: sumOfProfit.toLocaleString(),
      field: "currentYearProfit",
      getBackgorundColor: getInvestorColor,
    },
    {
      key: "invested-funds-per-investor",
      type: "doughnut",
      field: "funds",
      text: sumOfInvestedFunds.toLocaleString(),
      data: investedMoney,
      getBackgorundColor: (data) => {
        return investedMoney[data.dataIndex].color;
      },
    },
  ];
}

export function getProfitPerformanceChart(interestRate, spy, qqq) {
  return {
    key: "mine-interest-rate-vs-qqq-vs-spy",
    type: "bar",
    data: [
      {
        name: "me",
        value: interestRate,
      },
      {
        name: "SPY",
        value: spy,
      },
      {
        name: "QQQ",
        value: qqq,
      },
    ],
    field: "value",
    getBackgorundColor: (data) => {
      return COLORS[data.dataIndex];
    },
  };
}

export function getBarCharts({ chartsInvestors }) {
  const getInvestorColor = (data) => chartsInvestors[data.dataIndex].color;

  return [
    {
      key: "interest-rate",
      type: "bar",
      data: chartsInvestors,
      field: "interestRate",
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
