import React, { useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Icon from './Icon';
import { SHIFT_TYPES, EMPLOYEE_SHIFTS_COLUMNS } from '../constants/shifts';
import { getShiftLabel, getShiftMemo } from '../utils/dataUtils';

// ============ 子元件：可拖曳的班別內容 ============
// 使用 React.memo 優化渲染效能，避免父元件更新時不必要的重新渲染
const DraggableShift = React.memo(({ id, data, children, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: data,
        disabled: disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        touchAction: 'none', // 防止觸控捲動干擾拖曳
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-full h-full flex items-center justify-center">
            {children}
        </div>
    );
});

// ============ 子元件：可放置的格子 ============
// 使用 React.memo 優化渲染效能，只在 props 改變時才重新渲染
const DroppableCell = React.memo(({ id, data, children, className, onClick, title, isValid, highlightColor }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: data,
    });

    // 只有當 isOver 且 isValid 為 true 時才顯示高亮
    // 使用傳入的 highlightColor，若無則預設為 indigo
    const activeColor = highlightColor || 'bg-indigo-50 border-2 border-dashed border-indigo-500 z-10';
    // 注意：加入 z-10 確保邊框蓋過相鄰的格子
    const highlightClass = isOver && isValid ? activeColor : 'border-r border-slate-200';

    return (
        <td
            ref={setNodeRef}
            // 如果是高亮狀態，移除原本的 border-r 以免衝突，並加入 transition
            className={`${className.replace('border-r border-slate-200', '')} ${highlightClass}`}
            onClick={onClick}
            title={title}
        >
            {children}
        </td>
    );
});

/**
 * 排班表格元件 (支援拖曳)
 */
const ScheduleTable = ({
    currentMonthDays,
    employees,
    schedule,
    visibleShifts,
    onCellClick,
    onMajorShiftClick,
    highlightedEmpId,
    onEmployeeRowClick,
    currentMonth,
    activeTool = 'SELECT',
    onShiftMove // 新增：處理拖曳移動
}) => {
    const [activeDragId, setActiveDragId] = useState(null);
    const [dragData, setDragData] = useState(null);

    // 設定感測器
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // 滑鼠移動 10px 才開始拖曳，避免誤觸點擊
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // 長按 250ms 才開始拖曳
                tolerance: 5, // 容許手指微小移動
            },
        })
    );

    // 拖曳結束處理 (使用 useCallback 優化)
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveDragId(null);
        setDragData(null);

        if (over && active.id !== over.id) {
            // 呼叫父元件處理資料移動
            if (onShiftMove) {
                onShiftMove(active.data.current, over.data.current);
            }
        }
    }, [onShiftMove]);

    const handleDragStart = useCallback((event) => {
        setActiveDragId(event.active.id);
        setDragData(event.active.data.current);
    }, []);

    // 取得排班資料 (使用 useCallback 優化)
    const getScheduleData = useCallback((dateKey, empId, shiftType) => {
        const key = `${dateKey}_${empId}_${shiftType}`;
        return schedule[key];
    }, [schedule]);

    // 格式化顯示 (使用 useCallback 優化)
    const formatShiftDisplay = useCallback((shiftData) => {
        if (!shiftData) return { display: '', className: 'bg-white', memo: '' };

        const label = getShiftLabel(shiftData);
        const memo = getShiftMemo(shiftData);

        if (label === 'OFF') return { display: '', className: 'bg-white', memo };
        if (label === 'OFF_CONFIRMED') return { display: 'OFF', className: 'bg-red-200 text-red-800 font-bold print:bg-white', memo };

        const parts = label.split(' / ');
        if (parts.length === 3) {
            const session = parts[2].replace(/診/g, '');
            const timeSlot = parts[1];
            const shiftType = parts[0];
            let className = SHIFT_TYPES[shiftType]?.color || 'bg-blue-100 text-blue-700';

            return {
                display: (
                    <div className="text-center pointer-events-none"> {/* pointer-events-none 確保拖曳時不選取文字 */}
                        <div className="font-semibold text-xs print:text-[10px] leading-none mb-0.5 print:mb-0">{session}</div>
                        <div className="text-[10px] print:text-[9px] print:font-medium opacity-75 print:opacity-100 print:text-slate-900 leading-none">{timeSlot}</div>
                    </div>
                ),
                className: `${className} font-medium print:bg-white`,
                memo
            };
        }

        return { display: label, className: 'bg-slate-100 text-slate-700 print:bg-white', memo };
    }, []); // 不依賴任何 props，因為使用的都是工具函數

    // 取得主診/時段顯示內容 (使用 useCallback 優化)
    const getMainShiftDisplay = useCallback((emp) => {
        if (!emp.majorShift || emp.majorShift === 'NONE') {
            return <span className="text-slate-400 text-[11px]">未設定</span>;
        }
        let timeLabel = '';
        if (emp.majorShift === 'FULL') timeLabel = "(8-4')";
        else if (emp.majorShift === 'MORNING') timeLabel = "(8-12)";
        else if (emp.majorShift === 'AFTERNOON') timeLabel = "(1-5)";
        else timeLabel = `(${emp.majorShift})`;

        return (
            <div className="flex flex-col items-center justify-center">
                {emp.mainSessionId && (
                    <span className="text-sm print:text-[10px] font-bold text-[#a21caf] leading-tight">
                        {emp.mainSessionId.replace(/診/g, '')}
                    </span>
                )}
                <span className="text-xs print:text-[9px] font-medium text-[#0f766e] leading-tight mt-0.5">
                    {timeLabel}
                </span>
            </div>
        );
    }, []);

    const visibleShiftColumns = EMPLOYEE_SHIFTS_COLUMNS.filter(col => visibleShifts.includes(col.type));

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="overflow-x-auto custom-scrollbar bg-white">
                <table className="grid-table w-full border-collapse">
                    <thead>
                        {/* 第一層表頭：員工 + 主診/時段 + 日期 */}
                        <tr className="bg-slate-100 border-b border-slate-300">
                            {/* 員工欄位 (固定) - 加入 bg-clip-padding 和 min-w */}
                            <th rowSpan={2} className="grid-cell sticky left-0 print:static bg-slate-50 z-30 font-bold text-slate-600 w-24 min-w-[6rem] border-r-2 border-slate-300 bg-clip-padding">
                                員工
                            </th>
                            {/* 主診/時段欄位 (固定) - 加入 bg-clip-padding 和 min-w */}
                            <th rowSpan={2} className="grid-cell sticky left-24 print:static bg-sky-100 z-30 font-bold text-teal-700 w-24 min-w-[6rem] border-r-2 border-slate-300 print:text-[10px] major-shift-col bg-clip-padding">
                                主診/時段
                            </th>
                            {currentMonthDays.map(day => {
                                const isSunday = day.dayOfWeek === 0;
                                const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();
                                const dayName = day.date.toLocaleDateString('zh-TW', { weekday: 'short' }).replace('週', '');

                                return (
                                    <th
                                        key={day.dateKey}
                                        colSpan={isSunday ? 1 : visibleShiftColumns.length}
                                        className={`grid-cell border-r border-slate-400 ${isSunday
                                            ? (isCurrentMonth ? 'bg-red-100 text-red-800 sunday-cell' : 'bg-red-50 text-red-300 sunday-cell')
                                            : (isCurrentMonth ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-400')
                                            }`}
                                        style={{ height: '30px', width: isSunday ? '40px' : 'auto' }}
                                    >
                                        <div className="flex flex-col items-center justify-center leading-tight">
                                            <span className="text-sm font-bold">{day.dayNumber}</span>
                                            <span className="text-[11px] opacity-75">{dayName}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                        {/* 第二層表頭：班別 */}
                        <tr className="bg-slate-50 border-b border-slate-300">
                            {currentMonthDays.map(day => {
                                const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();
                                if (day.dayOfWeek === 0) {
                                    return <th key={`sub-${day.dateKey}`} className={`grid-cell border-r border-slate-400 sunday-cell ${isCurrentMonth ? 'bg-red-50' : 'bg-slate-100'}`} style={{ height: '24px', width: '40px' }}></th>;
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
                            <tr
                                key={emp.id}
                                className={`transition-colors border-b border-slate-200 group ${highlightedEmpId === emp.id ? '!bg-blue-50' : ''}`}
                                style={highlightedEmpId === emp.id ? { borderBottom: '3px solid #3b82f6', position: 'relative', zIndex: 10 } : {}}
                            >
                                {/* 員工內容 (固定) - 加入 bg-clip-padding 和 min-w */}
                                <td
                                    className={`grid-cell sticky left-0 print:static z-20 font-semibold border-r-2 border-slate-300 bg-clip-padding min-w-[6rem] transition-colors cursor-pointer ${highlightedEmpId === emp.id
                                        ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                                        : 'bg-white text-slate-800 group-hover:bg-blue-50'
                                        }`}
                                    onClick={() => onEmployeeRowClick?.(emp.id)}
                                    title="點擊高亮此員工列"
                                >
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

                                {/* 主診/時段內容 (固定) - 加入 bg-clip-padding 和 min-w */}
                                <td
                                    className="grid-cell sticky left-24 print:static bg-sky-50 z-20 border-r-2 border-slate-300 bg-clip-padding min-w-[6rem] cursor-pointer transition-colors print:w-16 major-shift-col text-center print:bg-white"
                                    onClick={() => onMajorShiftClick && onMajorShiftClick(emp)}
                                    title="點擊設定主要班別與診次"
                                >
                                    {getMainShiftDisplay(emp)}
                                </td>

                                {currentMonthDays.map(day => {
                                    const isSunday = day.dayOfWeek === 0;
                                    const isCurrentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();

                                    if (isSunday) {
                                        return (
                                            <td key={`${day.dateKey}-${emp.id}`} className={`grid-cell border-r border-slate-300 sunday-cell ${isCurrentMonth ? 'bg-red-50' : 'bg-slate-100'}`}>
                                                <span className={`sunday-text text-xs ${isCurrentMonth ? 'text-red-300' : 'text-slate-300'}`}>R</span>
                                            </td>
                                        );
                                    }

                                    return visibleShiftColumns.map(col => {
                                        const shiftData = getScheduleData(day.dateKey, emp.id, col.type);
                                        const { display, className, memo } = formatShiftDisplay(shiftData);
                                        const cellId = `${day.dateKey}_${emp.id}_${col.type}`;
                                        const cellData = { dateKey: day.dateKey, dateDisplay: day.date.toLocaleDateString('zh-TW'), empId: emp.id, empName: emp.name, shiftType: col.type, empSkills: emp.skills };

                                        // 如果列被高亮，且格子原本是白色，則強制變色
                                        const isHighlightedRow = highlightedEmpId === emp.id;
                                        let finalClassName = isCurrentMonth ? className : 'bg-slate-100 text-slate-300 cursor-not-allowed';

                                        if (isHighlightedRow && isCurrentMonth && finalClassName.includes('bg-white')) {
                                            finalClassName = finalClassName.replace('bg-white', 'bg-blue-50');
                                        }
                                        const finalDisplay = isCurrentMonth ? display : (display ? <span className="opacity-50 grayscale">{display}</span> : '');

                                        // 只有當前月份且有內容的格子才可拖曳
                                        const isDraggable = isCurrentMonth && shiftData && getShiftLabel(shiftData) !== 'OFF';

                                        // 判斷是否為合法的放置目標 (班別相同)
                                        const isValidDrop = dragData && dragData.shiftType === col.type;

                                        // 定義拖曳高亮顏色 (虛線框)
                                        const DROP_COLORS = {
                                            'MORNING': 'bg-sky-50 border-2 border-dashed border-sky-500 z-10',
                                            'AFTERNOON': 'bg-orange-50 border-2 border-dashed border-orange-500 z-10',
                                            'NIGHT': 'bg-indigo-50 border-2 border-dashed border-indigo-500 z-10'
                                        };
                                        const highlightColor = DROP_COLORS[col.type];

                                        // 判斷當前格子是否正在被拖曳
                                        const isDragging = activeDragId === `drag-${cellId}`;

                                        // 定義不同班別的 Hover/Active 樣式
                                        const HOVER_STYLES = {
                                            'MORNING': 'hover:bg-blue-50/50 active:bg-blue-100',
                                            'AFTERNOON': 'hover:bg-orange-50/50 active:bg-orange-100',
                                            'NIGHT': 'hover:bg-purple-50/50 active:bg-purple-100'
                                        };
                                        const currentHoverStyle = HOVER_STYLES[col.type] || HOVER_STYLES['MORNING'];

                                        // 如果正在拖曳，移除 active 樣式並降低透明度
                                        const interactionStyles = isDragging
                                            ? 'opacity-50'
                                            : (activeTool === 'ERASER'
                                                ? 'cursor-crosshair hover:bg-red-50'
                                                : activeTool === 'PAINT'
                                                    ? 'cursor-cell hover:bg-blue-50'
                                                    : `cursor-pointer ${currentHoverStyle}`);

                                        return (
                                            <DroppableCell
                                                key={cellId}
                                                id={cellId}
                                                data={cellData}
                                                isValid={isValidDrop}
                                                highlightColor={highlightColor}
                                                className={`grid-cell transition-all duration-150 border-r border-slate-200 text-center ${finalClassName} ${isCurrentMonth ? interactionStyles : ''}`}
                                                onClick={() => {
                                                    if (isCurrentMonth) onCellClick(day.dateKey, day.date.toLocaleDateString('zh-TW'), emp.id, emp.name, col.type, emp.skills || []);
                                                }}
                                                title={isCurrentMonth ? (memo || '點擊編輯，長按拖曳') : '非當前排班月份'}
                                            >
                                                {isDraggable ? (
                                                    <DraggableShift id={`drag-${cellId}`} data={cellData}>
                                                        {finalDisplay}
                                                        {memo && isCurrentMonth && <div className="text-[10px] text-slate-600 mt-0.5 truncate max-w-full px-0.5 leading-tight">{memo}</div>}
                                                    </DraggableShift>
                                                ) : (
                                                    <>
                                                        {finalDisplay}
                                                        {memo && isCurrentMonth && <div className="text-[10px] text-slate-600 mt-0.5 truncate max-w-full px-0.5 leading-tight">{memo}</div>}
                                                    </>
                                                )}
                                            </DroppableCell>
                                        );
                                    });
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 拖曳時的浮動層 */}
            <DragOverlay dropAnimation={null}>
                {activeDragId && dragData ? (() => {
                    const shiftData = getScheduleData(dragData.dateKey, dragData.empId, dragData.shiftType);
                    const { display } = formatShiftDisplay(shiftData);

                    // 強制根據班別類型指定顏色，避免預設藍色
                    const DRAG_COLORS = {
                        'MORNING': 'bg-blue-100 text-blue-700 border-2 border-blue-400',
                        'AFTERNOON': 'bg-orange-100 text-orange-700 border-2 border-orange-400',
                        'NIGHT': 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                    };

                    const dragClassName = DRAG_COLORS[dragData.shiftType] || 'bg-slate-100 border-2 border-slate-400';

                    return (
                        <div className={`
                            ${dragClassName} 
                            w-full h-full flex items-center justify-center 
                            shadow-2xl rounded scale-105 opacity-90 
                            cursor-grabbing z-50
                        `}
                            style={{ width: '80px', height: '40px' }} // 強制固定大小，避免變形
                        >
                            {display}
                        </div>
                    );
                })() : null}
            </DragOverlay>
        </DndContext>
    );
};

export default ScheduleTable;
