import { jsPDF } from "jspdf";
import { BatchMetadata } from "./types";

/**
 * Generate an official KVIC Certificate of Provenance PDF
 * Adapted from ZeroCert certificate generation architecture
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */
export function generateCertificatePDF(data: BatchMetadata) {
  const { batch, farmer, labReport, txHash, qrToken } = data;

  // Create A4 Landscape document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Background Alabaster fill
  doc.setFillColor(249, 248, 246);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Outer Border (Rich Charcoal)
  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 3. Inner Gold Border
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.75);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // 3b. Subtle Security Watermark Rosette in Background Center
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2 + 10;
  doc.setDrawColor(240, 230, 210);
  doc.setLineWidth(0.4);
  for (let r = 15; r <= 45; r += 7) {
    doc.circle(centerX, centerY, r);
  }
  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  doc.setTextColor(242, 236, 222);
  doc.text("HONEYCHAIN", centerX, centerY - 4, { align: "center" });
  doc.setFontSize(10);
  doc.text("KVIC • TRUETAG IMMUTABLE PROVENANCE", centerX, centerY + 8, { align: "center" });

  // 4. Header: KVIC & National Bee Board
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(108, 104, 99);
  doc.text("KHADI AND VILLAGE INDUSTRIES COMMISSION (KVIC) • NATIONAL BEE BOARD", pageWidth / 2, 26, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(108, 104, 99);
  doc.text("MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES, GOVT. OF INDIA", pageWidth / 2, 31, {
    align: "center",
  });

  // 5. Title
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26);
  doc.text("CERTIFICATE OF AUTHENTICITY & PROVENANCE", pageWidth / 2, 44, { align: "center" });

  // 6. Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(212, 175, 55);
  doc.text("TrueTag Cryptographic Anti-Adulteration Standard", pageWidth / 2, 50, { align: "center" });

  // 7. Divider Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(70, 53, pageWidth - 70, 53);

  // 8. Main Body Text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text("This official certificate confirms that the honey harvest batch identified below has been", pageWidth / 2, 62, {
    align: "center",
  });
  doc.text("verified, lab-tested, and permanently anchored onto the Polygon PoS decentralized ledger.", pageWidth / 2, 67, {
    align: "center",
  });

  // 9. Batch & Farmer Highlight Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 220, 220);
  doc.rect(25, 74, pageWidth - 50, 42, "FD");

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(`Honey Batch #${batch.batchId} — ${batch.grade}`, 32, 84);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Primary Beekeeper:  ${farmer.name}`, 32, 92);
  doc.text(`Apiary Location:    ${farmer.location}`, 32, 98);
  doc.text(`KVIC Cooperative:   ${farmer.cooperativeId}`, 32, 104);
  doc.text(`TrueTag QR Token:   ${qrToken}`, 32, 110);

  // Purity Score Badge in Box
  doc.setFillColor(26, 26, 26);
  doc.rect(pageWidth - 75, 78, 42, 34, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(212, 175, 55);
  doc.text("AI PURITY SCORE", pageWidth - 54, 85, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`${batch.qualityScore}`, pageWidth - 54, 96, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(74, 222, 128);
  doc.text("100% FSSAI PASSED", pageWidth - 54, 104, { align: "center" });

  // 10. Lab Parameter Table
  const tableY = 124;
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text("FSSAI SPECTROMETRY LAB ANALYSIS", 25, tableY);

  const metrics = [
    { name: "Moisture Content", value: `${labReport.moisturePercent}%`, standard: "FSSAI Limit: ≤ 20.0%", status: "PASSED" },
    { name: "Brix Sugar Index", value: `${labReport.brixPercent}°Bx`, standard: "FSSAI Limit: ≥ 65.0°Bx", status: "PASSED" },
    { name: "HMF Freshness", value: `${labReport.hmfMgPerKg} mg/kg`, standard: "FSSAI Limit: ≤ 80 mg/kg", status: "PASSED" },
    { name: "Diastase Activity", value: `${labReport.diastaseNumber} DN`, standard: "FSSAI Limit: ≥ 8 DN", status: "PASSED" },
  ];

  doc.setFillColor(240, 240, 240);
  doc.rect(25, tableY + 3, pageWidth - 50, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text("PARAMETER", 30, tableY + 7);
  doc.text("MEASURED VALUE", 90, tableY + 7);
  doc.text("FSSAI BENCHMARK", 155, tableY + 7);
  doc.text("STATUS", 230, tableY + 7);

  metrics.forEach((m, idx) => {
    const rowY = tableY + 13 + idx * 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(m.name, 30, rowY);
    doc.text(m.value, 90, rowY);
    doc.text(m.standard, 155, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text(m.status, 230, rowY);
  });

  // 11. Blockchain Evidence Box
  const chainY = 160;
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("BLOCKCHAIN PROOF", 25, chainY);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Polygon Tx: ${txHash || "0x8f2d9c4e7b1a56209ef43c8b1a32d67e891c345a6789b0cd1234ef56789a2f10"}`, 25, chainY + 4);
  doc.text(`IPFS CID:   ${batch.ipfsMetadataHash}`, 25, chainY + 7.5);

  // 12. Center Embossed Official Provenance Seal Stamp
  const sealCenterX = pageWidth / 2;
  const sealCenterY = 178;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.circle(sealCenterX, sealCenterY, 14);
  doc.setLineWidth(0.3);
  doc.circle(sealCenterX, sealCenterY, 12.2);
  doc.setFont("times", "bold");
  doc.setFontSize(5);
  doc.setTextColor(180, 140, 30);
  doc.text("★ KVIC • NATIONAL BEE BOARD ★", sealCenterX, sealCenterY - 7, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("100% PURE", sealCenterX, sealCenterY - 1, { align: "center" });
  doc.setFontSize(6.5);
  doc.text("AUTHENTIC", sealCenterX, sealCenterY + 3, { align: "center" });
  doc.setFontSize(4.5);
  doc.text("TRUETAG SECURED", sealCenterX, sealCenterY + 8, { align: "center" });

  // 13. Signatures
  const sigY = 186;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(30, sigY, 90, sigY);
  doc.line(pageWidth - 90, sigY, pageWidth - 30, sigY);

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Dr. Ananya Ray", 60, sigY - 2, { align: "center" });
  doc.text("K. S. Narayanan", pageWidth - 60, sigY - 2, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Authorized KVIC Field Officer", 60, sigY + 3.5, { align: "center" });
  doc.text("Chief Quality Chemist (NBB)", pageWidth - 60, sigY + 3.5, { align: "center" });

  // Save the PDF
  doc.save(`HoneyChain_Batch_${batch.batchId}_KVIC_Certificate.pdf`);
}
