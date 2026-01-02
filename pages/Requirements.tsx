
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Requirement, RequirementStatus, RequirementType, Priority } from '../types';
import { Modal } from '../components/ui/Modal';
import { EyeIcon, PlusIcon, LinkIcon, TrashIcon, EditIcon } from '../components/icons/Icons';

const getStatusBadge = (status: RequirementStatus) => {
    const base = 'px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ring-1 ring-inset';
    switch (status) {
        case RequirementStatus.Mapped: return `${base} bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400`;
        case RequirementStatus.Unmapped: return `${base} bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400`;
        case RequirementStatus.NeedsReview: return `${base} bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400`;
        default: return `${base} bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400`;
    }
};

const getQualityBadge = (score: number | undefined) => {
    if (score === undefined) return null;
    const base = 'px-1.5 py-0.5 text-[10px] font-bold rounded ring-1 ring-inset';
    if (score >= 90) return `${base} bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300`;
    if (score >= 75) return `${base} bg-amber-100 text-amber-800 ring-emerald-600/20 dark:bg-amber-900/30 dark:text-amber-300`;
    return `${base} bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-300`;
}

const Requirements: React.FC = () => {
    const { requirements, bulkUpdateRequirements, addRecentSearch } = useProject();
    const [filters, setFilters] = useState({ searchTerm: '', status: 'All Statuses', type: 'All Types', priority: 'All Priorities', linkage: 'All' });
    const [groupBySource, setGroupBySource] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [detailModalReq, setDetailModalReq] = useState<Requirement | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const masterCheckboxRef = useRef<HTMLInputElement>(null);

    const filteredRequirements = useMemo(() => {
        return requirements
            .filter(req => req.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) || req.text.toLowerCase().includes(filters.searchTerm.toLowerCase()))
            .filter(req => filters.status === 'All Statuses' || req.status === filters.status)
            .filter(req => filters.type === 'All Types' || req.type === filters.type)
            .filter(req => filters.priority === 'All Priorities' || req.priority === filters.priority);
    }, [requirements, filters]);

    const groupedRequirements = useMemo(() => {
        if (!groupBySource) return { 'Active Requirements': filteredRequirements };
        const groups: Record<string, Requirement[]> = {};
        filteredRequirements.forEach(req => {
            const source = req.source || 'Manual';
            if (!groups[source]) groups[source] = [];
            groups[source].push(req);
        });
        return groups;
    }, [filteredRequirements, groupBySource]);

    const isAllSelected = filteredRequirements.length > 0 && filteredRequirements.every(req => selectedIds.has(req.id));
    const isSomeSelected = filteredRequirements.some(req => selectedIds.has(req.id)) && !isAllSelected;

    useEffect(() => {
        if (masterCheckboxRef.current) {
            masterCheckboxRef.current.indeterminate = isSomeSelected;
        }
    }, [isSomeSelected]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = new Set(selectedIds);
        if (e.target.checked) {
            filteredRequirements.forEach(req => next.add(req.id));
        } else {
            filteredRequirements.forEach(req => next.delete(req.id));
        }
        setSelectedIds(next);
    };

    const handleSelectOne = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-1 min-w-[200px] items-center ml-2 relative">
                    <svg className="w-4 h-4 text-slate-400 absolute ml-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search requirements..."
                        value={filters.searchTerm}
                        onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))}
                        onBlur={() => addRecentSearch(filters.searchTerm)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-950 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2 p-1">
                    <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="bg-slate-50 dark:bg-gray-950 border-none text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500 py-2.5 px-3">
                        <option>All Statuses</option>
                        {Object.values(RequirementStatus).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setGroupBySource(!groupBySource)} className={`px-4 py-2.5 text-xs font-semibold rounded-xl border-none transition-all ${groupBySource ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-50 dark:bg-gray-950 text-slate-600 dark:text-slate-400'}`}>
                        {groupBySource ? 'Grouping Active' : 'Group by Source'}
                    </button>
                    <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-md transition-all flex items-center gap-2">
                        <PlusIcon /> New
                    </button>
                </div>
            </div>
            
            {selectedIds.size > 0 && (
                <div className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center animate-fade-in-up shadow-xl">
                    <span className="text-sm font-bold">{selectedIds.size} Requirements Selected</span>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs font-medium opacity-80 uppercase tracking-widest">Update to:</span>
                        <select onChange={e => { bulkUpdateRequirements(Array.from(selectedIds), {status: e.target.value as RequirementStatus}); setSelectedIds(new Set()); }} className="bg-white/20 border-none rounded-lg text-xs font-bold focus:ring-0">
                            <option className="text-black">Choose status</option>
                            {Object.values(RequirementStatus).map(s => <option key={s} className="text-black">{s}</option>)}
                        </select>
                        <button onClick={() => setSelectedIds(new Set())} className="text-xs font-bold hover:underline ml-2 uppercase">Cancel</button>
                    </div>
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-[0.2em] bg-slate-50/50 dark:bg-gray-900/50">
                            <th className="px-8 py-4 w-12">
                                <input 
                                    type="checkbox" 
                                    ref={masterCheckboxRef}
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="rounded-md border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 dark:bg-gray-900 cursor-pointer" 
                                />
                            </th>
                            <th className="px-8 py-4">ID / Summary</th>
                            <th className="px-8 py-4">Quality</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    {Object.keys(groupedRequirements).map((source) => (
                        <tbody key={source} className="divide-y divide-slate-50 dark:divide-slate-800">
                            {groupBySource && (
                                <tr className="bg-slate-50/50 dark:bg-gray-950/40">
                                    <td colSpan={5} className="px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{source}</td>
                                </tr>
                            )}
                            {groupedRequirements[source].map(req => (
                                <tr key={req.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.has(req.id)} 
                                            onChange={() => handleSelectOne(req.id)} 
                                            className="rounded-md border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 dark:bg-gray-900 cursor-pointer" 
                                        />
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-xs mb-1 tracking-tight">{req.id}</span>
                                            <span className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{req.text}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><span className={getQualityBadge(req.qualityScore)}>{req.qualityScore}</span></td>
                                    <td className="px-8 py-6"><span className={getStatusBadge(req.status)}>{req.status}</span></td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button onClick={() => setDetailModalReq(req)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"><EyeIcon /></button>
                                            <button className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"><LinkIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ))}
                </table>
            </div>
        </div>
    );
};

export default Requirements;
