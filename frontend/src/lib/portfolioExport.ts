import { jsPDF } from 'jspdf';

interface PortfolioData {
  studentName: string;
  email: string;
  level: number;
  xpTotal: number;
  badges: { name: string; description: string; date: string }[];
  grades: { subject: string; average: number }[];
  achievements: { title: string; date: string; description: string }[];
}

export async function exportPortfolioPDF(data: PortfolioData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Numérique', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Don Bosco Connect', margin, 35);

  y = 55;

  // Student Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de l\'élève', margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.studentName}`, margin, y);
  y += 7;
  doc.text(`Email: ${data.email}`, margin, y);
  y += 15;

  // Level & XP
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Niveau ${data.level}`, margin + 10, y + 12);
  
  doc.text(`${data.xpTotal.toLocaleString()} XP`, margin + 60, y + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Niveau actuel', margin + 10, y + 22);
  doc.text('Points d\'expérience', margin + 60, y + 22);
  
  y += 40;

  // Badges Section
  if (data.badges.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Badges Obténus', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.badges.forEach((badge) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 15, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`🏆 ${badge.name}`, margin + 5, y + 10);
      y += 18;
    });
    y += 10;
  }

  // Grades Section
  if (data.grades.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance par Matière', margin, y);
    y += 10;

    // Table header
    doc.setFillColor(99, 102, 241);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Matière', margin + 5, y + 5.5);
    doc.text('Moyenne', pageWidth - margin - 25, y + 5.5);
    y += 10;

    // Table rows
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    data.grades.forEach((grade, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
      }
      doc.text(grade.subject, margin + 5, y + 5.5);
      doc.text(`${grade.average}/20`, pageWidth - margin - 25, y + 5.5);
      y += 8;
    });
    y += 15;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')} par Don Bosco Connect`,
    margin,
    footerY
  );
  doc.text(
    'Vérification: https://donbosco.tn/verify',
    pageWidth - margin - 50,
    footerY
  );

  return doc.output('blob');
}