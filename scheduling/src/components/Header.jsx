import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import ExportMenu from './ExportMenu';
import { getWeekOfMonth } from '../utils/dataUtils';

/**
 * 頂部導航列元件
 * 包含：標題、月份切換、週次導航、Undo/Redo、檢查漏排、排序、匯出選單
 */
const Header = ({
    currentMonth,
    currentWeekStart,
    onOpenMonthSelector,
    onPreviousWeek,
    onNextWeek,
    onResetWeek,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onCheckMissingShifts,
    onOpenReorderModal,
    onExportJSON,
    onImportJSON,
    onExportPDF,
    onExportIndividual,
    children
}) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuContainerRef = useRef(null);

    // 點擊外部關閉匯出選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuContainerRef.current && !exportMenuContainerRef.current.contains(event.target)) {
                setIsExportMenuOpen(false);
            }
        };

        if (isExportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

    return (
        <header className="sticky top-0 bg-white/30 backdrop-blur-xl backdrop-brightness-95 border-b border-white/30 shrink-0 z-40 h-14 flex items-center px-4 justify-between shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                    <Icon name="Calendar" size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 leading-none">外科門診排班系統</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">當前排班月份：<span className="text-indigo-600 font-bold">{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span></p>
                        <button
                            onClick={onOpenMonthSelector}
                            className="text-xs bg-white/30 hover:bg-white/50 text-slate-700 px-2 py-1 rounded border border-white/30 transition-all active:scale-95 flex items-center gap-1"
                        >
                            <Icon name="Calendar" size={12} /> 切換月份
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* 週次導航 */}
                <div className="flex items-center bg-white/30 rounded border border-white/30 p-0.5">
                    <button
                        onClick={onPreviousWeek}
                        className="p-2 hover:bg-white hover:shadow-sm rounded transition-all active:scale-95 text-slate-600"
                        title="上一週"
                    >
                        <Icon name="ChevronLeft" size={18} />
                    </button>
                    <button
                        onClick={onResetWeek}
                        className="px-4 text-base font-bold text-slate-700 min-w-[110px] text-center hover:text-indigo-600 transition-colors"
                        title="回到本月第一週"
                    >
                        {`第${getWeekOfMonth(currentWeekStart, currentMonth)}週`}
                    </button>
                    <button
                        onClick={onNextWeek}
                        className="p-2 hover:bg-white hover:shadow-sm rounded transition-all active:scale-95 text-slate-600"
                        title="下一週"
                    >
                        <Icon name="ChevronRight" size={18} />
                    </button>
                </div>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                {/* Undo/Redo 按鈕 */}
                <div className="flex items-center bg-white/30 rounded border border-white/30 p-0.5 mr-2">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-2 rounded transition-all active:scale-95 ${canUndo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
                        title="復原 (Ctrl+Z)"
                    >
                        <Icon name="Undo2" size={18} />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-2 rounded transition-all active:scale-95 ${canRedo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
                        title="重做 (Ctrl+Y)"
                    >
                        <Icon name="Redo2" size={18} />
                    </button>
                </div>

                <button
                    onClick={onCheckMissingShifts}
                    className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                    <Icon name="ClipboardList" size={16} /> 檢查漏排
                </button>

                <button
                    onClick={onOpenReorderModal}
                    className="px-4 py-2 bg-slate-600 text-white text-sm rounded hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                    <Icon name="List" size={16} /> 調整排序
                </button>

                {/* 匯出選單 */}
                <div className="relative" ref={exportMenuContainerRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                    >
                        <Icon name="Download" size={16} /> 匯出
                    </button>
                    {isExportMenuOpen && (
                        <ExportMenu
                            onExportJSON={onExportJSON}
                            onImportJSON={onImportJSON}
                            onExportPDF={onExportPDF}
                            onExportIndividual={onExportIndividual}
                            onClose={() => setIsExportMenuOpen(false)}
                        />
                    )}
                </div>

                {/* 額外內容 (如設定選單) */}
                {children}
            </div>
        </header>
    );
};

export default Header;
