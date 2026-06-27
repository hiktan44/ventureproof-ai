import fs from "node:fs";
import * as pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
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

function resolvePdfFont(candidates: string[]) {
  const font = candidates.find((candidate) => fs.existsSync(candidate));
  if (!font) throw new Error("PDF font bulunamadı.");
  return font;
}

function pdfHeading(text: string, style: "header" | "section" | "subsection" = "section"): Content {
  return { text, style, margin: [0, style === "header" ? 0 : 14, 0, 6] };
}

function pdfParagraph(text: string, bold = false): Content {
  return { text, bold, margin: [0, 0, 0, 6] };
}

function pdfList(items: string[]): Content {
  return { ul: items, margin: [0, 0, 0, 8] };
}

function pdfBuffer(documentDefinition: TDocumentDefinitions): Promise<Buffer> {
  pdfMake.setFonts({
    Roboto: {
      normal: resolvePdfFont([
        "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Verdana.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf"
      ]),
      bold: resolvePdfFont([
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Verdana Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
      ]),
      italics: resolvePdfFont([
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Oblique.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Oblique.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Oblique.ttf",
        "/System/Library/Fonts/Supplemental/Verdana Italic.ttf",
        "/System/Library/Fonts/Supplemental/Arial Italic.ttf"
      ]),
      bolditalics: resolvePdfFont([
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-BoldOblique.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-BoldOblique.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-BoldOblique.ttf",
        "/System/Library/Fonts/Supplemental/Verdana Bold Italic.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf"
      ])
    }
  });
  return pdfMake.createPdf(documentDefinition).getBuffer();
}

export async function createReportPdf({ idea, report }: ExportPayload): Promise<Buffer> {
  const content: Content[] = [
    { text: "VentureProof AI", alignment: "right", color: "#657268", fontSize: 9 },
    pdfHeading(idea.title, "header"),
    pdfParagraph(report.executiveSummary),
    pdfHeading("Skorlar"),
    {
      columns: [
        pdfList([`Yaşayabilirlik: ${report.scores.viability}/100`, `Güven: ${report.scores.confidence}/100`, `Talep: ${report.scores.demand}/100`]),
        pdfList([`Uygulanabilirlik: ${report.scores.feasibility}/100`, `Para kazanma: ${report.scores.monetization}/100`, `Risk: ${report.scores.risk}/100`])
      ]
    },
    pdfHeading("Go Sinyalleri"),
    pdfList(report.goSignals),
    pdfHeading("Stop Sinyalleri"),
    pdfList(report.stopSignals),
    pdfHeading("Sonraki Aksiyonlar"),
    pdfList(report.nextActions)
  ];

  for (const section of report.sections) {
    content.push(pdfHeading(section.title));
    if (section.expert) content.push(pdfParagraph(section.expert, true));
    content.push(pdfParagraph(section.summary), pdfList(section.bullets));
  }

  const outputs = moduleOutputs(idea);
  if (outputs.length) {
    content.push(pdfHeading("Üretilen Modül Çıktıları"));
    for (const output of outputs) {
      content.push(pdfHeading(output.title, "subsection"));
      content.push(pdfParagraph(output.summary));
      content.push(pdfList([...output.artifacts.map((artifact) => `${artifact.label}: ${artifact.value}`), ...output.bullets]));
    }
  }

  content.push(pdfHeading("Kaynaklar ve Kanıt Etiketleri"));
  content.push(pdfList(report.sources.map((source) => `${source.title} (${source.kind}, güven: ${source.confidence}/100)`)));

  return pdfBuffer({
    info: { title: idea.title, author: "VentureProof AI" },
    defaultStyle: { font: "Roboto", fontSize: 10, color: "#37463d", lineHeight: 1.18 },
    styles: {
      header: { fontSize: 22, bold: true, color: "#15201b" },
      section: { fontSize: 14, bold: true, color: "#15201b" },
      subsection: { fontSize: 11, bold: true, color: "#15201b" }
    },
    pageMargins: [46, 46, 46, 46],
    content
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
