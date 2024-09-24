import { Doughnut } from "react-chartjs-2";
import { useCallback, useMemo } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

import { useTransactionContext } from "../contexts";
import { capitalizeFirstLetter } from "../utils/formatText";

interface IDoughnutProps {
  children: React.ReactNode;
}
// Register necessary components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface IChartsProps {
  animateCharts: boolean;
  setAnimateCharts: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Charts = ({ animateCharts, setAnimateCharts }: IChartsProps) => {
  const { Transaction } = useTransactionContext();
  const totals = useMemo(() => Transaction.totals, [Transaction.totals]);

  if (!totals) {
    return;
  }

  const incomes = totals.income || 0;
  const outcomes = totals.outcome || 0;

  // Doughnuts chart data
  const balanceDoughnutData = useMemo(() => {
    return {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [incomes, outcomes],
          backgroundColor: ["#5c6bc0", "#f50057"],
          hoverBackgroundColor: ["#7986cb", "#FF6384"],
        },
      ],
    };
  }, [incomes, outcomes]);

  const incomesDoughnutData = useMemo(() => {
    const tags = Object.keys(totals.totalsByEachIncomeTags || {});
    const amounts = Object.values(totals.totalsByEachIncomeTags || {});

    return {
      labels: tags.map((tag) => capitalizeFirstLetter(tag)),
      datasets: [
        {
          data: amounts,
          backgroundColor: tags.map(
            (_, index) =>
              `hsl(${120 + ((index * 30) % 360)}, ${
                50 + ((index * 10) % 50)
              }%, ${45 + ((index * 5) % 30)}%)`
          ), // Generates distinctive greenish colors using hue 120 (green base)
        },
      ],
    };
  }, [totals]);

  const outcomesDoughnutData = useMemo(() => {
    const tags = Object.keys(totals.totalsByEachOutcomeTags || {});
    const amounts = Object.values(totals.totalsByEachOutcomeTags || {});

    return {
      labels: tags.map((tag) => capitalizeFirstLetter(tag)),
      datasets: [
        {
          data: amounts,
          backgroundColor: tags.map(
            (_, index) => `hsl(${0 + (index * 60) / tags.length}, 70%, 50%)`
          ), // Generates colors in the red/yellow/orange range (0-60 hue)
        },
      ],
    };
  }, [totals]);

  // Chart options
  const doughnutOptions = useCallback(
    (chartTitle: string) => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: animateCharts,
        animateScale: animateCharts,
        onComplete: () => {
          if (animateCharts) setTimeout(() => setAnimateCharts(false), 2000); // avoid animation on rerenders
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
        },
        title: {
          display: true,
          text: chartTitle, // Set chart title dynamically
          font: {
            size: 12,
          },
        },
      },
    }),
    [animateCharts]
  );

  const DoughnutBox = ({ children }: IDoughnutProps) => {
    return (
      <Grid
        xs={12}
        sm={6}
        md={4}
        sx={{
          maxWidth: { xs: "99%", sm: "300px", md: "100%" },
          height: "220px",
        }}
      >
        {children}
      </Grid>
    );
  };

  return (
    <Grid
      container
      sx={{
        width: "100%",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!!incomes && (
        <DoughnutBox>
          <Doughnut
            data={incomesDoughnutData}
            options={doughnutOptions("Entradas: ")}
          />
        </DoughnutBox>
      )}
      {!!outcomes && (
        <DoughnutBox>
          <Doughnut
            data={outcomesDoughnutData}
            options={doughnutOptions("Saídas: ")}
          />
        </DoughnutBox>
      )}
      {!!incomes && !!outcomes && (
        <DoughnutBox>
          <Doughnut
            data={balanceDoughnutData}
            options={doughnutOptions("Balanço: ")}
          />
        </DoughnutBox>
      )}
    </Grid>
  );
};
