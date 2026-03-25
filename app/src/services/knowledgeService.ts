/**
 * Knowledge Service - Grounding for FloodGuard AI RAG
 * Contains disaster management protocols, policies, and historical context
 */

export interface PolicyDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  tags: string[];
}

export const disasterPolicies: PolicyDocument[] = [
  {
    id: 'NDMA-V4.2',
    title: 'NDMA National Disaster Management Protocol v4.2',
    source: 'National Disaster Management Authority',
    content: 'Standard operating procedure for flood monitoring. Critical threshold defined at 95% of danger level. Mandatory evacuation alert must be issued when water level reaches danger level.',
    tags: ['flood', 'evacuation', 'protocol']
  },
  {
    id: 'CWC-SEC12',
    title: 'CWC Statutory Limit §12',
    source: 'Central Water Commission',
    content: 'Rainfall intensity above 50mm/hr classifies as "Severe Intensity". Dams must initiate spillway inspections if catchment rainfall exceeds 100mm in 24 hours.',
    tags: ['rainfall', 'dam', 'inspection']
  },
  {
    id: 'STATE-DM-30',
    title: 'State Disaster Management Act §30',
    source: 'State Government',
    content: 'District Magistrates are authorized to declare emergency zones and execute forced evacuations when life safety is at risk due to hydro-meteorological threats.',
    tags: ['legal', 'authority', 'emergency']
  },
  {
    id: 'HYDROL-GUIDE',
    title: 'Urban Hydrology Management Guidelines',
    source: 'Urban Development Ministry',
    content: 'Smart city drainage systems must be monitored for backflow risks. Low-lying areas (slums/basements) are Priority 1 for evacuation during flash floods.',
    tags: ['urban', 'drainage', 'slums']
  }
];

export function getRelevantPolicies(query: string): PolicyDocument[] {
  const lowQuery = query.toLowerCase();
  return disasterPolicies.filter(p => 
    p.tags.some(t => lowQuery.includes(t)) || 
    p.content.toLowerCase().includes(lowQuery) ||
    p.title.toLowerCase().includes(lowQuery)
  );
}
