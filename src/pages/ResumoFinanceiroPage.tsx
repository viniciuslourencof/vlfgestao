import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { ContasReceberServices } from "../services/contaReceberServices";
import { ContasPagarServices } from "@/services/contasPagarServices"; // supondo que existe

type MonthData = {
  month: string;
  receber: number;
  pagar: number;
};

type RegistroFinanceiro = {
  dt_inc: string;
    vr_liquido: string | number;
};


const chartConfig = {
  receber: {
    label: "Contas a Receber",
    color: "#2563eb",
  },
  pagar: {
    label: "Contas a Pagar",
    color: "#ef4444",
  },
} satisfies ChartConfig;

// Função utilitária para extrair abreviação do mês
function monthAbbr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "short" });
}

function agruparPorMes(dados: RegistroFinanceiro[]): Record<string, number> {
  return dados.reduce((acc, cur) => {
    const mes = monthAbbr(cur.dt_inc);
    const valor = typeof cur.vr_liquido === "string" ? parseFloat(cur.vr_liquido) : cur.vr_liquido;
    acc[mes] = (acc[mes] || 0) + (isNaN(valor) ? 0 : valor);
    return acc;
  }, {} as Record<string, number>);
}



export function ResumoFinanceiroPage() {
  const [chartData, setChartData] = useState<MonthData[]>([]);

  useEffect(() => {
    async function carregarDados() {
      const contasReceber = await ContasReceberServices.buscarRegistros();
      const contasPagar = await ContasPagarServices.buscarRegistros();

      // Agrupa valores por mês
      const receberPorMes = agruparPorMes(contasReceber);
      const pagarPorMes = agruparPorMes(contasPagar);

      // Unir os meses de ambos e criar array final
      const todosMeses = Array.from(
        new Set([...Object.keys(receberPorMes), ...Object.keys(pagarPorMes)])
      );

      const dados: MonthData[] = todosMeses.map((mes) => ({
        month: mes,
        receber: receberPorMes[mes] || 0,
        pagar: pagarPorMes[mes] || 0,
      }));

      // Opcional: ordenar pelo mês no ano (Jan, Feb, Mar...)
      const ordemMeses = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      dados.sort(
        (a, b) => ordemMeses.indexOf(a.month) - ordemMeses.indexOf(b.month)
      );

      setChartData(dados);
    }

    carregarDados();
  }, []);

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-[400px] mx-auto"
    >
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="receber" fill="var(--color-receber)" radius={4} />
        <Bar dataKey="pagar" fill="var(--color-pagar)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
