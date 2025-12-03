import React, { useState, useMemo } from 'react';
import Icon from './Icon';
import { SHIFT_TYPES } from '../constants/shifts';
import { getShiftLabel } from '../utils/dataUtils';

/**
 * 排班選擇模態框（超大型元件）
 * 用於選擇員工的排班詳情，包括班別、時段、診次和備註
 */
const ShiftSelectionModal = ({
    dateDisplay,
    employeeName,
    empId,
    shiftType,
    currentLabel,
    currentMemo,
    allShiftDetails,
    onSave,
    onClear,
    onCancel,
    dateKey,
    getSessionCapacity,
    SHIFT_HIERARCHY,
    employeeSkills,
    customShiftRules,
    scheduleData,
    allEmployees,
    monthDays
}) => {
    // 解析當前排班資訊
    const getCurrentShiftInfo = (label) => {
        if (!label) return { timeSlot: null, session: null };
        if (label === 'OFF_CONFIRMED') return { timeSlot: 'OFF', session: 'OFF' };
        if (label === 'OFF') return { timeSlot: null, session: null };
        const parts = label.split(' / ');
        if (parts.length === 3) {
            return { timeSlot: parts[1], session: parts[2] };
        }
        return { timeSlot: null, session: null };
    };

    const initialInfo = getCurrentShiftInfo(currentLabel);
    const [timeSlot, setTimeSlot] = useState(initialInfo.timeSlot);
    const [session, setSession] = useState(initialInfo.session);
    const [memo, setMemo] = useState(currentMemo || '');

    const isOffSelected = timeSlot === 'OFF';

    // 獲取當前週次
    const currentWeekOfMonth = useMemo(() => {
        const date = new Date(dateKey);
        return Math.ceil(date.getDate() / 7);
    }, [dateKey]);

    // 快速輸入符號
    const handleQuickInsert = (symbol) => {
        setMemo(prevMemo => {
            const trimmed = prevMemo.trim();
            return trimmed ? `${trimmed} ${symbol}` : symbol;
        });
    };

    // 計算員工追蹤次數
    const employeeTrackingCount = useMemo(() => {
        if (!session || !timeSlot || isOffSelected) return { isTracked: false, count: 0, dates: [] };

        const targetShiftKey = `${shiftType} / ${timeSlot} / ${session}`;
        const rule = customShiftRules.find(r =>
            r.sessionId === session &&
            r.shiftType === shiftType &&
            r.timeSlot === timeSlot
        );

        if (!rule || !rule.isTracked) {
            return { isTracked: false, count: 0, dates: [] };
        }

        let count = 0;
        let dates = [];

        Object.keys(scheduleData).forEach(key => {
            const [date, schEmpId, schShiftType] = key.split('_');
            if (parseInt(schEmpId) !== empId) return;

            const fullLabelData = scheduleData[key];
            const fullLabel = getShiftLabel(fullLabelData);

            if (fullLabel === 'OFF' || fullLabel === 'OFF_CONFIRMED') return;
            if (fullLabel.startsWith(targetShiftKey)) {
                count++;
                dates.push(date);
            }
        });

        return { isTracked: true, count, dates };
    }, [session, timeSlot, isOffSelected, shiftType, customShiftRules, scheduleData, empId]);

    // 可選時段
    const availableTimeSlots = SHIFT_HIERARCHY[shiftType] ? Object.keys(SHIFT_HIERARCHY[shiftType]) : [];

    // 可選診次 (簡化版 - 分為一般診和困難診)
    const availableSessions = useMemo(() => {
        if (!timeSlot || isOffSelected) return { general: [], difficult: [] };

        const sessionsForSlot = SHIFT_HIERARCHY[shiftType]?.[timeSlot] || [];
        const general = [];
        const difficult = [];

        sessionsForSlot.forEach(sessionId => {
            const fullShiftKey = `${shiftType} / ${timeSlot} / ${sessionId}`;
            const rule = customShiftRules.find(r =>
                r.sessionId === sessionId &&
                r.shiftType === shiftType &&
                r.timeSlot === timeSlot
            );

            if (!rule) return;

            // 檢查週次
            const currentDate = new Date(dateKey);
            const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
            if (!rule.days.includes(dayOfWeek)) return;
            if (!rule.weekFrequency.includes(currentWeekOfMonth)) return;

            const capacity = rule.capacity || 1;
            const currentUsage = getSessionCapacity(dateKey, fullShiftKey);
            const requiredSkills = rule.requiredSkills || [];
            const meetsSkillRequirement = requiredSkills.length === 0 || requiredSkills.every(skill => employeeSkills.includes(skill));

            const isFull = currentUsage >= capacity;

            const sessionData = {
                sessionId,
                fullShiftKey,
                capacity,
                currentUsage,
                requiredSkills,
                meetsSkillRequirement,
                isFull
            };

            if (requiredSkills.length > 0) {
                difficult.push(sessionData);
            } else {
                general.push(sessionData);
            }
        });

        return { general, difficult };
    }, [timeSlot, isOffSelected, shiftType, SHIFT_HIERARCHY, customShiftRules, dateKey, currentWeekOfMonth, getSessionCapacity, employeeSkills]);

    // 儲存排班
    const handleSave = () => {
        if (isOffSelected) {
            onSave(empId, shiftType, 'OFF_CONFIRMED', memo.trim());
        } else if (timeSlot && session) {
            const fullLabel = `${shiftType} / ${timeSlot} / ${session}`;
            onSave(empId, shiftType, fullLabel, memo.trim());
        } else {
            alert('請選擇時段和診次');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleIn">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="CalendarCheck" size={24} className="text-indigo-600" />
                    排班設定 - {employeeName}
                </h3>

                <div className="mb-4 p-3 bg-slate-100 rounded-lg">
                    <p className="text-sm text-slate-700">
                        <span className="font-semibold">日期：</span>{dateDisplay} |
                        <span className="font-semibold ml-2">班別：</span>{SHIFT_TYPES[shiftType].fullLabel}
                    </p>
                </div>

                {/* 追蹤資訊 */}
                {employeeTrackingCount.isTracked && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                            <Icon name="Target" size={16} />
                            <span className="font-semibold">累積跟診次數：</span>
                            {employeeTrackingCount.count} 次
                        </p>
                    </div>
                )}

                {/* 時段選擇 */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                        1. 選擇時段
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableTimeSlots.map(slot => (
                            <button
                                key={slot}
                                onClick={() => {
                                    setTimeSlot(slot);
                                    setSession(null);
                                }}
                                className={`min-w-touch min-h-touch px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeSlot === slot ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setTimeSlot('OFF');
                                setSession('OFF');
                            }}
                            className={`min-w-touch min-h-touch px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isOffSelected ? 'bg-red-600 text-white shadow-md' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                                }`}
                        >
                            休假 (OFF)
                        </button>
                    </div>
                </div>

                {/* 診次選擇 - 一般診 */}
                {timeSlot && !isOffSelected && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                            2A. 選擇一般診 (無需特殊技能)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableSessions.general.length > 0 ? (
                                availableSessions.general.map(({ sessionId, capacity, currentUsage, isFull }) => {
                                    // 如果已額滿且不是當前選中的，則禁用
                                    // 注意：如果當前已經選中該診次（例如正在編輯），允許繼續選中
                                    const isCurrentSelected = session === sessionId;
                                    const isDisabled = isFull && !isCurrentSelected;

                                    return (
                                        <button
                                            key={sessionId}
                                            onClick={() => !isDisabled && setSession(sessionId)}
                                            disabled={isDisabled}
                                            className={`min-w-touch min-h-touch px-4 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${isDisabled
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                : session === sessionId
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <span>{sessionId}</span>
                                            <span className="text-[10px] opacity-75">
                                                {isFull ? '已額滿' : `${currentUsage}/${capacity} 人`}
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-slate-500 text-sm italic">目前該時段所有一般診已排班完畢或沒有設定。</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 診次選擇 - 困難診 */}
                {timeSlot && !isOffSelected && (
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-orange-700 mb-3 border-b border-orange-200 pb-2 flex items-center gap-2">
                            <Icon name="AlertTriangle" size={16} />
                            2B. 選擇困難診 (需技能)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableSessions.difficult.length > 0 ? (
                                availableSessions.difficult.map(({ sessionId, capacity, currentUsage, requiredSkills, meetsSkillRequirement, isFull }) => {
                                    const isCurrentSelected = session === sessionId;
                                    // 禁用條件：技能不符 OR (已額滿且非當前選中)
                                    const isDisabled = !meetsSkillRequirement || (isFull && !isCurrentSelected);

                                    let buttonClass = '';
                                    if (!meetsSkillRequirement) {
                                        buttonClass = 'bg-red-400 text-white cursor-not-allowed opacity-75'; // 技能不符優先顯示紅色
                                    } else if (isFull && !isCurrentSelected) {
                                        buttonClass = 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'; // 額滿顯示灰色
                                    } else if (session === sessionId) {
                                        buttonClass = 'bg-orange-600 text-white shadow-md'; // 選中
                                    } else {
                                        buttonClass = 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-100'; // 可選
                                    }

                                    return (
                                        <button
                                            key={sessionId}
                                            onClick={() => !isDisabled && setSession(sessionId)}
                                            disabled={isDisabled}
                                            title={!meetsSkillRequirement ? `缺少技能: ${requiredSkills.join(', ')}` : `所需技能: ${requiredSkills.join(', ')}`}
                                            className={`min-w-touch min-h-touch px-4 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${buttonClass}`}
                                        >
                                            <span className="flex items-center gap-1">
                                                {sessionId}
                                                {!meetsSkillRequirement && <Icon name="Lock" size={12} />}
                                            </span>
                                            <span className="text-[10px] opacity-75">
                                                {isFull ? '已額滿' : `${currentUsage}/${capacity} 人`}
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-orange-600 text-sm italic">目前該時段所有困難診已排班完畢或沒有設定。</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 備註 */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">備註 (選填)</label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        onFocus={(e) => {
                            setTimeout(() => {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 300);
                        }}
                        placeholder="輸入備註，例如：臨時支援、交換班別等..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={3}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['→', '○', '交', '水'].map(symbol => (
                            <button
                                key={symbol}
                                type="button"
                                onClick={() => handleQuickInsert(symbol)}
                                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                            >
                                {symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 底部按鈕 */}
                <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
                    <button
                        onClick={() => onClear(empId, shiftType)}
                        className="min-w-touch min-h-touch px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        清除排班
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="min-w-touch min-h-touch px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!timeSlot}
                            className={`min-w-touch min-h-touch px-4 py-2 rounded-lg font-medium transition-colors ${timeSlot ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-300 text-white cursor-not-allowed'
                                }`}
                        >
                            確認儲存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftSelectionModal;
