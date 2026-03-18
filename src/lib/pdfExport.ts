import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';

interface PdfExportOptions {
  titulo: string;
  escolaNome?: string;
  periodo?: string;
  colunas: string[];
  linhas: (string | number)[][];
  chartElement?: HTMLElement | null;
}

export async function capturarGrafico(element: HTMLElement | null): Promise<string | undefined> {
  if (!element) return undefined;
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    logging: false,
    useCORS: true,
  });
  return canvas.toDataURL('image/png');
}

export async function exportarPdf({ titulo, escolaNome, periodo, colunas, linhas, chartElement }: PdfExportOptions) {
  const doc = new jsPDF();
  const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Prefeitura Municipal de Lucena — Secretaria de Educação', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let yPos = 26;

  if (escolaNome) {
    doc.text(`Escola: ${escolaNome}`, 14, yPos);
    yPos += 7;
  }

  if (periodo) {
    doc.text(`Período: ${periodo}`, 14, yPos);
    yPos += 7;
  }

  doc.text(`Gerado em: ${dataGeracao}`, 14, yPos);
  yPos += 4;

  // Line separator
  doc.setDrawColor(200);
  doc.line(14, yPos, 196, yPos);
  yPos += 6;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 14, yPos);
  yPos += 6;

  // Chart image
  if (chartElement) {
    try {
      const chartImage = await capturarGrafico(chartElement);
      if (chartImage) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 28;
        const imgHeight = imgWidth * 0.45;
        doc.addImage(chartImage, 'PNG', 14, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 6;
      }
    } catch (e) {
      console.warn('Falha ao capturar gráfico para PDF:', e);
    }
  }

  // Table
  autoTable(doc, {
    startY: yPos,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });

  const fileName = titulo.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.pdf';
  doc.save(fileName);
}
