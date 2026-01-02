
import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { DonutChart } from '../components/ui/DonutChart';
import { DONUT_CHART_COLORS, DONUT_CHART_COLORS_REQ } from '../constants';

const Reports: React.FC = () => {
    const { kpis, requirementCoverageData, testCaseStatusData, testCases } = useProject();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const paginatedTestCases = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return testCases.slice(startIndex, startIndex + itemsPerPage);
    }, [testCases, currentPage]);
    
    const totalPages = Math.ceil(testCases.length / itemsPerPage);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-md space-y-6 border border-gray-100 dark:border-transparent transition-colors duration-300">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Execution Report</h2>
                <button onClick={handlePrint} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm">
                    Print Report / Export PDF
                </button>
            </div>
            
            <div id="print-area">
                <div className="p-4 bg-white dark:bg-gray-800">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Executive QA Summary</h2>
                    
                    {/* Executive Summary Cards */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-900 dark:text-white">Highlights</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-transparent">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Requirements</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.totalRequirements}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-transparent">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Test Cases</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.testCasesGenerated}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-transparent">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Coverage</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{kpis.overallCoverage}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <DonutChart title="Requirement Coverage" data={requirementCoverageData} colors={DONUT_CHART_COLORS_REQ} />
                        <DonutChart title="Test Case Status" data={testCaseStatusData} colors={DONUT_CHART_COLORS} />
                    </div>

                    {/* Detailed List */}
                    <div>
                        <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-900 dark:text-white">Detailed Matrix</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Req ID</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedTestCases.map(tc => (
                                        <tr key={tc.id} className="bg-white dark:bg-gray-800">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tc.id}</td>
                                            <td className="px-6 py-4 max-w-sm truncate">{tc.title}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{tc.requirementId}</td>
                                            <td className="px-6 py-4 text-xs">{tc.status}</td>
                                            <td className="px-6 py-4">{tc.priority}</td>
                                        </tr>
                                    ))}
                                    {paginatedTestCases.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-4 text-center">No data available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 print:hidden">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md disabled:opacity-50">Previous</button>
                                <span className="text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md disabled:opacity-50">Next</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
