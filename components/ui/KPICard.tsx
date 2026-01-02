
import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon }) => {
    return (
        <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-6 flex items-center justify-between transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-900 hover:shadow-md">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{title}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
            </div>
            <div className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
        </div>
    );
};
