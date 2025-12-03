import React, { useState, useEffect } from 'react';
import Icon from './Icon';

/**
 * 月份選擇模態框
 * 提供美觀的介面讓使用者切換年份與月份
 */
const MonthSelectionModal = ({ isOpen, onClose, currentMonth, onMonthChange }) => {
    const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.getMonth());

    // 當 modal 打開時，重置為當前選中的月份
    useEffect(() => {
        if (isOpen) {
            setSelectedYear(currentMonth.getFullYear());
            setSelectedMonth(currentMonth.getMonth());
        }
    }, [isOpen, currentMonth]);

    const months = [
        '一月', '二月', '三月', '四月',
        '五月', '六月', '七月', '八月',
        '九月', '十月', '十一月', '十二月'
    ];

    const handlePrevYear = () => setSelectedYear(prev => prev - 1);
    const handleNextYear = () => setSelectedYear(prev => prev + 1);

    const handleMonthClick = (index) => {
        setSelectedMonth(index);
    };

    const handleConfirm = () => {
        const newDate = new Date(selectedYear, selectedMonth, 1);
        onMonthChange(newDate);
        onClose();
    };

    const handleJumpToSchedulingMonth = () => {
        const today = new Date();
        // 跳轉到下個月 (排班月)
        onMonthChange(new Date(today.getFullYear(), today.getMonth() + 1, 1));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Icon name="Calendar" size={20} />
                            切換月份
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <Icon name="X" size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                        <button
                            onClick={handlePrevYear}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                        >
                            <Icon name="ChevronLeft" size={20} />
                        </button>
                        <span className="text-2xl font-bold tracking-wide font-mono">{selectedYear}</span>
                        <button
                            onClick={handleNextYear}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                        >
                            <Icon name="ChevronRight" size={20} />
                        </button>
                    </div>
                </div>

                {/* Month Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-3 gap-3">
                        {months.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => handleMonthClick(index)}
                                className={`
                                    py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                    ${selectedMonth === index
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 font-bold'
                                        : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-200'
                                    }
                                `}
                            >
                                {month}
                                {selectedMonth === index && (
                                    <span className="absolute inset-0 bg-white/10 rounded-xl"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <button
                        onClick={handleJumpToSchedulingMonth}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                    >
                        回到排班月
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg active:translate-y-0.5"
                        >
                            確認
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthSelectionModal;
