
import React, { useState, useCallback, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Document, DocumentStatus } from '../types';
import { TrashIcon, EyeIcon, RetryIcon } from '../components/icons/Icons';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

const DocumentUpload: React.FC<{ onUpload: (files: File[]) => void }> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) onUpload(Array.from(e.dataTransfer.files));
    };

    return (
        <div 
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`relative group border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300
                ${isDragging 
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-900 bg-white dark:bg-gray-900'}`}
        >
            <input type="file" id="fileUpload" className="hidden" multiple onChange={(e) => e.target.files && onUpload(Array.from(e.target.files))} accept=".pdf,.txt,.md,.csv,.docx,.xlsx" />
            <label htmlFor="fileUpload" className="cursor-pointer">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">Drop files or click to browse</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Upload PDF, DOCX, or TXT specifications to start AI requirement extraction.</p>
            </label>
        </div>
    );
};

const Documents: React.FC = () => {
    const { documents, addDocuments, deleteDocument, extractRequirements, addRecentSearch } = useProject();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [docToDelete, setDocToDelete] = useState<string | null>(null);

    const filteredDocuments = useMemo(() => {
        return documents
            .filter(doc => doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(doc => statusFilter === 'All Statuses' || doc.status === statusFilter);
    }, [documents, searchTerm, statusFilter]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const getStatusBadge = (status: DocumentStatus) => {
        const base = 'px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ring-1 ring-inset';
        switch (status) {
            case DocumentStatus.Success: return `${base} bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400`;
            case DocumentStatus.Parsing: return `${base} bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse`;
            case DocumentStatus.Error: return `${base} bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400`;
            default: return `${base} bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-900 dark:text-slate-400`;
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <DocumentUpload onUpload={addDocuments} />

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative">
                        <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Find document..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onBlur={() => addRecentSearch(searchTerm)}
                            className="pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white w-64 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                         className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all"
                    >
                        <option>All Statuses</option>
                        {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest bg-slate-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-5">File Details</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Process</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredDocuments.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{doc.fileName}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">{formatBytes(doc.size)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                                        {new Date(doc.dateUploaded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {(doc.status === DocumentStatus.Pending || doc.status === DocumentStatus.Error) && (
                                                <button onClick={() => extractRequirements(doc.id)} className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" title="Extract Requirements"><RetryIcon /></button>
                                            )}
                                            <button onClick={() => setDocToDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocuments.length === 0 && (
                                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No documents found matching the criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ConfirmationModal 
                isOpen={!!docToDelete} 
                onClose={() => setDocToDelete(null)} 
                onConfirm={() => docToDelete && deleteDocument(docToDelete)}
                title="Delete Document"
                message="Are you sure you want to remove this document? All linked requirements and test cases will be permanently erased."
            />
        </div>
    );
};

export default Documents;
