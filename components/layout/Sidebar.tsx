
import React from 'react';
import { Tab } from '../../types';
import { DashboardIcon, DocumentIcon, RequirementIcon, TestCaseIcon, TraceabilityIcon, ReportIcon, CodeIcon, PostmanIcon } from '../icons/Icons';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: Tab;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full text-left transition-all duration-200 group
                        ${isActive 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
        >
            <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'} transition-colors`}>{icon}</span>
            <span className="ml-3">{label}</span>
        </button>
    </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const navItems: { label: Tab; icon: React.ReactNode }[] = [
        { label: 'Dashboard', icon: <DashboardIcon /> },
        { label: 'Documents', icon: <DocumentIcon /> },
        { label: 'Requirements', icon: <RequirementIcon /> },
        { label: 'Test Cases', icon: <TestCaseIcon /> },
        { label: 'Traceability', icon: <TraceabilityIcon /> },
        { label: 'Reports', icon: <ReportIcon /> },
        { label: 'JS Code Test Generator', icon: <PostmanIcon /> },
    ];

    return (
        <aside className="w-72 transition-colors duration-300" aria-label="Sidebar">
            <div className="flex flex-col h-full py-6 px-4 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="flex items-center px-4 mb-8">
                    <div className="bg-purple-600 p-1.5 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">GenAI Qa Tool</span>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map(({ label, icon }) => (
                            <NavItem
                                key={label}
                                label={label}
                                icon={icon}
                                isActive={activeTab === label}
                                onClick={() => setActiveTab(label)}
                            />
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto px-4 py-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                        <p className="text-[9px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                            Copyright © 2026 – <span className="font-bold text-slate-900 dark:text-white">GenAI Qa Tool</span>
                            <br />
                            <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500 opacity-80">Developed by Abeer Shehadeh | PoC Project</span>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};