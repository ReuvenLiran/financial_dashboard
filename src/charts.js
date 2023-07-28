import DATA from "../investors";
import { COLORS } from "./consts";

export function getProgressCharts({
  totalProfit,
  totalProfitPrecentage,
  totalFunds,
  investedFunds,
  spy,
}) {
  const containerSelector = "#progress-and-goals-charts";
  return [
    {
      container: containerSelector,
      name: 'Mine Return vs. SPY',
      key: "mine-annual-return-vs-goal-progress",
      type: "gauge",
      progressValue: Number(totalProfitPrecentage),
      goal: spy,
    },
    {
      container: containerSelector,
      name: 'Profit',
      key: "profit-progress",
      type: "gauge",
      progressValue: Number((totalProfitPrecentage * investedFunds) / 100),
      goal: (investedFunds * spy) / 100,
    },
    // {
    //   key: "profit-progress-in-precentage",
    //   type: "gauge",
    //   progressValue: totalProfitPrecentage,
    //   remainingValue: 10 - totalProfitPrecentage,
    // },
    {
      container: containerSelector,
      name: 'Funds',
      key: "total-funds-progress",
      type: "gauge",
      goal: DATA.fundsGoal,
      progressValue: totalFunds,
    },
    {
      container: containerSelector,
      name: 'Investments',
      key: "progress-invested-funds",
      type: "gauge",
      goal: totalFunds,
      progressValue: investedFunds,
    },
  ];
}

export function getDistributionCharts({ chartsInvestors }) {
  const getInvestorColor = (data) => chartsInvestors[data.dataIndex].color;
  const investedFunds = chartsInvestors.filter((i) => i.annualReturn > 0);
  const sumOfFunds = chartsInvestors.reduce((acc, investor) => {
    acc += parseInt(investor.funds);
    return acc;
  }, 0);

  const sumOfProfit = chartsInvestors.reduce((acc, investor) => {
    acc += parseInt(investor.currentYearProfit);
    return acc;
  }, 0);

  const sumOfInvestedFunds = investedFunds.reduce((acc, investor) => {
    acc += parseInt(investor.funds);
    return acc;
  }, 0);

  return [
    {
      legends: false,
      name: 'Funds',
      container: '#distribution-charts',
      key: "total-funds",
      type: "doughnut",
      data: chartsInvestors,
      field: "funds",
      text: sumOfFunds.toLocaleString(),
      getBackgorundColor: getInvestorColor,
    },
    {
      legends: false,
      container: '#distribution-charts',
      name: 'Profit',
      key: "current-year-profit",
      type: "doughnut",
      data: chartsInvestors,
      text: sumOfProfit.toLocaleString(),
      field: "currentYearProfit",
      getBackgorundColor: getInvestorColor,
    },
    {
      legends: false,
      name: 'Investments',
      container: '#distribution-charts',
      key: "invested-funds-per-investor",
      type: "doughnut",
      field: "funds",
      text: sumOfInvestedFunds.toLocaleString(),
      data: investedFunds,
      getBackgorundColor: (data) => {
        return investedFunds[data.dataIndex].color;
      },
    },
  ];
}

export function getProfitPerformanceChart(annualReturn, spy, qqq) {
  return {
    key: "my-annual-return-vs-qqq-vs-spy",
    type: "bar",
    data: [
      {
        name: "me",
        value: annualReturn,
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
      key: "current-year-net-return",
      type: "bar",
      data: chartsInvestors,
      field: "annualNetReturn",
      getBackgorundColor: getInvestorColor,
    },
  //   {
  //     key: "current-year-profit-in-precentage",
  //     type: "bar",
  //     data: chartsInvestors,
  //     field: "currentYearProfitInPrecentage",
  //     getBackgorundColor: getInvestorColor,
  //   },
  ];
}

export function getHorontalBarCharts() {
  const ETFS = [
    {
      name: "SPY",
      percentage: 65,
      color: 'red',
    },
    {
      name: "QQQ",
      percentage: 20,
      color: COLORS[1],
    },
    {
      name: "EUROPE",
      percentage: 15,
      color: COLORS[2],
    },
  ];

  const getInvestorColor = (data) => ETFS[data.dataIndex].color;

  return [
    {
      legends: true,
      key: "plan",
      type: "pie",
      data: ETFS,
      field: "percentage",
      getBackgorundColor: getInvestorColor,
    },
  ];
}
