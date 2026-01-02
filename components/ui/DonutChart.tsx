
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
    data: { name: string; value: number }[];
    colors: string[];
    title: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, colors, title }) => {
    const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

    // If no data, show a placeholder or empty state to prevent chart errors
    const hasData = data.length > 0 && totalValue > 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-md h-full transition-colors duration-300 border border-slate-100 dark:border-slate-800 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
            <div className="flex-1 w-full min-h-[300px] relative" style={{ minWidth: 0 }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="focus:outline-none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: number) => [`${value} (${((value / totalValue) * 100).toFixed(1)}%)`, 'Value']}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 italic text-sm">
                        No data available to display
                    </div>
                )}
            </div>
        </div>
    );
};
