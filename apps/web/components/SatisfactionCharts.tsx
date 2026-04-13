'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface StatsData {
    averages: {
        workshopClarity: number;
        materialQuality: number;
        learningInterest: number;
        supportRating: number;
        experienceRating: number;
        teacherRating: number;
    };
    totalResponses: number;
    impact: Array<{ name: string; value: number }>;
    learnings: string[];
}

const COLORS = ['#00426B', '#0070BA', '#93C5FD', '#F59E0B'];

export default function SatisfactionCharts({ data }: { data: StatsData }) {
    if (!data || data.totalResponses === 0) {
        return (
            <div className="bg-white border-2 border-gray-100 p-12 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hi ha dades de satisfacció disponibles encara.</p>
            </div>
        );
    }

    const barData = [
        { name: 'Interès', value: data.averages.learningInterest },
        { name: 'Claredat', value: data.averages.workshopClarity },
        { name: 'Material', value: data.averages.materialQuality },
        { name: 'Acompanyament', value: data.averages.supportRating },
        { name: 'Global', value: data.averages.experienceRating },
        { name: 'Docent', value: data.averages.teacherRating },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Averages */}
            <div className="bg-white border-2 border-gray-100 p-8 shadow-sm">
                <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-8 border-l-4 border-[#00426B] pl-4">
                    Valoracions de Qualitat (sobre 10)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }}
                            />
                            <YAxis 
                                domain={[0, 10]} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#F9FAFB' }}
                                contentStyle={{ borderRadius: '0', border: '2px solid #F3F4F6', fontSize: '12px', fontWeight: '800' }}
                            />
                            <Bar dataKey="value" fill="#00426B" radius={[0, 0, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Impact */}
            <div className="bg-white border-2 border-gray-100 p-8 shadow-sm">
                <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-8 border-l-4 border-[#00426B] pl-4">
                    Impacte Vocacional
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.impact}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.impact.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                                wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Learnings / Comments */}
            <div className="lg:col-span-2 bg-white border-2 border-gray-100 p-8 shadow-sm">
                <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-8 border-l-4 border-[#00426B] pl-4">
                    Feedback Directe de l&apos;Alumnat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.learnings.length > 0 ? (
                        data.learnings.map((text, i) => (
                            <div key={i} className="bg-gray-50 p-6 border border-gray-100 relative">
                                <span className="absolute top-2 right-4 text-4xl text-gray-200 font-serif leading-none italic">&quot;</span>
                                <p className="text-[13px] font-medium text-gray-600 line-clamp-4 italic">
                                    {text}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center col-span-full py-12">Encara no s&apos;han rebut comentaris detallats.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
