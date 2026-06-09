import React, { useEffect, useState } from 'react';
import {
  FileText, Download, Plus, Trash2, RefreshCw,
  Scale, ClipboardList, IndianRupee, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const CAT_LABELS = {
  structure: 'Structure & Civil Works',
  labour:    'Labour Charges',
  mep:       'MEP (Electrical, Plumbing, HVAC)',
  finishing: 'Finishing & Interior Works',
  misc:      'Miscellaneous & Overhead',
};
const UNITS  = ['ls', 'sft', 'rft', 'sqm', 'cum', 'nos', 'kg', 'bags', 'tons', 'rmt'];
const DEFECT = ['Six (6) Months', 'One (1) Year', 'Two (2) Years'];

const uid     = () => 'id_' + Math.random().toString(36).slice(2, 9);
const fmt     = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const numFmt  = (n) => n ? `₹${(+n).toLocaleString('en-IN')}` : '—';
const fmtDate = (d) => {
  if (!d) return '_______________';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function milestonesFromPhases(phases) {
  if (!phases?.length) {
    return [
      { id: uid(), name: 'Advance Payment',       pct: 15, due: '' },
      { id: uid(), name: 'Foundation Complete',    pct: 20, due: '' },
      { id: uid(), name: 'Ground Floor Slab',      pct: 20, due: '' },
      { id: uid(), name: 'First Floor Slab',       pct: 20, due: '' },
      { id: uid(), name: 'Brickwork Complete',     pct: 10, due: '' },
      { id: uid(), name: 'Plastering Complete',    pct:  5, due: '' },
      { id: uid(), name: 'Finishing & Handover',   pct: 10, due: '' },
    ];
  }
  const each = Math.floor(100 / phases.length);
  const rem  = 100 - each * phases.length;
  return phases.map((p, i) => ({
    id:  uid(),
    name: p.name,
    pct:  i === phases.length - 1 ? each + rem : each,
    due:  p.plannedEnd ? p.plannedEnd.slice(0, 10) : '',
  }));
}

function itemsFromBudget(budget) {
  const map = {
    structure: [
      { d: 'Site clearance, excavation & earthwork',              u: 'ls',  q: 1 },
      { d: 'Concrete works (footings, columns, beams, slabs)',    u: 'ls',  q: 1 },
      { d: 'Reinforcement steel (TMT bars, mesh)',                u: 'ls',  q: 1 },
      { d: 'Brick masonry / block work',                         u: 'ls',  q: 1 },
    ],
    labour: [
      { d: 'Mason & helper charges',                             u: 'ls',  q: 1 },
      { d: 'Carpenter & shuttering work',                        u: 'ls',  q: 1 },
      { d: 'Steel fixer charges',                                u: 'ls',  q: 1 },
    ],
    mep: [
      { d: 'Internal electrical wiring & fixtures',              u: 'ls',  q: 1 },
      { d: 'Plumbing, sanitary & water supply works',            u: 'ls',  q: 1 },
    ],
    finishing: [
      { d: 'Plastering — internal & external',                   u: 'sft', q: 1 },
      { d: 'Flooring — vitrified tiles / marble / granite',      u: 'sft', q: 1 },
      { d: 'Paint & polish (interior & exterior)',               u: 'ls',  q: 1 },
      { d: 'Doors, windows, hardware & glazing',                 u: 'ls',  q: 1 },
    ],
    misc: [
      { d: 'Contingency & site overhead charges',                u: 'ls',  q: 1 },
    ],
  };
  const items = [];
  Object.entries(map).forEach(([cat, rows]) => {
    const catBudget = budget?.[cat] || 0;
    if (catBudget > 0) {
      const share = Math.round(catBudget / rows.length);
      rows.forEach(r => items.push({ id: uid(), category: cat, description: r.d, qty: r.q, unit: r.u, rate: share }));
    }
  });
  if (!items.length) return [
    { id: uid(), category: 'structure', description: 'Civil & structural works',   qty: 1, unit: 'ls', rate: 0 },
    { id: uid(), category: 'mep',       description: 'MEP works',                  qty: 1, unit: 'ls', rate: 0 },
    { id: uid(), category: 'finishing', description: 'Finishing & interior works', qty: 1, unit: 'ls', rate: 0 },
  ];
  return items;
}

// ─── Shared document CSS + logo ───────────────────────────────────────────────
const LOGO_SVG = (company) => `
  <div style="display:flex;align-items:center;gap:10px">
    <div style="width:44px;height:44px;background:#1a3a5c;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <span style="color:#fff;font-weight:900;font-size:16px;font-family:Arial,sans-serif;letter-spacing:-0.5px">BT</span>
    </div>
    <div>
      <div style="font-size:20px;font-weight:900;color:#1a3a5c;letter-spacing:0.5px">${company}</div>
      <div style="font-size:11px;color:#666;margin-top:1px">Construction Contractor &amp; Builder</div>
    </div>
  </div>`;

// ─── Agreement HTML ───────────────────────────────────────────────────────────
function buildAgreementHTML({ builder, project, agDate, agPlace, defectPeriod, arbitVenue, scope, extraClauses, milestones }) {
  const cv = project?.contractValue || project?.budget?.total || 0;
  const cn = project?.client?.name || 'The Owner';
  const cp = project?.client?.phone || '';
  const ce = project?.client?.email || '';
  const pa = project?.address || '';

  const mRows = milestones.map((m, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;${i % 2 === 0 ? 'background:#fafafa' : ''}">
      <td style="padding:9px 12px;color:#6b7280;font-size:12px">${i + 1}</td>
      <td style="padding:9px 12px;font-weight:600;font-size:13px">${m.name}</td>
      <td style="padding:9px 12px;text-align:center;font-weight:600;color:#1a3a5c">${m.pct}%</td>
      <td style="padding:9px 12px;text-align:right;font-weight:700;font-size:13px">₹${Math.round(cv * m.pct / 100).toLocaleString('en-IN')}</td>
      <td style="padding:9px 12px;color:#6b7280;font-size:12px">${m.due ? fmtDate(m.due) : 'On milestone completion'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Construction Agreement — ${project?.name || 'Project'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',Times,serif;font-size:13px;line-height:1.8;color:#111827;background:#fff;max-width:800px;margin:0 auto;padding:48px 56px}
@media print{body{padding:20px 28px;max-width:100%}}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1a3a5c;margin-bottom:24px}
.hdr-right{text-align:right;font-size:11px;color:#6b7280;line-height:1.8}
.doc-title-wrap{text-align:center;margin:20px 0}
.doc-title{display:inline-block;font-size:22px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#1a3a5c;border-bottom:2px solid #1a3a5c;padding-bottom:6px}
.doc-ref{font-size:11px;color:#9ca3af;margin-top:6px;letter-spacing:1px}
.party-box{background:#f8faff;border:1px solid #dbe8ff;border-left:4px solid #1a3a5c;padding:14px 18px;margin:16px 0;line-height:2}
.party-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#1a3a5c;display:block;margin-bottom:2px}
.proj-box{background:#f8faff;border:1px solid #dbe8ff;border-radius:6px;padding:14px 18px;margin:14px 0}
.proj-box-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#1a3a5c;margin-bottom:8px}
.proj-row{display:flex;font-size:12.5px;padding:3px 0}
.proj-row .lbl{width:150px;color:#6b7280}
.proj-row .val{font-weight:700;color:#111827}
.sec-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a3a5c;margin:22px 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
.clause{display:flex;gap:12px;margin:9px 0;font-size:12.5px;line-height:1.8}
.clause-n{font-weight:700;min-width:24px;color:#111827}
.amount-big{font-size:15px;font-weight:800;color:#1a3a5c}
table{width:100%;border-collapse:collapse;font-size:12.5px;margin:10px 0}
.tbl-hdr th{background:#1a3a5c;color:#fff;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
.tbl-hdr th.r{text-align:right}
.tbl-foot td{background:#f0f4ff;font-weight:700;border-top:2px solid #1a3a5c;padding:10px 12px;font-size:13px}
.tbl-foot td.r{text-align:right}
.sig-section{display:flex;justify-content:space-between;gap:40px;margin-top:50px}
.sig-block{flex:1}
.sig-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#6b7280;margin-bottom:6px}
.sig-line{border-top:1px solid #111827;margin-top:44px;padding-top:6px;font-size:12px;color:#374151}
.witness-row{display:flex;gap:40px;margin-top:24px;padding-top:20px;border-top:1px dashed #d1d5db}
.footer{margin-top:36px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px}
</style></head><body>

<div class="hdr">
  ${LOGO_SVG(builder.company || builder.name)}
  <div class="hdr-right">
    ${builder.phone ? `<div>${builder.phone}</div>` : ''}
    ${builder.email ? `<div>${builder.email}</div>` : ''}
    <div style="margin-top:4px;color:#1a3a5c;font-weight:700">Date: ${fmtDate(agDate)}</div>
  </div>
</div>

<div class="doc-title-wrap">
  <div class="doc-title">Construction Agreement</div>
  <div class="doc-ref">Ref: ${(project?.name || 'PROJ').replace(/[^A-Z0-9]/gi,'-').toUpperCase()}-AGR-${new Date().getFullYear()}</div>
</div>

<p style="margin:16px 0;font-size:12.5px">
  <strong>THIS AGREEMENT</strong> is made on <strong>${fmtDate(agDate)}</strong>
  at <strong>${agPlace || pa || '_______________'}</strong>,
</p>

<div class="party-box">
  <span class="party-label">Party of the First Part (Contractor / Builder)</span>
  ${builder.company || builder.name}, having its principal place of business at ${builder.address || '_______________'},
  Contact: ${builder.phone || '_______________'}, hereinafter referred to as <strong>"THE CONTRACTOR"</strong>.
  <div style="margin-top:10px">
    <span class="party-label">Party of the Second Part (Owner)</span>
    ${cn}${cp ? ', Contact: ' + cp : ''}${ce ? ', Email: ' + ce : ''},
    hereinafter referred to as <strong>"THE OWNER"</strong>.
  </div>
</div>

<div class="proj-box">
  <div class="proj-box-title">Project Details</div>
  <div class="proj-row"><span class="lbl">Project Name</span><span class="val">${project?.name || '—'}</span></div>
  <div class="proj-row"><span class="lbl">Site Address</span><span class="val">${pa || '—'}</span></div>
  <div class="proj-row"><span class="lbl">Contract Value</span><span class="val" style="font-size:15px;color:#1a3a5c">₹${cv.toLocaleString('en-IN')}</span></div>
  <div class="proj-row"><span class="lbl">Commencement</span><span class="val">${fmtDate(project?.startDate)}</span></div>
  <div class="proj-row"><span class="lbl">Completion</span><span class="val">${fmtDate(project?.endDate)}</span></div>
</div>

<p style="margin:14px 0;font-size:12.5px"><strong>WHEREAS</strong> the Owner desires to have constructed the above-mentioned work and the Contractor has agreed to execute the same on the terms and conditions herein below.</p>
<p style="font-size:12.5px"><strong>NOW THEREFORE</strong>, in consideration of the mutual covenants herein, the parties agree as follows:</p>

<div class="sec-title">Terms &amp; Conditions</div>

<div class="clause"><div class="clause-n">1.</div><div><strong>Scope of Work:</strong> The Contractor shall carry out and complete the construction of ${scope || project?.name + ' as per approved drawings and specifications'} in a good and workmanlike manner in accordance with all contract documents.</div></div>
<div class="clause"><div class="clause-n">2.</div><div><strong>Contract Amount:</strong> The Owner shall pay the Contractor a total sum of <span class="amount-big">₹${cv.toLocaleString('en-IN')}</span> <em style="color:#6b7280;font-size:12px">(Rupees ${cv.toLocaleString('en-IN')} only)</em> for complete execution of the work as per Annexure-A.</div></div>
<div class="clause"><div class="clause-n">3.</div><div><strong>Commencement &amp; Completion:</strong> Work shall commence on <strong>${fmtDate(project?.startDate)}</strong> and shall be completed by <strong>${fmtDate(project?.endDate)}</strong>. Time is of the essence.</div></div>
<div class="clause"><div class="clause-n">4.</div><div><strong>Payment Schedule:</strong> Payments shall be made as per Annexure-A. Each instalment shall be released within 7 working days of the Contractor raising a payment request upon completion of the respective milestone.</div></div>
<div class="clause"><div class="clause-n">5.</div><div><strong>Materials:</strong> All materials shall conform to IS/BIS standards and shall be of approved quality. Samples shall be provided for approval prior to use. Approved brands shall be used unless mutually agreed in writing.</div></div>
<div class="clause"><div class="clause-n">6.</div><div><strong>Labour &amp; Supervision:</strong> The Contractor shall employ sufficient, competent and skilled workmen. All supervision, tools, plant and equipment necessary for proper execution shall be provided by the Contractor.</div></div>
<div class="clause"><div class="clause-n">7.</div><div><strong>Variations:</strong> Any variations shall be executed only after written approval from both parties. Cost of variations shall be mutually agreed before execution. Minor variations up to 5% of contract value may be included in the final settlement.</div></div>
<div class="clause"><div class="clause-n">8.</div><div><strong>Defect Liability Period:</strong> The Contractor shall rectify defects arising from defective workmanship or materials for <strong>${defectPeriod || 'One (1) Year'}</strong> from the date of handing over, at no cost to the Owner. A retention of 5% of the contract value shall be released upon expiry of this period.</div></div>
<div class="clause"><div class="clause-n">9.</div><div><strong>Insurance &amp; Safety:</strong> The Contractor shall maintain all necessary insurance coverage for workers, third-party liability and materials, and comply with all applicable safety regulations.</div></div>
<div class="clause"><div class="clause-n">10.</div><div><strong>Force Majeure:</strong> Neither party shall be liable for delays caused by circumstances beyond reasonable control including acts of God, government orders, natural disasters or pandemics.</div></div>
<div class="clause"><div class="clause-n">11.</div><div><strong>Termination:</strong> Either party may terminate by giving 30 days' written notice in event of material breach not remedied within 15 days. The Contractor shall be paid for work executed to the date of termination based on actual measurement.</div></div>
<div class="clause"><div class="clause-n">12.</div><div><strong>Dispute Resolution:</strong> Disputes shall be attempted to be resolved amicably within 30 days. If unresolved, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. Venue: <strong>${arbitVenue || agPlace || pa || '_______________'}</strong>.</div></div>
<div class="clause"><div class="clause-n">13.</div><div><strong>Governing Law:</strong> This Agreement is governed by the laws of India. Courts at ${arbitVenue || agPlace || '_______________'} shall have exclusive jurisdiction.</div></div>
${extraClauses ? `<div class="clause"><div class="clause-n">14.</div><div><strong>Special Conditions:</strong> ${extraClauses}</div></div>` : ''}

${milestones.length > 0 ? `
<div class="sec-title" style="margin-top:28px">Annexure-A &nbsp;—&nbsp; Schedule of Payments</div>
<p style="font-size:12px;color:#6b7280;margin-bottom:10px">Contract Value: <strong style="color:#1a3a5c">₹${cv.toLocaleString('en-IN')}</strong></p>
<table>
  <thead class="tbl-hdr"><tr>
    <th style="width:36px">#</th>
    <th>Milestone / Stage of Work</th>
    <th style="width:56px;text-align:center">%</th>
    <th class="r" style="width:120px">Amount (₹)</th>
    <th style="width:170px">Payment Due</th>
  </tr></thead>
  <tbody>${mRows}</tbody>
  <tfoot><tr class="tbl-foot">
    <td colspan="2">Total Contract Value</td>
    <td style="text-align:center">100%</td>
    <td class="r" style="font-size:14px">₹${cv.toLocaleString('en-IN')}</td>
    <td></td>
  </tr></tfoot>
</table>` : ''}

<div class="sec-title" style="margin-top:32px">In Witness Whereof</div>
<p style="font-size:12.5px;margin-bottom:18px">The parties have executed this Agreement on the date first written above.</p>

<div class="sig-section">
  <div class="sig-block">
    <div class="sig-label">Contractor / Builder</div>
    <div class="sig-line">
      <div style="font-weight:700">${builder.company || builder.name}</div>
      <div style="font-size:11px;color:#6b7280">Name: ${builder.name}</div>
      <div style="font-size:11px;color:#6b7280">Signature &amp; Stamp</div>
      <div style="font-size:11px;color:#6b7280">Date: _______________</div>
    </div>
  </div>
  <div class="sig-block">
    <div class="sig-label">Owner / Client</div>
    <div class="sig-line">
      <div style="font-weight:700">${cn}</div>
      <div style="font-size:11px;color:#6b7280">Signature</div>
      <div style="font-size:11px;color:#6b7280">Date: _______________</div>
    </div>
  </div>
</div>

<div class="witness-row">
  <div class="sig-block">
    <div class="sig-label">Witness 1</div>
    <div class="sig-line">
      <div style="font-size:11px;color:#6b7280">Name: _______________</div>
      <div style="font-size:11px;color:#6b7280">Address: _______________</div>
      <div style="font-size:11px;color:#6b7280">Signature: _______________</div>
    </div>
  </div>
  <div class="sig-block">
    <div class="sig-label">Witness 2</div>
    <div class="sig-line">
      <div style="font-size:11px;color:#6b7280">Name: _______________</div>
      <div style="font-size:11px;color:#6b7280">Address: _______________</div>
      <div style="font-size:11px;color:#6b7280">Signature: _______________</div>
    </div>
  </div>
</div>

<div class="footer">
  Generated by ${builder.company || builder.name} &nbsp;|&nbsp; BuildTrack Construction ERP &nbsp;|&nbsp;
  ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
</div>
</body></html>`;
}

// ─── Cost Estimate HTML ───────────────────────────────────────────────────────
function buildEstimateHTML({ builder, project, items }) {
  const grandTotal = items.reduce((s, i) => s + (+(i.qty)||0) * (+(i.rate)||0), 0);
  const catTotals  = {};
  items.forEach(it => {
    const t = (+(it.qty)||0) * (+(it.rate)||0);
    catTotals[it.category] = (catTotals[it.category] || 0) + t;
  });

  const itemRows = items.map((it, i) => {
    const total = (+(it.qty)||0) * (+(it.rate)||0);
    return `<tr style="border-bottom:1px solid #e5e7eb;${i%2===0?'background:#fafafa':''}">
      <td style="padding:8px 12px;color:#9ca3af;font-size:11px">${i+1}</td>
      <td style="padding:8px 12px;font-weight:600;font-size:13px">${it.description||''}</td>
      <td style="padding:8px 12px;font-size:11.5px;color:#6b7280">${CAT_LABELS[it.category]||it.category||''}</td>
      <td style="padding:8px 12px;text-align:center;font-size:12px">${it.qty||''} ${it.unit||''}</td>
      <td style="padding:8px 12px;text-align:right;font-size:12px">${it.rate?'₹'+Number(it.rate).toLocaleString('en-IN'):'—'}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700;font-size:13px;color:#1a3a5c">₹${total.toLocaleString('en-IN')}</td>
    </tr>`;
  }).join('');

  const catRows = Object.entries(catTotals).filter(([,v])=>v>0).map(([cat,val])=>`
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:8px 12px;font-weight:600;font-size:12.5px">${CAT_LABELS[cat]||cat}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700;color:#1a3a5c;font-size:13px">₹${val.toLocaleString('en-IN')}</td>
      <td style="padding:8px 12px;text-align:right;color:#6b7280;font-size:12px">${grandTotal>0?((val/grandTotal)*100).toFixed(1)+'%':'—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Cost Estimate — ${project?.name||'Project'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12.5px;line-height:1.6;color:#111827;background:#fff;max-width:900px;margin:0 auto;padding:40px 48px}
@media print{body{padding:16px 20px;max-width:100%}}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #1a3a5c;margin-bottom:18px}
.hdr-right{text-align:right;font-size:11px;color:#6b7280;line-height:1.8}
.banner{background:#1a3a5c;color:#fff;border-radius:6px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin:14px 0}
.banner h1{font-size:18px;letter-spacing:2px;text-transform:uppercase;font-weight:800}
.banner .ref{font-size:11px;opacity:.7;margin-top:4px}
.banner .date-blk{text-align:right;font-size:11px;opacity:.85;line-height:1.8}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.info-box{background:#f8faff;border:1px solid #dbe8ff;border-radius:5px;padding:10px 14px}
.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#1a3a5c;font-weight:700;margin-bottom:3px}
.info-val{font-weight:700;color:#111827;font-size:13px}
.sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a3a5c;margin:20px 0 8px;border-left:3px solid #1a3a5c;padding-left:10px}
table{width:100%;border-collapse:collapse;font-size:12px}
.tbl-hdr th{background:#1a3a5c;color:#fff;padding:9px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.tbl-hdr th.r{text-align:right} .tbl-hdr th.c{text-align:center}
.tbl-foot td{background:#e8f0fb;font-weight:800;font-size:14px;color:#1a3a5c;padding:11px 12px;border-top:3px solid #1a3a5c}
.tbl-foot td.r{text-align:right}
.note-box{background:#fffbeb;border:1px solid #fde68a;border-radius:5px;padding:10px 14px;font-size:11.5px;color:#92400e;margin-top:14px}
.footer{margin-top:36px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px}
</style></head><body>

<div class="hdr">
  ${LOGO_SVG(builder.company||builder.name)}
  <div class="hdr-right">
    ${builder.phone?`<div>${builder.phone}</div>`:''}
    ${builder.email?`<div>${builder.email}</div>`:''}
  </div>
</div>

<div class="banner">
  <div>
    <h1>Cost Estimate</h1>
    <div class="ref">Ref: EST-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}</div>
  </div>
  <div class="date-blk">
    <div>Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
    <div>Valid for 30 days</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box"><div class="info-label">Project Name</div><div class="info-val">${project?.name||'—'}</div></div>
  <div class="info-box"><div class="info-label">Client / Owner</div><div class="info-val">${project?.client?.name||'—'}</div></div>
  <div class="info-box" style="grid-column:1/-1"><div class="info-label">Site Address</div><div class="info-val">${project?.address||'—'}</div></div>
</div>

<div class="sec-title">Detailed Cost Breakdown (Bill of Quantities)</div>
<table>
  <thead class="tbl-hdr"><tr>
    <th style="width:36px">#</th>
    <th>Description of Work</th>
    <th style="width:170px">Category</th>
    <th class="c" style="width:96px">Qty / Unit</th>
    <th class="r" style="width:96px">Rate (₹)</th>
    <th class="r" style="width:108px">Amount (₹)</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
  <tfoot><tr class="tbl-foot">
    <td colspan="5">Grand Total (inclusive of all applicable taxes)</td>
    <td class="r">₹${grandTotal.toLocaleString('en-IN')}</td>
  </tr></tfoot>
</table>

${Object.keys(catTotals).filter(k=>catTotals[k]>0).length>0?`
<div class="sec-title">Category-wise Summary</div>
<table style="max-width:460px">
  <thead class="tbl-hdr"><tr><th>Category</th><th class="r">Amount (₹)</th><th class="r">Share</th></tr></thead>
  <tbody>${catRows}</tbody>
  <tfoot><tr class="tbl-foot">
    <td>Total</td>
    <td class="r">₹${grandTotal.toLocaleString('en-IN')}</td>
    <td class="r">100%</td>
  </tr></tfoot>
</table>`:''}

<div class="note-box">
  ⚠️ <strong>Note:</strong> This estimate is based on current market rates and is subject to change.
  Final cost may vary based on site conditions, material availability and design changes.
  Estimate is valid for 30 days from date of issue.
</div>

<div class="footer">
  Prepared by ${builder.company||builder.name} &nbsp;|&nbsp; BuildTrack Construction ERP &nbsp;|&nbsp;
  ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
</div>
</body></html>`;
}

// ─── Payment Schedule HTML ────────────────────────────────────────────────────
function buildPaymentScheduleHTML({ builder, project, milestones }) {
  const cv = project?.contractValue || project?.budget?.total || 0;
  const rows = milestones.map((m, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;${i%2===0?'background:#fafafa':''}">
      <td style="padding:10px 12px;color:#9ca3af;font-weight:600;font-size:12px">${i+1}</td>
      <td style="padding:10px 12px;font-weight:700;font-size:13px">${m.name}</td>
      <td style="padding:10px 12px;text-align:center;font-weight:700;color:#14532d">${m.pct}%</td>
      <td style="padding:10px 12px;text-align:right;font-weight:800;font-size:14px;color:#14532d">₹${Math.round(cv*m.pct/100).toLocaleString('en-IN')}</td>
      <td style="padding:10px 12px;color:#6b7280;font-size:12px">${m.due?fmtDate(m.due):'—'}</td>
      <td style="padding:10px 12px;text-align:center">
        <span style="display:inline-block;padding:3px 10px;border-radius:99px;background:#fef9c3;color:#854d0e;font-size:11px;font-weight:700;border:1px solid #fde68a">Pending</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Payment Schedule — ${project?.name||'Project'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12.5px;line-height:1.6;color:#111827;background:#fff;max-width:860px;margin:0 auto;padding:40px 48px}
@media print{body{padding:16px 20px;max-width:100%}}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #14532d;margin-bottom:18px}
.hdr-right{text-align:right;font-size:11px;color:#6b7280;line-height:1.8}
.banner{background:#14532d;color:#fff;border-radius:6px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin:14px 0}
.banner h1{font-size:17px;letter-spacing:2px;text-transform:uppercase;font-weight:800}
.banner .ref{font-size:11px;opacity:.7;margin-top:4px}
.banner .date-blk{text-align:right;font-size:11px;opacity:.85}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.info-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:10px 14px}
.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#14532d;font-weight:700;margin-bottom:3px}
.info-val{font-weight:700;color:#111827;font-size:13px}
.stats{display:flex;gap:10px;margin:14px 0;flex-wrap:wrap}
.stat{flex:1;min-width:120px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;text-align:center}
.stat-l{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#14532d;margin-bottom:4px}
.stat-v{font-size:16px;font-weight:800;color:#111827}
.sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#14532d;margin:18px 0 8px;border-left:3px solid #14532d;padding-left:10px}
table{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl-hdr th{background:#14532d;color:#fff;padding:9px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.tbl-hdr th.r{text-align:right} .tbl-hdr th.c{text-align:center}
.tbl-foot td{background:#dcfce7;font-weight:800;font-size:14px;color:#14532d;padding:11px 12px;border-top:3px solid #14532d}
.tbl-foot td.r{text-align:right}
.sig-section{display:flex;justify-content:space-between;gap:40px;margin-top:44px}
.sig-block{flex:1}
.sig-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#6b7280;margin-bottom:6px}
.sig-line{border-top:1px solid #111827;margin-top:44px;padding-top:6px;font-size:12px;color:#374151}
.footer{margin-top:36px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px}
</style></head><body>

<div class="hdr">
  ${LOGO_SVG(builder.company||builder.name)}
  <div class="hdr-right">
    ${builder.phone?`<div>${builder.phone}</div>`:''}
    ${builder.email?`<div>${builder.email}</div>`:''}
  </div>
</div>

<div class="banner">
  <div>
    <h1>Schedule of Payments</h1>
    <div class="ref">Ref: PAY-${new Date().getFullYear()}-${(project?.name||'PROJ').replace(/[^A-Z0-9]/gi,'-').toUpperCase()}</div>
  </div>
  <div class="date-blk">Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
</div>

<div class="info-grid">
  <div class="info-box"><div class="info-label">Project</div><div class="info-val">${project?.name||'—'}</div></div>
  <div class="info-box"><div class="info-label">Client</div><div class="info-val">${project?.client?.name||'—'}</div></div>
  <div class="info-box"><div class="info-label">Contract Value</div><div class="info-val" style="color:#14532d;font-size:15px">₹${cv.toLocaleString('en-IN')}</div></div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-l">Milestones</div><div class="stat-v">${milestones.length}</div></div>
  <div class="stat"><div class="stat-l">Contract Value</div><div class="stat-v" style="font-size:13px">₹${cv.toLocaleString('en-IN')}</div></div>
  <div class="stat"><div class="stat-l">Start Date</div><div class="stat-v" style="font-size:12px">${project?.startDate?new Date(project.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</div></div>
  <div class="stat"><div class="stat-l">End Date</div><div class="stat-v" style="font-size:12px">${project?.endDate?new Date(project.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</div></div>
</div>

<div class="sec-title">Payment Milestones</div>
<table>
  <thead class="tbl-hdr"><tr>
    <th style="width:36px">#</th>
    <th>Milestone / Work Stage</th>
    <th class="c" style="width:56px">%</th>
    <th class="r" style="width:128px">Amount (₹)</th>
    <th style="width:148px">Due Date</th>
    <th class="c" style="width:96px">Status</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr class="tbl-foot">
    <td colspan="2">Total Contract Value</td>
    <td style="text-align:center">100%</td>
    <td class="r">₹${cv.toLocaleString('en-IN')}</td>
    <td colspan="2"></td>
  </tr></tfoot>
</table>

<p style="margin-top:12px;font-size:12px;color:#6b7280;line-height:1.8">
  <strong>Note:</strong> Each payment is due within 7 working days of the Contractor submitting a payment request upon completion of the respective milestone, subject to satisfactory inspection.
</p>

<div class="sig-section">
  <div class="sig-block">
    <div class="sig-label">Contractor / Builder</div>
    <div class="sig-line">
      <div style="font-weight:700">${builder.company||builder.name}</div>
      <div style="font-size:11px;color:#6b7280">Signature &amp; Stamp</div>
      <div style="font-size:11px;color:#6b7280">Date: _______________</div>
    </div>
  </div>
  <div class="sig-block">
    <div class="sig-label">Owner / Client</div>
    <div class="sig-line">
      <div style="font-weight:700">${project?.client?.name||'_______________'}</div>
      <div style="font-size:11px;color:#6b7280">Signature</div>
      <div style="font-size:11px;color:#6b7280">Date: _______________</div>
    </div>
  </div>
</div>

<div class="footer">
  Generated by ${builder.company||builder.name} &nbsp;|&nbsp; BuildTrack Construction ERP &nbsp;|&nbsp;
  ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
</div>
</body></html>`;
}

// ─── CSS Scoping Helper (prefixes all selectors with #id so docs don't clash) ─
function prefixCSS(css, id) {
  const pre = `#${id}`;
  let out = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const sel = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const inner = css.slice(open + 1, j - 1);
    if (sel.startsWith('@media') || sel.startsWith('@supports')) {
      out += `${sel}{${prefixCSS(inner, id)}}`;
    } else if (sel.startsWith('@')) {
      out += `${sel}{${inner}}`;
    } else {
      const scoped = sel.split(',').map(s => {
        const t = s.trim();
        return t === 'body' ? pre : t === '*' ? `${pre} *` : `${pre} ${t}`;
      }).join(',');
      out += `${scoped}{${inner}}`;
    }
    i = j;
  }
  return out;
}

// ─── Combined 3-in-1 Print HTML ───────────────────────────────────────────────
function buildCombinedHTML({ builder, project, agDate, agPlace, defectPeriod, arbitVenue, scope, extraClauses, agMilestones, items, payMilestones }) {
  const h1 = buildAgreementHTML({ builder, project, agDate, agPlace, defectPeriod, arbitVenue, scope, extraClauses, milestones: agMilestones });
  const h2 = buildEstimateHTML({ builder, project, items });
  const h3 = buildPaymentScheduleHTML({ builder, project, milestones: payMilestones });

  const getTag = (html, tag) => {
    const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return m ? m[1] : '';
  };

  const scopedCSS = [h1, h2, h3]
    .map((h, idx) => prefixCSS(getTag(h, 'style'), `doc${idx + 1}`))
    .join('\n');

  const bodies = [h1, h2, h3]
    .map((h, idx) => `<div id="doc${idx + 1}"${idx < 2 ? ' class="page-break"' : ''}>${getTag(h, 'body')}</div>`)
    .join('\n');

  const projName = (project?.name || 'Project').replace(/'/g, '&#39;');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Project Documents — ${projName}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8e8e8;font-family:Arial,sans-serif}
#doc1,#doc2,#doc3{background:#fff}
#print-bar{position:sticky;top:0;z-index:999;background:#1a3a5c;color:#fff;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.3)}
#print-bar .title{font-size:15px;font-weight:700;letter-spacing:.5px}
#print-bar .sub{font-size:12px;opacity:.75;margin-top:2px}
#print-bar button{background:#fff;color:#1a3a5c;border:none;border-radius:6px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;transition:opacity .15s}
#print-bar button:hover{opacity:.85}
#print-bar .hint{font-size:11.5px;opacity:.7;margin-top:3px}
@media screen{
  body{padding:0 0 40px 0}
  #doc1,#doc2,#doc3{max-width:950px;margin:0 auto 32px;box-shadow:0 4px 28px rgba(0,0,0,.18);border-radius:6px;overflow:hidden}
}
@media print{
  #print-bar{display:none!important}
  body{background:#fff;padding:0}
  #doc1,#doc2,#doc3{box-shadow:none;border-radius:0;margin:0}
  .page-break{page-break-after:always;break-after:page}
  @page{margin:12mm 14mm;size:A4}
}
${scopedCSS}
</style>
</head><body>
<div id="print-bar">
  <div>
    <div class="title">📄 ${projName} — All Documents (3)</div>
    <div class="sub">Construction Agreement &nbsp;·&nbsp; Cost Estimate &nbsp;·&nbsp; Payment Schedule</div>
  </div>
  <div style="text-align:right">
    <button onclick="window.print()">🖨️ Print / Save as PDF</button>
    <div class="hint">In print dialog → Destination: "Save as PDF"</div>
  </div>
</div>
${bodies}
</body></html>`;
}

// ─── Input style helpers ──────────────────────────────────────────────────────
const INP   = { padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--r)', fontSize:13, background:'var(--white)', color:'var(--t1)', width:'100%' };
const LABEL = { fontSize:12, fontWeight:600, color:'var(--t2)', marginBottom:4, display:'block' };

// ─── Milestone Editor ─────────────────────────────────────────────────────────
function MilestoneEditor({ milestones, onChange, contractVal }) {
  const totalPct = milestones.reduce((s, m) => s + (+m.pct||0), 0);
  const upd = (id, f, v) => onChange(milestones.map(m => m.id === id ? { ...m, [f]: v } : m));
  const del = (id) => onChange(milestones.filter(m => m.id !== id));
  const add = () => onChange([...milestones, { id: uid(), name: 'New Milestone', pct: 0, due: '' }]);

  return (
    <div>
      <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
              {['Milestone Name','%','Amount','Due Date',''].map(h => (
                <th key={h} style={{ padding:'7px 10px', textAlign: h==='Amount'||h==='%' ? 'right' : 'left', fontSize:10, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {milestones.map(m => (
              <tr key={m.id} style={{ borderBottom:'1px solid var(--border-light)' }}>
                <td style={{ padding:'5px 8px' }}>
                  <input value={m.name} onChange={e => upd(m.id,'name',e.target.value)} style={{ ...INP, minWidth:180 }} />
                </td>
                <td style={{ padding:'5px 8px', width:70 }}>
                  <input type="number" value={m.pct} min={0} max={100} onChange={e => upd(m.id,'pct',e.target.value)}
                    style={{ ...INP, width:60, textAlign:'right' }} />
                </td>
                <td style={{ padding:'5px 10px', textAlign:'right', whiteSpace:'nowrap', width:110, fontWeight:600, color:'var(--t2)', fontSize:12 }}>
                  {contractVal > 0 ? numFmt(Math.round(contractVal*(+m.pct||0)/100)) : '—'}
                </td>
                <td style={{ padding:'5px 8px', width:140 }}>
                  <input type="date" value={m.due} onChange={e => upd(m.id,'due',e.target.value)} style={{ ...INP, width:130 }} />
                </td>
                <td style={{ padding:'5px 8px', width:32 }}>
                  <button onClick={() => del(m.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', padding:4 }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background:'var(--bg)', borderTop:'2px solid var(--border)' }}>
              <td style={{ padding:'7px 10px', fontSize:12, fontWeight:700, color:'var(--t2)' }}>Total</td>
              <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:700, color: totalPct===100?'var(--success)':'var(--danger)', fontSize:13 }}>{totalPct}%</td>
              <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:700, fontSize:12 }}>{contractVal>0?fmt(contractVal):'—'}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
      {totalPct!==100&&(<div style={{ fontSize:12, color:'var(--warning)', fontWeight:600, marginTop:6 }}>⚠️ Percentages add up to {totalPct}% — should be 100%</div>)}
      <button onClick={add} style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, padding:'7px 14px', border:'1px dashed var(--primary)', borderRadius:'var(--r)', background:'var(--primary-light)', color:'var(--primary)', cursor:'pointer', fontSize:13, fontWeight:600 }}>
        <Plus size={13} /> Add Milestone
      </button>
    </div>
  );
}

// ─── Cost Items Editor ────────────────────────────────────────────────────────
function CostItemsEditor({ items, onChange }) {
  const grandTotal = items.reduce((s,i)=>s+(+(i.qty)||0)*(+(i.rate)||0),0);
  const upd = (id,f,v) => onChange(items.map(it=>it.id===id?{...it,[f]:v}:it));
  const del = (id) => onChange(items.filter(it=>it.id!==id));
  const add = () => onChange([...items, { id:uid(), category:'structure', description:'', qty:1, unit:'ls', rate:0 }]);

  return (
    <div>
      <div style={{ border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['#','Description','Category','Qty','Unit','Rate (₹)','Total',''].map(h=>(
                  <th key={h} style={{ padding:'8px 10px', textAlign:h==='Rate (₹)'||h==='Total'?'right':'left', fontSize:10, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it,i)=>{
                const total=(+(it.qty)||0)*(+(it.rate)||0);
                return(
                  <tr key={it.id} style={{ borderBottom:'1px solid var(--border-light)', background:i%2===0?'':'var(--bg)' }}>
                    <td style={{ padding:'5px 8px', color:'var(--t4)', fontSize:11, width:28 }}>{i+1}</td>
                    <td style={{ padding:'5px 6px', minWidth:200 }}>
                      <input value={it.description} onChange={e=>upd(it.id,'description',e.target.value)} placeholder="Description" style={{ ...INP, minWidth:180 }} />
                    </td>
                    <td style={{ padding:'5px 6px', width:150 }}>
                      <select value={it.category} onChange={e=>upd(it.id,'category',e.target.value)} style={INP}>
                        {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'5px 6px', width:68 }}>
                      <input type="number" value={it.qty} min={0} onChange={e=>upd(it.id,'qty',e.target.value)} style={{ ...INP, width:58, textAlign:'right' }} />
                    </td>
                    <td style={{ padding:'5px 6px', width:78 }}>
                      <select value={it.unit} onChange={e=>upd(it.id,'unit',e.target.value)} style={INP}>
                        {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'5px 6px', width:108 }}>
                      <input type="number" value={it.rate} min={0} onChange={e=>upd(it.id,'rate',e.target.value)} style={{ ...INP, textAlign:'right' }} />
                    </td>
                    <td style={{ padding:'5px 10px', textAlign:'right', fontWeight:700, color:'var(--t1)', whiteSpace:'nowrap', width:100 }}>
                      {total>0?fmt(total):'—'}
                    </td>
                    <td style={{ padding:'5px 6px', width:32 }}>
                      <button onClick={()=>del(it.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', padding:4 }}><Trash2 size={13}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background:'var(--primary-light)', borderTop:'2px solid var(--primary)' }}>
                <td colSpan={6} style={{ padding:'9px 10px', fontWeight:700, color:'var(--primary)', fontSize:13 }}>Grand Total</td>
                <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:800, fontSize:14, color:'var(--primary)' }}>{fmt(grandTotal)}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <button onClick={add} style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, padding:'7px 14px', border:'1px dashed var(--primary)', borderRadius:'var(--r)', background:'var(--primary-light)', color:'var(--primary)', cursor:'pointer', fontSize:13, fontWeight:600 }}>
        <Plus size={13}/> Add Item
      </button>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key:'agreement', label:'Construction Agreement', icon:Scale,        accent:'#1a3a5c' },
  { key:'estimate',  label:'Cost Estimate (BOQ)',    icon:ClipboardList, accent:'#1e40af' },
  { key:'payment',   label:'Payment Schedule',       icon:IndianRupee,  accent:'#14532d' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Agreements() {
  const { user } = useAuth();

  const [tab,      setTab]      = useState('agreement');
  const [projects, setProjects] = useState([]);
  const [projId,   setProjId]   = useState('');

  // Agreement fields
  const [agDate,       setAgDate]       = useState(new Date().toISOString().slice(0,10));
  const [agPlace,      setAgPlace]      = useState('');
  const [defectPeriod, setDefectPeriod] = useState('One (1) Year');
  const [arbitVenue,   setArbitVenue]   = useState('');
  const [scope,        setScope]        = useState('');
  const [extraClauses, setExtraClauses] = useState('');
  const [agMilestones, setAgMilestones] = useState([]);

  // Estimate fields
  const [costItems, setCostItems] = useState([]);

  // Payment schedule fields
  const [payMilestones, setPayMilestones] = useState([]);

  useEffect(() => {
    api.get('/projects').then(r => {
      const list = r.data.data || [];
      setProjects(list);
      if (list.length) { setProjId(list[0]._id); initFrom(list[0]); }
    }).catch(() => {});
  }, []); // eslint-disable-line

  const selProject = projects.find(p => p._id === projId) || null;

  function initFrom(proj) {
    if (!proj) return;
    setAgPlace(proj.address || '');
    setScope(`Construction of ${proj.name} including all civil, structural, MEP and finishing works as per approved drawings and specifications.`);
    const ms = milestonesFromPhases(proj.phases);
    setAgMilestones(ms);
    setPayMilestones(ms.map(m => ({ ...m, id: uid() })));
    setCostItems(itemsFromBudget(proj.budget));
  }

  function handleProjChange(id) {
    setProjId(id);
    const proj = projects.find(p => p._id === id);
    if (proj) initFrom(proj);
  }

  const builder = {
    name:    user?.name    || 'Builder',
    company: user?.company || user?.name || 'Builder',
    phone:   user?.phone   || '',
    email:   user?.email   || '',
    address: '',
  };

  const safeName = (p) => (p?.name || 'Project').replace(/\s+/g, '-');

  function generateAgreement() {
    if (!selProject) { toast.error('Select a project'); return; }
    const html = buildAgreementHTML({ builder, project: selProject, agDate, agPlace, defectPeriod, arbitVenue, scope, extraClauses, milestones: agMilestones });
    downloadHTML(html, `Agreement-${safeName(selProject)}.html`);
    toast.success('Agreement downloaded');
  }

  function generateEstimate() {
    if (!selProject) { toast.error('Select a project'); return; }
    if (!costItems.length) { toast.error('Add at least one item'); return; }
    const html = buildEstimateHTML({ builder, project: selProject, items: costItems });
    downloadHTML(html, `Cost-Estimate-${safeName(selProject)}.html`);
    toast.success('Cost Estimate downloaded');
  }

  function generatePaymentSchedule() {
    if (!selProject) { toast.error('Select a project'); return; }
    if (!payMilestones.length) { toast.error('Add at least one milestone'); return; }
    const html = buildPaymentScheduleHTML({ builder, project: selProject, milestones: payMilestones });
    downloadHTML(html, `Payment-Schedule-${safeName(selProject)}.html`);
    toast.success('Payment Schedule downloaded');
  }

  function downloadAll() {
    if (!selProject) { toast.error('Select a project first'); return; }
    if (!costItems.length) { toast.error('Add at least one cost item first'); return; }
    if (!payMilestones.length) { toast.error('Add at least one payment milestone first'); return; }
    const html = buildCombinedHTML({
      builder, project: selProject,
      agDate, agPlace, defectPeriod, arbitVenue, scope, extraClauses,
      agMilestones, items: costItems, payMilestones,
    });
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Popups are blocked — please allow popups for this site and try again', { duration: 5000 });
      return;
    }
    win.document.write(html);
    win.document.close();
    toast.success('Opening combined PDF — Print dialog will open. Choose "Save as PDF".', { duration: 6000 });
  }

  const cv = selProject?.contractValue || selProject?.budget?.total || 0;

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, gap:14, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:'var(--r)', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'var(--t1)', lineHeight:1.2 }}>Document Generator</h1>
            <p style={{ fontSize:12, color:'var(--t3)', marginTop:1 }}>Generate construction documents from your project data</p>
          </div>
        </div>
        <button onClick={downloadAll}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', border:'none', borderRadius:'var(--r)', background:'var(--primary)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, flexShrink:0 }}>
          <Download size={15}/> Download All (3)
        </button>
      </div>

      {/* ── Project selector ─────────────────────────────────────────── */}
      <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <label style={{ fontSize:13, fontWeight:700, color:'var(--t2)', whiteSpace:'nowrap' }}>Project</label>
        <div style={{ position:'relative', flex:1, minWidth:240, maxWidth:400 }}>
          <select value={projId} onChange={e => handleProjChange(e.target.value)}
            style={{ width:'100%', padding:'9px 32px 9px 12px', border:'1px solid var(--border)', borderRadius:'var(--r)', fontSize:13, background:'var(--white)', color:'var(--t1)', appearance:'none', cursor:'pointer' }}>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <ChevronDown size={14} color="var(--t3)" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', borderBottom:'2px solid var(--border)', marginBottom:0, gap:0 }}>
        {TABS.map(({ key, label, icon: Icon, accent }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display:'flex', alignItems:'center', gap:7, padding:'11px 20px',
              border:'none', background:'none', cursor:'pointer',
              fontSize:13, fontWeight: tab===key ? 700 : 500,
              color: tab===key ? accent : 'var(--t3)',
              borderBottom: tab===key ? `2px solid ${accent}` : '2px solid transparent',
              marginBottom:-2, transition:'color .15s, border-color .15s',
            }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────────────── */}
      <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 var(--r-lg) var(--r-lg)', padding:24 }}>

        {/* AGREEMENT */}
        {tab === 'agreement' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={LABEL}>Agreement Date</label>
                <input type="date" value={agDate} onChange={e=>setAgDate(e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LABEL}>Place / City</label>
                <input value={agPlace} onChange={e=>setAgPlace(e.target.value)} placeholder="e.g. Lucknow, Uttar Pradesh" style={INP}/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={LABEL}>Defect Liability Period</label>
                <select value={defectPeriod} onChange={e=>setDefectPeriod(e.target.value)} style={INP}>
                  {DEFECT.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL}>Arbitration / Court Venue</label>
                <input value={arbitVenue} onChange={e=>setArbitVenue(e.target.value)} placeholder="Defaults to place above" style={INP}/>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={LABEL}>Scope of Work</label>
              <textarea value={scope} onChange={e=>setScope(e.target.value)} rows={2} style={{ ...INP, resize:'vertical' }}/>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={LABEL}>Special Conditions <span style={{ fontWeight:400, color:'var(--t4)' }}>(optional)</span></label>
              <textarea value={extraClauses} onChange={e=>setExtraClauses(e.target.value)} rows={2}
                placeholder="Penalty clauses, specific material specs, special requirements..."
                style={{ ...INP, resize:'vertical' }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label style={{ ...LABEL, marginBottom:0 }}>Annexure-A: Payment Milestones
                  <span style={{ fontWeight:400, color:'var(--t3)', marginLeft:8 }}>(Contract: {cv>0?fmt(cv):'—'})</span>
                </label>
                <button onClick={()=>setAgMilestones(milestonesFromPhases(selProject?.phases))}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--white)', color:'var(--t2)', cursor:'pointer', fontSize:12 }}>
                  <RefreshCw size={11}/> Reset
                </button>
              </div>
              <MilestoneEditor milestones={agMilestones} onChange={setAgMilestones} contractVal={cv}/>
            </div>
            <button onClick={generateAgreement}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', border:'none', borderRadius:'var(--r)', background:'#1a3a5c', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:700 }}>
              <Download size={15}/> Download Agreement
            </button>
          </div>
        )}

        {/* ESTIMATE */}
        {tab === 'estimate' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:12, color:'var(--t3)' }}>
                💡 Edit description, qty and rate for each line item. Click <strong>Load from Budget</strong> to pre-fill.
              </div>
              <button onClick={()=>setCostItems(itemsFromBudget(selProject?.budget))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--white)', color:'var(--t2)', cursor:'pointer', fontSize:12, fontWeight:600, flexShrink:0 }}>
                <RefreshCw size={11}/> Load from Budget
              </button>
            </div>
            <CostItemsEditor items={costItems} onChange={setCostItems}/>
            <div style={{ marginTop:20 }}>
              <button onClick={generateEstimate}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', border:'none', borderRadius:'var(--r)', background:'#1e40af', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:700 }}>
                <Download size={15}/> Download Cost Estimate
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT SCHEDULE */}
        {tab === 'payment' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:12, color:'var(--t3)' }}>
                💡 Set milestone %, amounts auto-calculate from contract value:
                <strong style={{ marginLeft:4 }}>{cv > 0 ? fmt(cv) : 'No contract value set'}</strong>
              </div>
              <button onClick={()=>setPayMilestones(milestonesFromPhases(selProject?.phases))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--white)', color:'var(--t2)', cursor:'pointer', fontSize:12, fontWeight:600, flexShrink:0 }}>
                <RefreshCw size={11}/> Reset from Phases
              </button>
            </div>
            <MilestoneEditor milestones={payMilestones} onChange={setPayMilestones} contractVal={cv}/>
            <div style={{ marginTop:20 }}>
              <button onClick={generatePaymentSchedule}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', border:'none', borderRadius:'var(--r)', background:'#14532d', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:700 }}>
                <Download size={15}/> Download Payment Schedule
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
