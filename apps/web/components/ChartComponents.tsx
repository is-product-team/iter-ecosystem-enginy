'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';

import { REQUEST_STATUSES } from '@iter/shared';
 
// --- COMPONENTS ---
 
export const StatusDistribution = ({ data }: { data: { status: string, total: number }[] }) => {
    // Ensure we have the statuses even if they are zero
    const categories = Object.values(REQUEST_STATUSES);
    const chartData = categories.map(cat => {
        const found = data.find(d => d.status === cat);
        return {
            name: cat,
            total: found ? found.total : 0
        };
    });

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--text-muted)' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--text-muted)' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-primary)', borderRadius: '0px' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="total" radius={0} barSize={40}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--consorci-darkBlue)' : index === 1 ? 'var(--consorci-actionBlue)' : 'var(--text-muted)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WorkshopPopularity = ({ data }: { data: { _id: string, totalStudents: number }[] }) => {
    // Transform data: Use d._id directly as the name (backend provides title or fallback)
    const chartData = data.map(d => ({
        name: d._id,
        students: d.totalStudents
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--text-muted)' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--text-muted)' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-primary)', borderRadius: '0px' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', paddingTop: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey="students"
                        stroke="var(--consorci-darkBlue)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'var(--consorci-darkBlue)', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'var(--consorci-actionBlue)', strokeWidth: 0 }}
                        name="Number of Participants"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
