
import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Modal } from '../components/ui/Modal';
import { EyeIcon } from '../components/icons/Icons';
import { Requirement, TestCase } from '../types';

const Traceability: React.FC = () => {
    const { requirements, testCases } = useProject();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
    const itemsPerPage = 12;

    const traceabilityData = useMemo(() => {
        return requirements.map(req => ({
            requirement: req,
            requirementId: req.id,
            requirementText: req.text,
            linkedTestCases: testCases.filter(tc => tc.requirementId === req.id),
        }));
    }, [requirements, testCases]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return traceabilityData.slice(startIndex, startIndex + itemsPerPage);
    }, [traceabilityData, currentPage]);
    
    const totalPages = Math.ceil(traceabilityData.length / itemsPerPage);

    const getStatusBadge = (status: string) => {
        const base = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ring-1 ring-inset';
        if (status === 'Mapped') return `${base} bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400`;
        return `${base} bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Traceability Matrix</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cross-reference map between software requirements and validation test cases.</p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.2em] bg-slate-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-5 w-48">Requirement ID</th>
                                <th className="px-8 py-5">Full Specification Summary</th>
                                <th className="px-8 py-5">Linked Test Cases</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {paginatedData.map(item => (
                                <tr key={item.requirementId} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg ring-1 ring-inset ring-purple-500/20">
                                            {item.requirementId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg">
                                        {item.requirementText}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {item.linkedTestCases.length > 0 ? (
                                                item.linkedTestCases.map((tc) => (
                                                    <span key={tc.id} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        {tc.id}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 tracking-tighter">
                                                    ● No Coverage
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => setSelectedReq(item.requirement)}
                                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
                                            title="View Details"
                                        >
                                            <EyeIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-gray-900/30 flex items-center justify-between">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all">Previous</button>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all">Next</button>
                    </div>
                )}
            </div>

            {selectedReq && (
                <Modal 
                    isOpen={!!selectedReq} 
                    onClose={() => setSelectedReq(null)} 
                    title={`Requirement Trace: ${selectedReq.id}`}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Specification</h4>
                            <p className="text-slate-900 dark:text-white leading-relaxed">{selectedReq.text}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</h4>
                                <span className={getStatusBadge(selectedReq.status)}>{selectedReq.status}</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Priority</h4>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedReq.priority}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Type</h4>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedReq.type}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Source</h4>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedReq.source}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Linked Test Cases</h4>
                            <div className="space-y-3">
                                {testCases.filter(tc => tc.requirementId === selectedReq.id).length > 0 ? (
                                    testCases.filter(tc => tc.requirementId === selectedReq.id).map(tc => (
                                        <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-purple-600 dark:text-purple-400">{tc.id}</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[280px]">{tc.title}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                                                {tc.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-rose-50/30 dark:bg-rose-950/10 rounded-2xl border border-dashed border-rose-200 dark:border-rose-900">
                                        <p className="text-sm font-medium text-rose-600 dark:text-rose-400 italic">No validation test cases linked to this requirement.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Traceability;
