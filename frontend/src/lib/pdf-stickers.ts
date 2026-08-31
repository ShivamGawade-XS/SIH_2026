import { jsPDF } from "jspdf";
import { BatchMetadata } from "./types";

export type StickerFormat = "LID_SEAL_35MM" | "FRONT_LABEL_50X70MM" | "DRUM_TAG_100X150MM";

interface StickerSheetOptions {
  batch: BatchMetadata;
  format: StickerFormat;
  sheetCount: number;
  includeGuilloche?: boolean;
}

/**
 * High-Resolution Vector PDF Generator for TrueTag™ Packaging Stickers & Labels
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */
export function generateStickerSheetPDF({
  batch,
  format,
  sheetCount = 6,
  includeGuilloche = true,
}: StickerSheetOptions) {
  // A4 Document in Portrait (210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Page Header Banner (Non-printable reference info at top margin)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `KVIC TRUETAG™ STICKER SHEET — Batch #${batch.batchId} (${batch.qrToken}) — ${format} — ${sheetCount} Units`,
    10,
    8
  );
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(10, 10, pageWidth - 10, 10);

  const qrVerifyUrl = `https://honeychain-truetag.vercel.app/verify/${batch.batchId}`;

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT 1: 35mm CIRCULAR JAR LID TAMPER SEALS (Grid of up to 12 per A4)
  // ═══════════════════════════════════════════════════════════════════════════
  if (format === "LID_SEAL_35MM") {
    const cols = 3;
    const rows = 4;
    const stickerRadius = 26; // in mm
    const startX = 35;
    const startY = 42;
    const gapX = 68;
    const gapY = 62;

    const count = Math.min(sheetCount, 12);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * gapX;
      const cy = startY + row * gapY;

      // 1. Outer Circular Cut Line
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(0.8);
      doc.setFillColor(252, 250, 246);
      doc.circle(cx, cy, stickerRadius, "FD");

      // 2. Inner Gold Security Ring
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.circle(cx, cy, stickerRadius - 2.5);

      // 3. Guilloche concentric concentric rings
      if (includeGuilloche) {
        doc.setDrawColor(230, 215, 180);
        doc.setLineWidth(0.2);
        doc.circle(cx, cy, stickerRadius - 5);
        doc.circle(cx, cy, stickerRadius - 8);
        doc.circle(cx, cy, stickerRadius - 11);
      }

      // 4. Tamper Perforation Guideline (Dashed red line)
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(0.3);
      doc.line(cx - stickerRadius + 3, cy, cx + stickerRadius - 3, cy);

      // 5. Header Arch Text
      doc.setFont("times", "bold");
      doc.setFontSize(5);
      doc.setTextColor(26, 26, 26);
      doc.text("★ KVIC • NATIONAL BEE BOARD ★", cx, cy - 18, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.5);
      doc.setTextColor(180, 140, 30);
      doc.text("TRUETAG™ TAMPER-EVIDENT SEAL", cx, cy - 14, { align: "center" });

      // 6. QR Code Box
      const qrBoxSize = 18;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(0.4);
      doc.rect(cx - qrBoxSize / 2, cy - qrBoxSize / 2 - 1, qrBoxSize, qrBoxSize, "FD");

      // QR Center Symbol / Text
      doc.setFont("courier", "bold");
      doc.setFontSize(4.5);
      doc.setTextColor(26, 26, 26);
      doc.text("SCAN QR", cx, cy - 3, { align: "center" });
      doc.text(`#00${batch.batchId}`, cx, cy + 1, { align: "center" });

      // 7. Bottom Token Info
      doc.setFont("courier", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(26, 26, 26);
      doc.text(batch.qrToken, cx, cy + 15, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(4);
      doc.setTextColor(120, 120, 120);
      doc.text(`Purity: ${batch.batch.qualityScore}/100 • Scan to Verify`, cx, cy + 19, { align: "center" });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT 2: 50x70mm FRONT JAR LUXURY LABELS (Grid of up to 8 per A4)
  // ═══════════════════════════════════════════════════════════════════════════
  else if (format === "FRONT_LABEL_50X70MM") {
    const cols = 2;
    const rows = 4;
    const labelW = 85;
    const labelH = 58;
    const startX = 15;
    const startY = 18;
    const gapX = 95;
    const gapY = 66;

    const count = Math.min(sheetCount, 8);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      // 1. Label Outer Boundary
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(0.8);
      doc.setFillColor(254, 252, 247);
      doc.rect(x, y, labelW, labelH, "FD");

      // 2. Inner Gold Trim
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.rect(x + 2, y + 2, labelW - 4, labelH - 4);

      // 3. Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.5);
      doc.setTextColor(120, 120, 120);
      doc.text("GOVT. OF INDIA • MINISTRY OF MSME • KVIC", x + labelW / 2, y + 6, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("HONEYCHAIN", x + labelW / 2, y + 11.5, { align: "center" });

      doc.setFont("times", "italic");
      doc.setFontSize(5);
      doc.setTextColor(180, 140, 30);
      doc.text("100% Certified Organic Raw Forest Honey", x + labelW / 2, y + 14.5, { align: "center" });

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(x + 10, y + 16, x + labelW - 10, y + 16);

      // 4. Left QR Box
      const qrX = x + 6;
      const qrY = y + 19;
      const qrS = 22;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(0.4);
      doc.rect(qrX, qrY, qrS, qrS, "FD");

      doc.setFont("courier", "bold");
      doc.setFontSize(5);
      doc.setTextColor(26, 26, 26);
      doc.text("TRUETAG QR", qrX + qrS / 2, qrY + 8, { align: "center" });
      doc.text(`ID: #${batch.batchId}`, qrX + qrS / 2, qrY + 14, { align: "center" });

      // 5. Right Details
      const textX = x + 32;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(26, 26, 26);
      doc.text(`Grade: ${batch.batch.grade}`, textX, y + 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(70, 70, 70);
      doc.text(`Primary Beekeeper: ${batch.farmer.name}`, textX, y + 26);
      doc.text(`Origin: ${batch.farmer.location}`, textX, y + 30);
      doc.text(`Cooperative: ${batch.farmer.cooperativeId}`, textX, y + 34);
      doc.text(`FSSAI IS 4941 Standard Compliant`, textX, y + 38);

      // Purity Score Pill
      doc.setFillColor(245, 235, 205);
      doc.setDrawColor(212, 175, 55);
      doc.rect(textX + 32, y + 19, 16, 7, "FD");
      doc.setFont("times", "bold");
      doc.setFontSize(6);
      doc.setTextColor(180, 140, 30);
      doc.text(`${batch.batch.qualityScore}/100`, textX + 40, y + 24, { align: "center" });

      // 6. Bottom Blockchain Badge
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(x + 4, y + labelH - 9, x + labelW - 4, y + labelH - 9);

      doc.setFont("courier", "bold");
      doc.setFontSize(4.5);
      doc.setTextColor(26, 26, 26);
      doc.text(`Token: ${batch.qrToken}`, x + 6, y + labelH - 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(4);
      doc.setTextColor(22, 101, 52);
      doc.text("POLYGON POS VERIFIED", x + labelW - 6, y + labelH - 4.5, { align: "right" });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT 3: 100x150mm BULK DRUM LOGISTICS TAGS (2 per A4 sheet)
  // ═══════════════════════════════════════════════════════════════════════════
  else if (format === "DRUM_TAG_100X150MM") {
    const labelW = 180;
    const labelH = 120;
    const count = Math.min(sheetCount, 2);

    for (let i = 0; i < count; i++) {
      const y = 18 + i * 135;

      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(1.2);
      doc.setFillColor(20, 20, 20);
      doc.rect(15, y, labelW, labelH, "FD");

      // Inner Border
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.8);
      doc.rect(19, y + 4, labelW - 8, labelH - 8);

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(212, 175, 55);
      doc.text("KVIC • NATIONAL BEE BOARD • HEAVY LOGISTICS DRUM PASS", 25, y + 14);

      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(`HARVEST DRUM #${batch.batchId}`, 25, y + 24);

      // Left Column: Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`Registry Token:   ${batch.qrToken}`, 25, y + 38);
      doc.text(`Source Producer:  ${batch.farmer.name}`, 25, y + 46);
      doc.text(`Apiary Cluster:   ${batch.farmer.location}`, 25, y + 54);
      doc.text(`Cooperative Code: ${batch.farmer.cooperativeId}`, 25, y + 62);
      doc.text(`Purity & Grade:   ${batch.batch.qualityScore}/100 (${batch.batch.grade})`, 25, y + 70);

      // Right Column: Master QR Box
      const qrX = 130;
      const qrY = y + 30;
      const qrS = 50;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.8);
      doc.rect(qrX, qrY, qrS, qrS, "FD");

      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.setTextColor(26, 26, 26);
      doc.text("DRUM QR CODE", qrX + qrS / 2, qrY + 22, { align: "center" });
      doc.text(`#${batch.batchId}`, qrX + qrS / 2, qrY + 30, { align: "center" });

      // Footer Warning & Barcode
      doc.setFont("courier", "bold");
      doc.setFontSize(7);
      doc.setTextColor(212, 175, 55);
      doc.text("AUTHENTIC CUSTODY PASSPORT • TAMPERING IS PUNISHABLE UNDER FSSAI ACT 2006", 25, y + labelH - 12);
    }
  }

  // Save the generated A4 Sticker Sheet PDF
  doc.save(`HoneyChain_StickerSheet_Batch_${batch.batchId}_${format}.pdf`);
}
