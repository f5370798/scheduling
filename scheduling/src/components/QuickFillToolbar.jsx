import React, { useState } from 'react';
import Icon from './Icon';

/**
 * 快速填寫工具列 (平板優先設計)
 * 提供快速切換填寫模式的功能
 */
const QuickFillToolbar = ({ activeTool, onToolChange }) => {
    const tools = [
        { id: 'SELECT', icon: 'MousePointer2', label: '選取', color: 'bg-slate-600' },
        { id: 'PAINT', icon: 'PenTool', label: '填寫', color: 'bg-indigo-600' },
        { id: 'ERASER', icon: 'Eraser', label: '清除', color: 'bg-red-500' },
    ];

    const [isCollapsed, setIsCollapsed] = useState(false);

    const currentTool = tools.find(t => t.id === activeTool) || tools[0];

    return (
        <>
            {/* 收合狀態 (小 Bar) */}
            <div
                onClick={() => setIsCollapsed(false)}
                className={`
                    fixed bottom-6 right-6 z-50 print:hidden
                    flex gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full 
                    cursor-pointer shadow-md border border-white/40 group
                    transition-all duration-300 ease-in-out origin-bottom-right
                    ${isCollapsed
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-50 translate-y-4 pointer-events-none'}
                `}
                title="點擊展開工具列"
            >
                {tools.map(tool => {
                    const isActive = activeTool === tool.id;
                    return (
                        <div
                            key={tool.id}
                            className={`
                                h-1.5 rounded-full transition-all duration-300
                                ${isActive ? tool.color : 'bg-slate-300'}
                                ${isActive ? 'w-12 shadow-sm' : 'w-6 opacity-50 group-hover:opacity-80'} 
                            `}
                        />
                    );
                })}
            </div>

            {/* 展開狀態 (完整工具列) */}
            <div
                className={`
                    fixed bottom-6 right-6 z-50 print:hidden
                    flex flex-col items-end
                    transition-all duration-300 ease-in-out origin-bottom-right
                    ${!isCollapsed
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-75 translate-y-8 pointer-events-none'}
                `}
            >
                {/* 收合按鈕 */}
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="mb-2 bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-700 hover:bg-white w-16 h-6 rounded-full shadow-md border border-white/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="收合工具列"
                >
                    <Icon name="ChevronDown" size={16} />
                </button>

                <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl backdrop-brightness-95 p-3 rounded-2xl shadow-2xl border border-white/30">
                    {tools.map((tool) => {
                        const isActive = activeTool === tool.id;

                        return (
                            <button
                                key={tool.id}
                                onClick={() => onToolChange(tool.id)}
                                className={`
                                    relative flex flex-col items-center justify-center w-20 h-20 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? `${tool.color} text-white shadow-lg scale-110 -translate-y-2`
                                        : 'bg-white/40 backdrop-blur-sm text-slate-700 hover:bg-white/60 hover:scale-105'
                                    }
                                `}
                            >
                                <Icon name={tool.icon} size={32} className="mb-1.5" />
                                <span className="text-xs font-bold tracking-wider">{tool.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default QuickFillToolbar;
