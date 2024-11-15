import jsPDF from "jspdf";
import "jspdf-autotable";

import { capitalizeFirstLetter } from "./formatText";
import {
  ITransaction,
  ITransactionTotals,
} from "../services/transaction/TransactionService";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ISearchParamsURL {
  tag?: string;
  page?: string;
  limit?: string;
  description?: string;
  "amount[gte]"?: string;
  "amount[lte]"?: string;
  transactionType?: string;
  "createdAt[gte]"?: string;
  "createdAt[lte]"?: string;
}

export const generatePDF = (
  userEmail: string,
  transactions: ITransaction[],
  listInfo: "Mês atual" | "Busca personalizada",
  totals: ITransactionTotals | null
) => {
  const doc = new jsPDF();
  const tableRows: any[] = [];
  const tableColumn = ["Descrição", "Valor", "Setor", "Data"];

  const url = window.location.search;
  const params = new URLSearchParams(url);
  const filters: ISearchParamsURL = Object.fromEntries(params.entries());

  console.log("PARAMS SIZE", params.size);
  const date = new Date();
  const currentMonth = date.toLocaleString("pt-BR", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.toLocaleString("pt-BR", {
    year: "numeric",
    timeZone: "UTC",
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
  };

  // Set page to 1 if not specified
  if (!filters.page) {
    filters.page = "1";
  }

  // Set fixed Y positions for each section to avoid unexpected spacing
  const titleY = 15;
  const transactionCountY = titleY + 10;
  const filterStartY = transactionCountY + 10;

  // Title
  doc.text("Controle Financeiro", 14, titleY);

  // Total transactions count
  const transactionCountText = `Total de transações: ${transactions.length}`;
  doc.setFontSize(10);
  doc.text(transactionCountText, 14, transactionCountY);

  // Prepare filter text and determine if filters are present
  let filterText = `Filtros aplicados:\n`;
  let hasFilters = false;

  if (listInfo === "Mês atual") {
    filterText = `Mostrando mês de ${currentMonth} de ${year}\n`;
  } else {
    if (filters.tag) {
      filterText += `Setor: ${filters.tag}\n`;
      hasFilters = true;
    }
    if (filters.description) {
      filterText += `Descrição: "${filters.description}"\n`;
      hasFilters = true;
    }
    if (filters["createdAt[gte]"] || filters["createdAt[lte]"]) {
      filterText += `Data: de: ${
        formatDate(filters["createdAt[gte]"]) || "-"
      } até: ${formatDate(filters["createdAt[lte]"]) || "-"}\n`;
      hasFilters = true;
    }
    if (filters["amount[gte]"]) {
      filterText += `Valores maiores que (R$): ${Number(
        filters["amount[gte]"]
      ).toLocaleString("pt-br", {
        minimumFractionDigits: 2,
      })}\n`;
      hasFilters = true;
    }
    if (filters["amount[lte]"]) {
      filterText += `Valores menores que (R$): ${Number(
        filters["amount[lte]"]
      ).toLocaleString("pt-br", {
        minimumFractionDigits: 2,
      })}\n`;
      hasFilters = true;
    }
    if (filters.transactionType) {
      filterText += `Tipo de Transação: ${
        filters.transactionType === "income" ? "Entradas" : "Saídas"
      }\n`;
      hasFilters = true;
    }
  }

  if (filters.limit) {
    filterText += `Limite por página: ${filters.limit}\n`;
    hasFilters = true;
  }

  if (filters.page) {
    filterText += `Página: ${filters.page}\n`;
    hasFilters = true;
  }

  // Display filters or placeholder text
  if (hasFilters) {
    doc.text(filterText, 14, filterStartY);
  } else {
    doc.text(`Mostrando mês de ${currentMonth} de ${year}`, 14, filterStartY);
  }

  // Set totals section Y position after filters/placeholder text
  const totalsStartY =
    filterStartY + (hasFilters ? (params.size + 2) * 5.5 : 10); // Fixed spacing after filters

  // Format the totals values
  const formatValue = (value: number = 0) => {
    return Number(value).toLocaleString("pt-br", { minimumFractionDigits: 2 });
  };

  const totalsText = [
    `Entradas (R$): ${formatValue(totals?.income)}`,
    `Saídas (R$): ${formatValue(totals?.outcome)}`,
    `Saldo (R$): ${formatValue(totals?.balance)}`,
  ];

  // Display totals horizontally at fixed position after filters/placeholder
  const pageWidth = doc.internal.pageSize.width;
  const totalWidth = totalsText.reduce(
    (acc, text) => acc + doc.getTextWidth(text),
    0
  );
  const spacing = (pageWidth - 28 - totalWidth) / (totalsText.length - 1); // 28 for margins

  let xOffset = 14; // Left margin
  totalsText.forEach((text) => {
    doc.text(text, xOffset, totalsStartY);
    xOffset += doc.getTextWidth(text) + spacing;
  });

  // Prepare table data
  transactions.forEach((trans) => {
    const transactionData = [
      capitalizeFirstLetter(trans.description),
      trans.amount.toLocaleString("pt-br", { minimumFractionDigits: 2 }),
      capitalizeFirstLetter(trans.tag),
      formatDate(trans.createdAt),
    ];
    tableRows.push(transactionData);
  });

  // Render the table and footer
  const tableStartY = totalsStartY + 10; // Small margin below totals
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: tableStartY,
    margin: { top: 10 },
    didDrawPage: (data: any) => {
      doc.setFontSize(8);
      const exportDate = new Date().toLocaleDateString();
      const domain = window.location.hostname;
      doc.text(
        `${domain} - Usuário: ${userEmail} - Data criação: ${exportDate}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
    headStyles: { fillColor: "#5c6bc0" },
  });

  const docName =
    filters["createdAt[gte]"] || filters["createdAt[lte]"]
      ? `finanças-${
          (formatDate(filters["createdAt[gte]"]) || "_") +
          "-" +
          (formatDate(filters["createdAt[lte]"]) || "_")
        }`
      : `finanças-${currentMonth + "_" + year}`;

  doc.save(docName);
};
