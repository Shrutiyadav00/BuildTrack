import React from 'react';
import { Users2 } from 'lucide-react';

export default function Team() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Team</h1>
          <p>Manage engineers, supervisors, and collaborators</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"><Users2 size={32} color="var(--primary)" /></div>
          <div className="empty-title">Team management coming soon</div>
          <div className="empty-desc">Invite engineers and supervisors to collaborate on your projects. They'll get role-based access to view and update project data.</div>
        </div>
      </div>
    </div>
  );
}
