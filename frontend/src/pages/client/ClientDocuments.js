import React, { useEffect, useState } from 'react';
import { FileText, Download, FolderOpen, Eye, Clock } from 'lucide-react';
import api from '../../utils/api';

const CATEGORY_META = {
  drawing:     { label: 'Drawing',      color: 'var(--primary)',  bg: 'var(--primary-light)' },
  contract:    { label: 'Contract',     color: 'var(--success)',  bg: 'var(--success-bg)'    },
  permit:      { label: 'Permit',       color: 'var(--warning)',  bg: 'var(--warning-bg)'    },
  invoice:     { label: 'Invoice',      color: 'var(--info)',     bg: 'var(--info-bg)'       },
  report:      { label: 'Report',       color: 'var(--purple)',   bg: 'var(--purple-bg)'     },
  photo:       { label: 'Photo',        color: 'var(--t2)',       bg: 'var(--bg)'            },
  other:       { label: 'Other',        color: 'var(--t3)',       bg: 'var(--bg)'            },
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
});

export default function ClientDocuments() {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/documents')
      .then(r => setDocs(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--t3)' }}>Loading documents...</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <FolderOpen size={20} color="var(--primary)" />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>Documents</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>
            Files shared with you by your builder
          </p>
        </div>
      </div>

      {docs.length === 0 ? (
        <div style={{
          padding: 60, textAlign: 'center',
          background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
        }}>
          <FileText size={40} color="var(--border)" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t2)', marginBottom: 4 }}>
            No documents shared yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>
            Your builder will share project documents here as work progresses.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => {
            const meta    = CATEGORY_META[doc.category] || CATEGORY_META.other;
            const active  = doc.versions?.find(v => v.versionNumber === doc.activeVersion);
            const fileUrl = active?.fileUrl;

            return (
              <div key={doc._id} style={{
                background: 'var(--white)', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r)',
                  background: meta.bg, color: meta.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FileText size={20} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 4 }}>
                    {doc.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 'var(--r-full)', background: meta.bg, color: meta.color,
                    }}>
                      {meta.label}
                    </span>
                    {doc.activeVersion && (
                      <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                        v{doc.activeVersion}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t4)' }}>
                      <Clock size={10} />
                      {fmtDate(doc.updatedAt)}
                    </span>
                    {doc.createdBy?.name && (
                      <span style={{ fontSize: 11, color: 'var(--t4)' }}>
                        by {doc.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {fileUrl && (
                    <>
                      <a
                        href={fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '7px 12px', borderRadius: 'var(--r)',
                          border: '1px solid var(--border)', background: 'var(--bg)',
                          color: 'var(--t2)', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none', cursor: 'pointer',
                        }}>
                        <Eye size={13} /> View
                      </a>
                      <a
                        href={fileUrl} download
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '7px 12px', borderRadius: 'var(--r)',
                          border: 'none', background: 'var(--primary)',
                          color: '#fff', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none', cursor: 'pointer',
                        }}>
                        <Download size={13} /> Download
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
