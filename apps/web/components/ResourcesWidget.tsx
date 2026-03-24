'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Resource {
  id: string;
  title: string;
  category: string;
  url: string;
  icon: React.ReactNode;
}

const ResourcesWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resources: Resource[] = [
    {
      id: '1',
      title: "Guia d'ús del Coordinador",
      category: 'Manual',
      url: '#',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: '2',
      title: 'Catàleg de Tallers 2026',
      category: 'Documentació',
      url: '/admin/talleres',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: '3',
      title: 'Suport Tècnic',
      category: 'Contacte',
      url: 'mailto:suport@iter.cat',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all duration-300 border ${isOpen
            ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue'
            : 'bg-white text-gray-600 border-gray-300 hover:border-consorci-lightBlue hover:text-consorci-darkBlue'
          }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Recursos Útils
        <svg className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-gray-300 p-3 z-50 animate-in fade-in duration-300">
          <div className="space-y-1">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-300 group/item"
              >
                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-consorci-darkBlue group-hover/item:text-white transition-all">
                  {resource.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[13px] font-bold text-gray-900 leading-tight group-hover/item:text-consorci-darkBlue transition-colors">{resource.title}</h4>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-0.5">{resource.category}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesWidget;
