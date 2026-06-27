import fs from "node:fs";
import PDFDocument from "pdfkit";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";
import type { Idea, ModuleOutput, Report } from "@/types/domain";

type ExportPayload = {
  idea: Idea;
  report: Report;
};

export function slugifyFileName(value: string) {
  const ascii = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");
  return ascii.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "ventureproof-report";
}

function moduleOutputs(idea: Idea): ModuleOutput[] {
  return Object.values(idea.moduleOutputs).filter((output): output is ModuleOutput => Boolean(output));
}

function findPdfFont() {
  const candidates = [
    "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Verdana.ttf"
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function addPdfHeading(doc: PDFKit.PDFDocument, text: string, level: 1 | 2 | 3 = 2) {
  const size = level === 1 ? 22 : level === 2 ? 15 : 12;
  doc.moveDown(level === 1 ? 0.8 : 0.6).fontSize(size).fillColor("#15201b").text(text, { continued: false });
}

function addPdfList(doc: PDFKit.PDFDocument, items: string[]) {
  doc.fontSize(9.5).fillColor("#37463d");
  for (const item of items) {
    doc.text(`- ${item}`, { indent: 12, lineGap: 3 });
    doc.moveDown(0.2);
  }
}

export async function createReportPdf({ idea, report }: ExportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 46, info: { Title: idea.title, Author: "VentureProof AI" } });
    const chunks: Buffer[] = [];
    const font = findPdfFont();
    if (font) doc.font(font);

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(9).fillColor("#657268").text("VentureProof AI", { align: "right" });
    addPdfHeading(doc, idea.title, 1);
    doc.fontSize(11).fillColor("#37463d").text(report.executiveSummary, { lineGap: 4 });

    addPdfHeading(doc, "Skorlar", 2);
    doc.fontSize(10).fillColor("#15201b").text(`Yaşayabilirlik: ${report.scores.viability}/100`);
    doc.text(`Güven: ${report.scores.confidence}/100`);
    doc.text(`Talep: ${report.scores.demand}/100`);
    doc.text(`Uygulanabilirlik: ${report.scores.feasibility}/100`);
    doc.text(`Para kazanma: ${report.scores.monetization}/100`);
    doc.text(`Risk: ${report.scores.risk}/100`);

    addPdfHeading(doc, "Go Sinyalleri", 2);
    addPdfList(doc, report.goSignals);
    addPdfHeading(doc, "Stop Sinyalleri", 2);
    addPdfList(doc, report.stopSignals);
    addPdfHeading(doc, "Sonraki Aksiyonlar", 2);
    addPdfList(doc, report.nextActions);

    for (const section of report.sections) {
      addPdfHeading(doc, section.title, 2);
      if (section.expert) doc.fontSize(9).fillColor("#657268").text(section.expert);
      doc.fontSize(10).fillColor("#37463d").text(section.summary, { lineGap: 3 });
      addPdfList(doc, section.bullets);
    }

    const outputs = moduleOutputs(idea);
    if (outputs.length) {
      addPdfHeading(doc, "Üretilen Modül Çıktıları", 2);
      for (const output of outputs) {
        addPdfHeading(doc, output.title, 3);
        doc.fontSize(10).fillColor("#37463d").text(output.summary, { lineGap: 3 });
        addPdfList(doc, [...output.artifacts.map((artifact) => `${artifact.label}: ${artifact.value}`), ...output.bullets]);
      }
    }

    addPdfHeading(doc, "Kaynaklar ve Kanıt Etiketleri", 2);
    addPdfList(doc, report.sources.map((source) => `${source.title} (${source.kind}, güven: ${source.confidence}/100)`));
    doc.end();
  });
}

function heading(text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 | typeof HeadingLevel.HEADING_3) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 }
  });
}

function paragraph(text: string, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold })],
    spacing: { after: 100 },
    alignment: AlignmentType.LEFT
  });
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}` })],
    spacing: { after: 80 }
  });
}

export async function createReportDocx({ idea, report }: ExportPayload): Promise<Buffer> {
  const children: Paragraph[] = [
    heading(idea.title, HeadingLevel.HEADING_1),
    paragraph("VentureProof AI doğrulama raporu", true),
    paragraph(report.executiveSummary),
    heading("Skorlar", HeadingLevel.HEADING_2),
    paragraph(`Yaşayabilirlik: ${report.scores.viability}/100`),
    paragraph(`Güven: ${report.scores.confidence}/100`),
    paragraph(`Talep: ${report.scores.demand}/100`),
    paragraph(`Uygulanabilirlik: ${report.scores.feasibility}/100`),
    paragraph(`Para kazanma: ${report.scores.monetization}/100`),
    paragraph(`Risk: ${report.scores.risk}/100`),
    heading("Go Sinyalleri", HeadingLevel.HEADING_2),
    ...report.goSignals.map(bullet),
    heading("Stop Sinyalleri", HeadingLevel.HEADING_2),
    ...report.stopSignals.map(bullet),
    heading("Sonraki Aksiyonlar", HeadingLevel.HEADING_2),
    ...report.nextActions.map(bullet)
  ];

  for (const section of report.sections) {
    children.push(heading(section.title, HeadingLevel.HEADING_2));
    if (section.expert) children.push(paragraph(section.expert, true));
    children.push(paragraph(section.summary));
    children.push(...section.bullets.map(bullet));
  }

  const outputs = moduleOutputs(idea);
  if (outputs.length) {
    children.push(heading("Üretilen Modül Çıktıları", HeadingLevel.HEADING_2));
    for (const output of outputs) {
      children.push(heading(output.title, HeadingLevel.HEADING_3));
      children.push(paragraph(output.summary));
      children.push(...output.artifacts.map((artifact) => bullet(`${artifact.label}: ${artifact.value}`)));
      children.push(...output.bullets.map(bullet));
    }
  }

  children.push(heading("Kaynaklar ve Kanıt Etiketleri", HeadingLevel.HEADING_2));
  children.push(...report.sources.map((source) => bullet(`${source.title} (${source.kind}, güven: ${source.confidence}/100)`)));

  const doc = new Document({
    creator: "VentureProof AI",
    title: idea.title,
    sections: [{ properties: {}, children }]
  });

  return Packer.toBuffer(doc);
}
