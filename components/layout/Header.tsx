
import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { SunIcon, MoonIcon } from '../icons/Icons';

interface HeaderProps {
    activeTab: Tab;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
    const { recentSearches, clearRecentSearches, addToast, theme, toggleTheme } = useProject();
    const [isRecentOpen, setIsRecentOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsRecentOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addToast(`Copied "${text}" to clipboard`, 'success');
            setIsRecentOpen(false);
        });
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-md p-4 print:hidden flex justify-between items-center transition-colors duration-300 border-b border-gray-200 dark:border-transparent">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{activeTab}</h1>
            
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>

                {/* Recent Searches Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsRecentOpen(!isRecentOpen)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recent Searches
                    </button>

                    {isRecentOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200 dark:border-gray-600 animate-fade-in-up">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Recent Queries</span>
                                {recentSearches.length > 0 && (
                                    <button 
                                        onClick={clearRecentSearches}
                                        className="text-[10px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold uppercase"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {recentSearches.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No recent searches
                                    </div>
                                ) : (
                                    recentSearches.map((item, idx) => (
                                        <button
                                            key={`${item.timestamp}-${idx}`}
                                            onClick={() => copyToClipboard(item.query)}
                                            className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600/50 flex justify-between items-center group transition-colors text-gray-800 dark:text-gray-200"
                                        >
                                            <span className="text-sm truncate mr-2" title={item.query}>{item.query}</span>
                                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
