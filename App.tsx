
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Requirements from './pages/Requirements';
import TestCases from './pages/TestCases';
import Traceability from './pages/Traceability';
import Reports from './pages/Reports';
import PostmanTestGenerator from './pages/PostmanTestGenerator';
import { Tab, ToastMessage } from './types';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { XIcon } from './components/icons/Icons';

// --- Toast Components ---

const Toast: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className={`relative rounded-md shadow-lg p-4 text-white ${bgColor} animate-fade-in-up`}>
            <div className="flex items-start">
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={onClose} className="inline-flex text-white rounded-md hover:text-gray-300 focus:outline-none">
                        <span className="sr-only">Close</span>
                        <XIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useProject();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};


// --- Main App Content ---

const AppContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Documents':
                return <Documents />;
            case 'Requirements':
                return <Requirements />;
            case 'Test Cases':
                return <TestCases />;
            case 'Traceability':
                return <Traceability />;
            case 'Reports':
                return <Reports />;
            case 'JS Code Test Generator':
                return <PostmanTestGenerator />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200 transition-colors duration-300">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header activeTab={activeTab} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scrollbar-hide">
                    {renderContent()}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}

// --- Main App Component ---

const App: React.FC = () => {
    return (
        <ProjectProvider>
            <AppContent />
        </ProjectProvider>
    );
};

export default App;
