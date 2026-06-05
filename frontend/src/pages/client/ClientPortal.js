import React, { useEffect, useState } from 'react';
import { FolderKanban, Users, CheckSquare, Calendar, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

export default function ClientPortal() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/project')
      .then(r => setProject(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>Loading...</div>;
  if (!project) return (
    <div style={{ textAlign:'center', padding:60 }}>
      <FolderKanban size={40} color="var(--t4)" />
      <p style={{ color:'var(--t3)', marginTop:12 }}>No project assigned to your account yet.</p>
    </div>
  );

  const completionColor = project.completion >= 80 ? 'var(--success)' : project.completion >= 40 ? 'var(--primary)' : 'var(--warning)';

  const stats = [
    { label:'Completion',   value:`${project.completion || 0}%`,  color:completionColor,    icon:TrendingUp },
    { label:'Status',       value:project.status?.replace('_',' ').toUpperCase(), color:'var(--primary)', icon:FolderKanban },
    { label:'Phases',       value:project.phases?.length || 0,   color:'var(--info)',       icon:CheckSquare },
    { label:'Team Size',    value:project.team?.length || 0,      color:'var(--purple)',     icon:Users },
  ];

  return (
    <div>
      {/* Project header */}
      <div style={{
        background:'var(--white)', borderRadius:'var(--r-lg)',
        padding:'20px 24px', marginBottom:20,
        border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)',
      }}>
        <div style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
          Your Project
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>{project.name}</h1>
        <div style={{ fontSize:13, color:'var(--t2)', marginBottom:16 }}>{project.address}</div>

        {/* Progress bar */}
        <div style={{ marginBottom:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:12, color:'var(--t3)' }}>Overall Progress</span>
            <span style={{ fontSize:12, fontWeight:700, color:completionColor }}>{project.completion || 0}%</span>
          </div>
          <div style={{ height:8, background:'var(--border)', borderRadius:'var(--r-full)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${project.completion || 0}%`, background:completionColor, borderRadius:'var(--r-full)', transition:'width 0.5s ease' }}/>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
        {stats.map(({ label, value, color, icon:Icon }) => (
          <div key={label} style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'16px', border:'1px solid var(--border)', boxShadow:'var(--shadow-xs)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
              <Icon size={14} color={color}/>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Phases */}
      {project.phases?.length > 0 && (
        <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'18px 20px', border:'1px solid var(--border)' }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:14 }}>Project Phases</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {project.phases.map((ph, i) => {
              const sc = { pending:'var(--t4)', in_progress:'var(--primary)', completed:'var(--success)' };
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:sc[ph.status]||'var(--t4)', flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{ph.name}</div>
                    <div style={{ fontSize:11, color:'var(--t3)' }}>{ph.status.replace('_',' ')}</div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:sc[ph.status]||'var(--t3)' }}>{ph.completion || 0}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
