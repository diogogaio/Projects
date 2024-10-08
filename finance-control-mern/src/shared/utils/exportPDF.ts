import jsPDF from "jspdf";
import "jspdf-autotable";

import { capitalizeFirstLetter } from "./formatText";
import { ITransaction } from "../services/transaction/TransactionService";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ISearchParamsURL {
  tag?: string;
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
  transactions: ITransaction[]
) => {
  const doc = new jsPDF();
  const tableRows: any[] = [];
  const tableColumn = ["Descrição", "Valor", "Setor", "Data"];

  const url = window.location.search; // Output: "?name=John&age=30"
  const params = new URLSearchParams(url);
  const filters: ISearchParamsURL = Object.fromEntries(params.entries());
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

  doc.text("Controle Financeiro", 14, 15);

  let filterText = `Filtros aplicados:\n`;

  // Conditionally append filters that are present in the URL
  if (!!!params.size || (params.size === 1 && filters.limit)) {
    filterText = `Mostrando mês de ${currentMonth} de ${year}\n`;
  }

  if (filters.tag) {
    filterText += `Setor: ${filters.tag}\n`;
  }

  if (filters.description) {
    filterText += `Descrição: ${filters.description}\n`;
  }

  if (filters["createdAt[gte]"] || filters["createdAt[lte]"]) {
    filterText += `Data: de: ${
      formatDate(filters["createdAt[gte]"]) || "-"
    } até: ${formatDate(filters["createdAt[lte]"]) || "-"}\n`;
  }
  if (filters["amount[gte]"]) {
    filterText += `Valores maiores que (R$): ${Number(
      filters["amount[gte]"]
    ).toLocaleString("pt-br", {
      minimumFractionDigits: 2,
    })}\n`;
  }

  if (filters["amount[lte]"]) {
    filterText += `Valores menores que (R$): ${Number(
      filters["amount[lte]"]
    ).toLocaleString("pt-br", {
      minimumFractionDigits: 2,
    })}\n`;
  }

  if (filters.transactionType) {
    filterText += `Tipo de Transação: ${
      filters.transactionType === "income" ? "Entradas" : "Saídas"
    }\n`;
  }

  doc.setFontSize(10);
  // Calculate how many lines of filter text there are to adjust the table position
  const numberOfFilterLines = filterText.split("\n").length + 1;

  // Adjust start position of the table after the filters text
  const tableStartY = 12 + numberOfFilterLines * 6;

  doc.text(`Total de transações: ${transactions.length}`, 14, 21);
  doc.text(filterText, 14, 27);

  // 4. Add export date and footer (e.g., domain) on each page
  const exportDate = new Date().toLocaleDateString();
  const domain = window.location.hostname;

  transactions.forEach((trans) => {
    const transactionData = [
      capitalizeFirstLetter(trans.description),
      trans.amount.toLocaleString("pt-br", { minimumFractionDigits: 2 }),
      capitalizeFirstLetter(trans.tag),
      formatDate(trans.createdAt),
    ];
    tableRows.push(transactionData);
  });

  // Make sure autoTable works correctly by calling it
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: tableStartY,
    didDrawPage: function (data: any) {
      // Add export date at the bottom-left of each page
      doc.setFontSize(8);
      doc.text(
        `Usuário: ${userEmail} - Data criação: ${exportDate}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );

      // Add domain at the bottom-right of each page
      doc.text(
        domain,
        data.settings.margin.left + 180,
        doc.internal.pageSize.height - 10
      );
    },
    headStyles: {
      fillColor: "#5c6bc0", // Set the background color of the table head
    },
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
