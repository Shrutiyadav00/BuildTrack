const PDFDocument = require('pdfkit');
const fs   = require('fs');
const path = require('path');

/**
 * Generate a Purchase Order PDF.
 * @param {Object} po        — Mongoose PO document (populated vendor + project)
 * @param {Object} builder   — { name, company, phone, address } (from req.user / User model)
 * @returns {Promise<string>} filePath of saved PDF
 */
module.exports = async function generatePO(po, builder = {}) {
  const uploadsDir = path.join(__dirname, '../../uploads/po');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `${po.poNumber}.pdf`);
  const vendor   = po.vendor || {};
  const bd       = vendor.bankDetails || {};

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a2e')
       .text('PURCHASE ORDER', 50, 50);

    doc.fontSize(10).font('Helvetica').fillColor('#555')
       .text(`PO Number: ${po.poNumber}`, 50, 80)
       .text(`Date: ${new Date(po.createdAt || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 50, 95)
       .text(`Status: ${po.status.toUpperCase()}`, 50, 110);

    // ── Builder info (right side) ────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
       .text(builder.company || builder.name || 'Builder', 350, 50, { width: 195, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#555')
       .text(builder.name    || '', 350, 68,  { width: 195, align: 'right' })
       .text(builder.phone   || '', 350, 81,  { width: 195, align: 'right' })
       .text(builder.address || '', 350, 94,  { width: 195, align: 'right' });

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.moveTo(50, 135).lineTo(545, 135).strokeColor('#ccc').stroke();

    // ── Vendor Block ─────────────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#888')
       .text('VENDOR', 50, 150);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
       .text(vendor.companyName   || '', 50, 163);
    doc.fontSize(9).font('Helvetica').fillColor('#555')
       .text(vendor.contactPerson || '', 50, 177)
       .text(vendor.email         || '', 50, 190)
       .text(vendor.phone         || '', 50, 203)
       .text(vendor.address       || '', 50, 216, { width: 230 });

    if (vendor.gstNumber) {
      doc.text(`GST: ${vendor.gstNumber}`, 50, 230);
    }

    // Bank details (only if NOT privateMode)
    if (!po.privateMode && (bd.accountNumber || bd.bankName)) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#888')
         .text('BANK DETAILS', 310, 150);
      doc.fontSize(9).font('Helvetica').fillColor('#555')
         .text(bd.accountHolderName || '', 310, 163)
         .text(bd.bankName          || '', 310, 176)
         .text(`A/C: ${bd.accountNumber || ''}`, 310, 189)
         .text(`IFSC: ${bd.ifscCode     || ''}`, 310, 202);
    }

    // ── Project info ─────────────────────────────────────────────────────────
    const projectName = po.project?.name || po.project?.toString() || '';
    doc.fontSize(9).font('Helvetica').fillColor('#555')
       .text(`Project: ${projectName}  |  Category: ${po.category || ''}`, 50, 248);

    // ── Items Table ───────────────────────────────────────────────────────────
    const tableTop = 270;
    const col = { no: 50, name: 75, qty: 280, unit: 325, rate: 375, total: 460 };

    // Table header
    doc.rect(50, tableTop, 495, 20).fillColor('#1a1a2e').fill();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
    doc.text('#',      col.no,   tableTop + 5);
    doc.text('Item',   col.name, tableTop + 5);
    doc.text('Qty',    col.qty,  tableTop + 5);
    doc.text('Unit',   col.unit, tableTop + 5);
    doc.text('Rate',   col.rate, tableTop + 5);
    doc.text('Total',  col.total,tableTop + 5);

    // Table rows
    let y = tableTop + 22;
    (po.items || []).forEach((item, i) => {
      const bg = i % 2 === 0 ? '#f8f8f8' : '#ffffff';
      doc.rect(50, y - 3, 495, 18).fillColor(bg).fill();
      doc.fontSize(9).font('Helvetica').fillColor('#333');
      doc.text(String(i + 1),           col.no,    y);
      doc.text(item.name || '',          col.name,  y, { width: 195 });
      doc.text(String(item.qty || 0),    col.qty,   y);
      doc.text(item.unit || 'nos',       col.unit,  y);
      doc.text(`₹${(item.rate||0).toLocaleString('en-IN')}`, col.rate,  y);
      doc.text(`₹${(item.total||0).toLocaleString('en-IN')}`,col.total, y);
      y += 20;
    });

    // ── Totals ────────────────────────────────────────────────────────────────
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ccc').stroke();
    y += 10;

    const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
    doc.fontSize(9).font('Helvetica').fillColor('#555')
       .text('Subtotal:',                   380, y, { width: 75, align: 'right' })
       .text(fmt(po.subtotal),              460, y, { width: 85, align: 'right' });
    y += 14;
    doc.text('Tax:',                         380, y, { width: 75, align: 'right' })
       .text(fmt(po.tax),                   460, y, { width: 85, align: 'right' });
    y += 14;

    doc.rect(370, y - 3, 175, 20).fillColor('#1a1a2e').fill();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
       .text('GRAND TOTAL:',               375, y, { width: 80, align: 'right' })
       .text(fmt(po.totalAmount),          460, y, { width: 80, align: 'right' });
    y += 30;

    // ── Notes ─────────────────────────────────────────────────────────────────
    if (po.notes) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#888')
         .text('NOTES', 50, y);
      doc.fontSize(9).font('Helvetica').fillColor('#555')
         .text(po.notes, 50, y + 13, { width: 495 });
      y += 40;
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#ccc').stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#aaa')
       .text('This is a computer-generated document. No signature required.', 50, 758, {
         align: 'center', width: 495,
       });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error',  reject);
  });
};
