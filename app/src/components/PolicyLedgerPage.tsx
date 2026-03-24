
import { FileText, Shield, Scale, Info, Search, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { disasterPolicies } from '@/services/knowledgeService';
import type { PolicyDocument } from '@/services/knowledgeService';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PolicyLedgerPage() {
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDocument | null>(disasterPolicies[0]);

  const filteredPolicies = disasterPolicies.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl glass-panel border-white/5 bg-mesh relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase text-glass">Policy Ledger</h2>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mt-1">RAG Grounding & Compliance Framework</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-4xl font-medium">
            Every autonomous recommendation and guardrail check is grounded in official disaster management protocols. 
            The Policy Ledger exposes the Retrieval-Augmented Generation (RAG) knowledge base used by the Hazard and Guardrail agents.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy List */}
        <Card className="lg:col-span-1 glass-panel border-white/5 h-[600px] flex flex-col">
          <CardHeader className="bg-white/5 border-b border-white/5 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search protocols..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredPolicies.map((p) => (
                    <motion.div
                      layout
                      key={p.id}
                      onClick={() => setSelectedPolicy(p)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPolicy?.id === p.id 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-white/5 border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-tight ${selectedPolicy?.id === p.id ? 'text-emerald-400' : 'text-white'}`}>{p.title}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{p.source}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${selectedPolicy?.id === p.id ? 'text-emerald-400 translate-x-1' : 'text-slate-700'}`} />
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        {p.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} className="text-[8px] bg-white/5 text-slate-500 border-0 uppercase font-black tracking-widest px-1.5 py-0">#{tag}</Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Policy Detail */}
        <Card className="lg:col-span-2 glass-panel border-white/5 h-[600px] overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {!selectedPolicy ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <BookOpen className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Select a protocol to review grounding</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedPolicy.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <CardHeader className="bg-emerald-500/5 border-b border-white/5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 text-[10px] font-black tracking-[0.2em]">VERIFIED KNOWLEDGE ASSET</Badge>
                      <CardTitle className="text-2xl font-black text-white tracking-tighter uppercase">{selectedPolicy.title}</CardTitle>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                      <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 p-8">
                    <div className="space-y-8 max-w-3xl">
                      <section>
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                          <Info className="w-3.5 h-3.5" /> Source Metadata
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase">Issuing Authority</p>
                            <p className="text-xs font-bold text-slate-300 mt-1">{selectedPolicy.source}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase">Document ID</p>
                            <p className="text-xs font-mono font-bold text-slate-300 mt-1">{selectedPolicy.id}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                          <BookOpen className="w-3.5 h-3.5" /> Contextual Logic
                        </h4>
                        <div className="p-6 bg-slate-900/60 border border-emerald-500/20 rounded-3xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Scale className="w-24 h-24 text-emerald-500" />
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed font-medium relative z-10 italic">
                            "{selectedPolicy.content}"
                          </p>
                        </div>
                      </section>

                      <section>
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                          <Shield className="w-3.5 h-3.5" /> Agent Utilization
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Guardrail Check</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Used to validate actions against statutory limits defined in {selectedPolicy.id}.</p>
                          </div>
                          <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Hazard Assessment</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Provides technical thresholds for hydrological onset modeling via RAG.</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-white/5 bg-slate-900/40 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <ExternalLink className="w-3.5 h-3.5" /> View Full Protocol
                    </button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
