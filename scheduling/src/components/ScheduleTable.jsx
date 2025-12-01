import React from 'react';
import Icon from './Icon';
import { ROLES } from '../constants/roles';
import { SHIFT_TYPES, EMPLOYEE_SHIFTS_COLUMNS } from '../constants/shifts';
import { getShiftLabel, getShiftMemo } from '../utils/dataUtils';

/**
 * 排班表格元件
 * 顯示整月的排班資訊，支援點擊單元格進行排班
 */
const ScheduleTable = ({
    currentMonthDays,
    employees,
    schedule,
    visibleShifts,
    onCellClick,
    onMajorShiftClick,
    highlightedEmpId,
    currentMonth
}) => {
    // 取得排班資料
    const getScheduleData = (dateKey, empId, shiftType) => {
        const key = `${dateKey}_${empId}_${shiftType}`;
        return schedule[key];
    };

    // 格式化顯示
    const formatShiftDisplay = (shiftData) => {
        // 未排班：顯示空白，背景白色
        if (!shiftData) return { display: '', className: 'bg-white', memo: '' };

        const label = getShiftLabel(shiftData);
        const memo = getShiftMemo(shiftData);

        // OFF (未確認休假/預設休假)：顯示空白，背景白色
        if (label === 'OFF') {
            return { display: '', className: 'bg-white', memo };
        }

        if (label === 'OFF_CONFIRMED') {
            return { display: 'OFF', className: 'bg-red-200 text-red-800 font-bold print:bg-white', memo };
        }

        // 解析 "MORNING / 8-12 / 83診"
        const parts = label.split(' / ');
        if (parts.length === 3) {
            const session = parts[2];
            const timeSlot = parts[1];
            const shiftType = parts[0];

            let className = SHIFT_TYPES[shiftType]?.color || 'bg-blue-100 text-blue-700';

            return {
                display: (
                    <div className="text-center">
                        <div className="font-semibold text-xs print:text-[10px] leading-none mb-0.5 print:mb-0">{session}</div>
                        <div className="text-[10px] print:text-[9px] print:font-medium opacity-75 print:opacity-100 print:text-slate-900 leading-none">{timeSlot}</div>
                    </div>
                ),
                className: `${className} font-medium print:bg-white`,
                memo
            };
        }

        return { display: label, className: 'bg-slate-100 text-slate-700 print:bg-white', memo };
    };

    // 取得主診/時段顯示內容
    const getMainShiftDisplay = (emp) => {
        if (!emp.majorShift || emp.majorShift === 'NONE') {
            return <span className="text-slate-400 text-[11px]">未設定</span>;
        }

        let timeLabel = '';
        if (emp.majorShift === 'FULL') timeLabel = "(8-4')";
        else if (emp.majorShift === 'MORNING') timeLabel = "(8-12)";
        else if (emp.majorShift === 'AFTERNOON') timeLabel = "(1-5)";
        else timeLabel = `(${emp.majorShift})`; // Fallback: 直接顯示值

        return (
            <div className="flex flex-col items-center justify-center">
                {emp.mainSessionId && (
                    <span className="text-sm print:text-[10px] font-bold text-[#a21caf] leading-tight">
                        {emp.mainSessionId}
                    </span>
                )}
                <span className="text-xs print:text-[9px] font-medium text-[#0f766e] leading-tight mt-0.5">
                    {timeLabel}
                </span>
            </div>
        );
    };

    // 過濾可見班別
    const visibleShiftColumns = EMPLOYEE_SHIFTS_COLUMNS.filter(col => visibleShifts.includes(col.type));

    return (
        <div className="overflow-x-auto custom-scrollbar bg-white">
            <table className="grid-table w-full border-collapse">
                <thead>
                    {/* 第一層表頭：員工 + 主診/時段 + 日期 */}
                    <tr className="bg-slate-100 border-b border-slate-300">
                        {/* 員工欄位 (固定) */}
                        <th rowSpan={2} className="grid-cell sticky left-0 bg-slate-50 z-30 font-bold text-slate-600 w-24 border-r-2 border-slate-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            員工
                        </th>
                        {/* 主診/時段欄位 (固定) */}
                        <th rowSpan={2} className="grid-cell sticky left-24 bg-sky-50 z-30 font-bold text-teal-700 w-24 print:w-16 border-r-2 border-slate-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:text-[10px] major-shift-col">
                            主診/時段
                        </th>

                        {/* 日期欄位 */}
                        {currentMonthDays.map(day => {
                            const isSunday = day.dayOfWeek === 0;
                            const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();
                            const dayName = day.date.toLocaleDateString('zh-TW', { weekday: 'short' }).replace('週', '');

                            return (
                                <th
                                    key={day.dateKey}
                                    colSpan={isSunday ? 1 : visibleShiftColumns.length}
                                    className={`grid-cell border-r-2 border-slate-400 ${isSunday
                                        ? (isCurrentMonth ? 'bg-red-100 text-red-800 sunday-cell' : 'bg-red-50 text-red-300 sunday-cell')
                                        : (isCurrentMonth ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-400')
                                        }`}
                                    style={{ height: '30px' }}
                                >
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <span className="text-sm font-bold">{day.dayNumber}</span>
                                        <span className="text-[11px] opacity-75">{dayName}</span>
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                    {/* 第二層表頭：班別 (早/午/晚) */}
                    <tr className="bg-slate-50 border-b border-slate-300">
                        {currentMonthDays.map(day => {
                            const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();

                            if (day.dayOfWeek === 0) {
                                return <th key={`sub-${day.dateKey}`} className={`grid-cell border-r-2 border-slate-400 sunday-cell ${isCurrentMonth ? 'bg-red-50' : 'bg-slate-100'}`} style={{ height: '24px' }}></th>;
                            }
                            return visibleShiftColumns.map(col => (
                                <th
                                    key={`sub-${day.dateKey}-${col.type}`}
                                    className={`grid-cell text-[11px] font-medium border-r border-slate-300 ${isCurrentMonth ? 'bg-white text-slate-500' : 'bg-slate-50 text-slate-300'}`}
                                    style={{ height: '24px', width: '60px' }}
                                >
                                    {col.label}
                                </th>
                            ));
                        })}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.id} className={`transition-colors border-b border-slate-200 group ${highlightedEmpId === emp.id ? 'bg-yellow-50' : ''}`}>
                            {/* 員工姓名 (固定) */}
                            <td className={`grid-cell sticky left-0 z-20 font-semibold border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors ${highlightedEmpId === emp.id
                                ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                                : 'bg-white text-slate-800 group-hover:bg-blue-50'
                                }`}>
                                <div className="flex flex-col items-center justify-center px-1 py-2">
                                    <span className="truncate w-full text-center text-sm">{emp.name}</span>
                                    <span className={`text-[10px] ${highlightedEmpId === emp.id
                                        ? 'text-yellow-700'
                                        : emp.role === '半職'
                                            ? 'text-purple-600 font-medium'
                                            : emp.role === '支援'
                                                ? 'text-orange-600 font-medium'
                                                : 'text-slate-400'
                                        }`}>({emp.role})</span>
                                </div>
                            </td>

                            {/* 主診/時段 (固定) - 可點擊設定 */}
                            <td
                                className="grid-cell sticky left-24 bg-sky-50/30 z-20 border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] cursor-pointer transition-colors print:w-16 major-shift-col"
                                onClick={() => onMajorShiftClick && onMajorShiftClick(emp)}
                                title="點擊設定主要班別與診次"
                            >
                                {getMainShiftDisplay(emp)}
                            </td>

                            {/* 排班格子 */}
                            {currentMonthDays.map(day => {
                                const isSunday = day.dayOfWeek === 0;
                                const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();

                                if (isSunday) {
                                    return (
                                        <td
                                            key={`${day.dateKey}-${emp.id}`}
                                            className={`grid-cell border-r border-slate-300 sunday-cell ${isCurrentMonth ? 'bg-red-50' : 'bg-slate-100'}`}
                                        >
                                            <span className={`sunday-text text-xs ${isCurrentMonth ? 'text-red-300' : 'text-slate-300'}`}>R</span>
                                        </td>
                                    );
                                }

                                return visibleShiftColumns.map(col => {
                                    const shiftData = getScheduleData(day.dateKey, emp.id, col.type);
                                    const { display, className, memo } = formatShiftDisplay(shiftData);

                                    // 如果非當前月份，強制覆蓋樣式並禁用點擊
                                    const finalClassName = isCurrentMonth
                                        ? className
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed';

                                    const finalDisplay = isCurrentMonth ? display : (display ? <span className="opacity-50 grayscale">{display}</span> : '');

                                    return (
                                        <td
                                            key={`${day.dateKey}-${emp.id}-${col.type}`}
                                            className={`grid-cell transition-all border-r border-slate-200 ${finalClassName} ${isCurrentMonth ? 'cursor-pointer' : ''}`}
                                            onClick={() => {
                                                if (isCurrentMonth) {
                                                    onCellClick(day.dateKey, day.date.toLocaleDateString('zh-TW'), emp.id, emp.name, col.type, emp.skills || []);
                                                }
                                            }}
                                            title={isCurrentMonth ? (memo || '點擊編輯排班') : '非當前排班月份，請切換月份以編輯'}
                                        >
                                            {finalDisplay}
                                            {memo && isCurrentMonth && (
                                                <div className="text-[10px] text-slate-600 mt-0.5 truncate max-w-full px-0.5 leading-tight">
                                                    {memo}
                                                </div>
                                            )}
                                        </td>
                                    );
                                });
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleTable;
