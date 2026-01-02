
import React, { useState, useMemo, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { TestCase, TestCaseStatus, Priority, Severity, RequirementStatus, Requirement, RequirementType } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { EditIcon, TrashIcon, PlusIcon, PdfIcon, ExportIcon } from '../components/icons/Icons';

type SubTab = 'Review Test Cases' | 'Generate';

const EditTestCaseModal: React.FC<{
    testCase: TestCase | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (testCase: TestCase) => void;
}> = ({ testCase, isOpen, onClose, onSave }) => {
    const [editedTC, setEditedTC] = useState<TestCase | null>(null);

    useEffect(() => {
        if (testCase) {
            setEditedTC(JSON.parse(JSON.stringify(testCase))); 
        }
    }, [testCase]);

    if (!editedTC) return null;

    const handleSave = () => {
        onSave(editedTC);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Test Case: ${editedTC.id}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input type="text" value={editedTC.title} onChange={e => setEditedTC({ ...editedTC, title: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preconditions</label>
                    <textarea value={editedTC.preconditions} onChange={e => setEditedTC({ ...editedTC, preconditions: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"/>
                </div>
                <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select value={editedTC.status} onChange={e => setEditedTC({ ...editedTC, status: e.target.value as TestCaseStatus })} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            {Object.values(TestCaseStatus).map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                        <select value={editedTC.priority} onChange={e => setEditedTC({ ...editedTC, priority: e.target.value as Priority })} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            {Object.values(Priority).map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                        <select value={editedTC.severity} onChange={e => setEditedTC({ ...editedTC, severity: e.target.value as Severity })} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            {Object.values(Severity).map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea 
                        value={editedTC.description || ''} 
                        onChange={e => setEditedTC({ ...editedTC, description: e.target.value })} 
                        rows={2}
                        className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder="Describe objective..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
                    <textarea 
                        value={editedTC.steps} 
                        onChange={setEditedTC ? (e => setEditedTC({ ...editedTC, steps: e.target.value })) : undefined} 
                        rows={8}
                        className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Enter test steps..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Result</label>
                    <textarea 
                        value={editedTC.expectedResult} 
                        onChange={e => setEditedTC({ ...editedTC, expectedResult: e.target.value })} 
                        rows={4}
                        className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Expected result..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actual Result</label>
                    <textarea 
                        value={editedTC.actualResult || ''} 
                        onChange={e => setEditedTC({ ...editedTC, actualResult: e.target.value })} 
                        rows={4}
                        className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Record execution outcome..."
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm">Save Changes</button>
                </div>
            </div>
        </Modal>
    );
};

const ReviewTab: React.FC<{
    testCases: TestCase[],
    paginatedTestCases: TestCase[],
    onEdit: (tc: TestCase) => void,
    onDelete: (id: string) => void,
    filters: any,
    setFilters: any,
    pagination: any,
    setPagination: any,
    onSearchBlur: () => void,
    onSearchKey: (e: React.KeyboardEvent) => void
}> = ({ testCases, paginatedTestCases, onEdit, onDelete, filters, setFilters, pagination, setPagination, onSearchBlur, onSearchKey }) => {
    
    const totalPages = Math.ceil(testCases.length / pagination.itemsPerPage);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={filters.searchTerm} 
                    onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
                    onBlur={onSearchBlur}
                    onKeyDown={onSearchKey}
                    className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                />
                <select value={filters.statusFilter} onChange={e => setFilters({...filters, statusFilter: e.target.value})} className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>All Statuses</option>
                    {Object.values(TestCaseStatus).map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filters.priorityFilter} onChange={e => setFilters({...filters, priorityFilter: e.target.value})} className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>All Priorities</option>
                    {Object.values(Priority).map(p => <option key={p}>{p}</option>)}
                </select>
                <select value={filters.severityFilter} onChange={e => setFilters({...filters, severityFilter: e.target.value})} className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>All Severities</option>
                    {Object.values(Severity).map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Requirement ID</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Priority</th>
                            <th className="px-6 py-3">Severity</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedTestCases.map(tc => (
                            <tr key={tc.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tc.id}</td>
                                <td className="px-6 py-4 max-w-sm truncate">{tc.title}</td>
                                <td className="px-6 py-4 font-mono text-xs">{tc.requirementId}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase">
                                        {tc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{tc.priority}</td>
                                <td className="px-6 py-4">{tc.severity}</td>
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <button onClick={() => onEdit(tc)} className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors"><EditIcon /></button>
                                    <button onClick={() => onDelete(tc.id)} className="text-red-500 hover:text-red-700 transition-colors"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4">
                    <button onClick={() => setPagination({...pagination, currentPage: Math.max(1, pagination.currentPage - 1)})} disabled={pagination.currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md disabled:opacity-50">Previous</button>
                    <span className="text-gray-600 dark:text-gray-400">Page {pagination.currentPage} of {totalPages}</span>
                    <button onClick={() => setPagination({...pagination, currentPage: Math.min(totalPages, pagination.currentPage + 1)})} disabled={pagination.currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

const GenerateTab: React.FC<{ requirements: Requirement[], onGenerate: (ids: string[]) => Promise<void> }> = ({ requirements, onGenerate }) => {
    const [selectedReqs, setSelectedReqs] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [priorityFilter, setPriorityFilter] = useState('All Priorities');
    const [isGenerating, setIsGenerating] = useState(false);

    const unmappedRequirements = useMemo(() => {
        return requirements
            .filter(r => r.status === RequirementStatus.Unmapped)
            .filter(r => typeFilter === 'All Types' || r.type === typeFilter)
            .filter(r => priorityFilter === 'All Priorities' || r.priority === priorityFilter);
    }, [requirements, typeFilter, priorityFilter]);

    const functionalUnmappedReqs = useMemo(() => {
        return unmappedRequirements.filter(r => r.type === RequirementType.Functional);
    }, [unmappedRequirements]);

    const areAllFunctionalSelected = useMemo(() => {
        if (functionalUnmappedReqs.length === 0) return false;
        return functionalUnmappedReqs.every(r => selectedReqs.has(r.id));
    }, [functionalUnmappedReqs, selectedReqs]);

    const handleSelectAllFunctional = (e: React.ChangeEvent<HTMLInputElement>) => {
        const functionalIds = functionalUnmappedReqs.map(r => r.id);
        const newSelection = new Set(selectedReqs);
        if (e.target.checked) functionalIds.forEach(id => newSelection.add(id));
        else functionalIds.forEach(id => newSelection.delete(id));
        setSelectedReqs(newSelection);
    };

    const handleSelect = (id: string) => {
        const newSelection = new Set(selectedReqs);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedReqs(newSelection);
    };

    const handleGenerate = async () => {
        if (isGenerating || selectedReqs.size === 0) return;
        setIsGenerating(true);
        try {
            await onGenerate(Array.from(selectedReqs));
            setSelectedReqs(new Set());
        } catch (e) {
            console.error('Generation failed', e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <option>All Types</option>
                        {Object.values(RequirementType).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <option>All Priorities</option>
                        {Object.values(Priority).map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={selectedReqs.size === 0 || isGenerating} 
                    className="flex justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed min-w-[210px] transition-colors shadow-sm"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                        </>
                    ) : (
                        `Generate Test Case(s) (${selectedReqs.size})`
                    )}
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">
                                <input
                                    type="checkbox"
                                    checked={areAllFunctionalSelected}
                                    onChange={handleSelectAllFunctional}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
                                    title="Select Functional"
                                />
                            </th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Text</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {unmappedRequirements.map(req => (
                            <tr key={req.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="p-4"><input type="checkbox" checked={selectedReqs.has(req.id)} onChange={() => handleSelect(req.id)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded" /></td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{req.id}</td>
                                <td className="px-6 py-4 max-w-md truncate">{req.text}</td>
                                <td className="px-6 py-4">{req.type}</td>
                                <td className="px-6 py-4">{req.priority}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const PrintableReport: React.FC<{ testCases: TestCase[] }> = ({ testCases }) => {
    return (
        <div id="pdf-export-area" className="hidden print:block bg-white p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Test Case Report</h1>
            {testCases.map(tc => (
                <div key={tc.id} className="test-case-for-print">
                    <h3>{tc.id}: {tc.title}</h3>
                    {tc.description && (
                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                            {tc.description}
                        </p>
                    )}
                    <table>
                        <tbody>
                            <tr><td className="font-bold w-1/4">Requirement ID</td><td>{tc.requirementId}</td></tr>
                            <tr><td className="font-bold">Status</td><td>{tc.status}</td></tr>
                            <tr><td className="font-bold">Priority</td><td>{tc.priority}</td></tr>
                            <tr><td className="font-bold">Severity</td><td>{tc.severity}</td></tr>
                            <tr><td className="font-bold">Preconditions</td><td>{tc.preconditions}</td></tr>
                        </tbody>
                    </table>
                    <h4 className="font-semibold mt-4 mb-2">Execution Details</h4>
                    <table>
                        <thead>
                            <tr>
                                <th className="w-1/3">Steps</th>
                                <th className="w-1/3">Expected Result</th>
                                <th className="w-1/3">Actual Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="whitespace-pre-wrap align-top">{tc.steps}</td>
                                <td className="whitespace-pre-wrap align-top">{tc.expectedResult}</td>
                                <td className="whitespace-pre-wrap align-top">{tc.actualResult || 'Not executed.'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

const TestCases: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('Review Test Cases');
    const { requirements, testCases, updateTestCase, deleteTestCase, generateTestCases, addRecentSearch } = useProject();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTC, setSelectedTC] = useState<TestCase | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [tcToDelete, setTcToDelete] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        searchTerm: '',
        statusFilter: 'All Statuses',
        priorityFilter: 'All Priorities',
        severityFilter: 'All Severities'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });

    const filteredTestCases = useMemo(() => {
        return testCases
            .filter(tc => tc.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) || tc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()))
            .filter(tc => filters.statusFilter === 'All Statuses' || tc.status === filters.statusFilter)
            .filter(tc => filters.priorityFilter === 'All Priorities' || tc.priority === filters.priorityFilter)
            .filter(tc => filters.severityFilter === 'All Severities' || tc.severity === filters.severityFilter);
    }, [testCases, filters]);

    const paginatedTestCases = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        return filteredTestCases.slice(startIndex, startIndex + pagination.itemsPerPage);
    }, [filteredTestCases, pagination]);

    const handleEditClick = (tc: TestCase) => {
        setSelectedTC(tc);
        setIsModalOpen(true);
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    const handleExportJSON = () => {
        const jsonContent = JSON.stringify(filteredTestCases, null, 2);
        downloadFile(jsonContent, 'test-cases.json', 'application/json');
        setIsExportMenuOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['id', 'title', 'description', 'requirementId', 'status', 'priority', 'severity', 'preconditions', 'steps', 'expectedResult', 'actualResult'];
        const csvRows = [headers.join(',')];
        filteredTestCases.forEach(tc => {
            const values = [
                tc.id,
                `"${(tc.title || '').replace(/"/g, '""')}"`,
                `"${(tc.description || '').replace(/"/g, '""')}"`,
                tc.requirementId,
                tc.status,
                tc.priority,
                tc.severity,
                `"${(tc.preconditions || '').replace(/"/g, '""')}"`,
                `"${(tc.steps || '').replace(/"/g, '""')}"`,
                `"${(tc.expectedResult || '').replace(/"/g, '""')}"`,
                `"${(tc.actualResult || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(values.join(','));
        });
        downloadFile(csvRows.join('\n'), 'test-cases.csv', 'text/csv');
        setIsExportMenuOpen(false);
    };
    
    const handleExportPDF = () => window.print();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-md space-y-4 border border-gray-100 dark:border-transparent transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveSubTab('Review Test Cases')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'Review Test Cases' ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
                        Review Test Cases
                    </button>
                    <button onClick={() => setActiveSubTab('Generate')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'Generate' ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
                        Generate
                    </button>
                </nav>
                {activeSubTab === 'Review Test Cases' && (
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <PdfIcon /> Export to PDF
                        </button>
                         <div className="relative">
                            <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm">
                                <ExportIcon /> Export Data
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600 overflow-hidden">
                                    <a onClick={handleExportCSV} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">as CSV</a>
                                    <a onClick={handleExportJSON} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">as JSON</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div>
                {activeSubTab === 'Review Test Cases' && (
                    <ReviewTab
                        testCases={filteredTestCases}
                        paginatedTestCases={paginatedTestCases}
                        onEdit={handleEditClick}
                        onDelete={setTcToDelete}
                        filters={filters}
                        setFilters={setFilters}
                        pagination={pagination}
                        setPagination={setPagination}
                        onSearchBlur={() => addRecentSearch(filters.searchTerm)}
                        onSearchKey={e => e.key === 'Enter' && addRecentSearch(filters.searchTerm)}
                    />
                )}
                {activeSubTab === 'Generate' && <GenerateTab requirements={requirements} onGenerate={generateTestCases} />}
            </div>
            <EditTestCaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                testCase={selectedTC}
                onSave={updateTestCase}
            />
            <PrintableReport testCases={filteredTestCases} />
            
            <ConfirmationModal
                isOpen={!!tcToDelete}
                onClose={() => setTcToDelete(null)}
                onConfirm={() => tcToDelete && deleteTestCase(tcToDelete)}
                title="Confirm Test Case Deletion"
                message="Are you sure you want to delete this test case? This action cannot be undone."
            />
        </div>
    );
};

export default TestCases;
