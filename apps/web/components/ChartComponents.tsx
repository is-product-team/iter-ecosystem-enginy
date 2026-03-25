'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';

import { REQUEST_STATUSES } from '@iter/shared';
 
// --- COMPONENTS ---
 
export const StatusDistribution = ({ data }: { data: { estat: string, total: number }[] }) => {
    // Ensure we have the three categories even if they are zero
    const categories = Object.values(REQUEST_STATUSES);
    const chartData = categories.map(cat => {
        const found = data.find(d => d.estat === cat);
        return {
            name: cat,
            total: found ? found.total : 0
        };
    });

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #CFD2D3', fontSize: '11px' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4197CB' : index === 1 ? '#0775AB' : '#00426B'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WorkshopPopularity = ({ data }: { data: { _id: string, alumnes_totals: number }[] }) => {
    // Transform data: Use d._id directly as the name (backend provides title or fallback)
    const chartData = data.map(d => ({
        name: d._id,
        alumnes: d.alumnes_totals
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #CFD2D3', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey="alumnes"
                        stroke="#0775AB"
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#00426B', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#0775AB' }}
                        name="Nombre de Participants"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

