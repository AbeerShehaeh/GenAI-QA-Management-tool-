
import React from 'react';
import { useProject } from '../context/ProjectContext';
import { KPICard } from '../components/ui/KPICard';
import { DonutChart } from '../components/ui/DonutChart';
import { KpiReqIcon, KpiTCIcon, KpiCoverageIcon, KpiApprovedIcon } from '../components/icons/Icons';
import { DONUT_CHART_COLORS, DONUT_CHART_COLORS_REQ } from '../constants';

const Dashboard: React.FC = () => {
    const { kpis, requirementCoverageData, testCaseStatusData } = useProject();

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <header>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Project Overview</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time quality metrics and traceability progress.</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Requirements" value={kpis.totalRequirements} icon={<KpiReqIcon />} />
                <KPICard title="Generated Tests" value={kpis.testCasesGenerated} icon={<KpiTCIcon />} />
                <KPICard title="Traceability Coverage" value={`${kpis.overallCoverage}%`} icon={<KpiCoverageIcon />} />
                <KPICard title="Approved Tests" value={kpis.approvedTestCases} icon={<KpiApprovedIcon />} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Coverage Analysis</h3>
                    <DonutChart title="Requirement Coverage" data={requirementCoverageData} colors={DONUT_CHART_COLORS_REQ} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Testing Pipeline</h3>
                    <DonutChart title="Test Case Status" data={testCaseStatusData} colors={DONUT_CHART_COLORS} />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
