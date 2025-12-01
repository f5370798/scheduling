import React, { useState } from 'react';
import Icon from './Icon';
import { MAJOR_SHIFTS, MAJOR_SHIFT_GROUPS } from '../constants/shifts';

/**
 * 主要班別選擇模態框
 */
const MajorShiftModal = ({ employee, onSave, onCancel, allEmployees }) => {
    // 解析當前的主要班別
    const parseInitialShift = (majorShift) => {
        const parts = majorShift.split('/');

        // 情況：組合的半天班 (例如：'8-12/1-5')
        if (parts.length === 2 && MAJOR_SHIFTS[parts[0]] && MAJOR_SHIFTS[parts[1]]) {
            const partA = parts[0];
            const partB = parts[1];

            const isA_M = MAJOR_SHIFT_GROUPS.MORNING_HALF.shifts.includes(partA);
            const isA_A = MAJOR_SHIFT_GROUPS.AFTERNOON_HALF.shifts.includes(partA);
            const isB_M = MAJOR_SHIFT_GROUPS.MORNING_HALF.shifts.includes(partB);
            const isB_A = MAJOR_SHIFT_GROUPS.AFTERNOON_HALF.shifts.includes(partB);

            if (isA_M && isB_A) {
                return { full: null, morning: partA, afternoon: partB };
            }
            if (isA_A && isB_M) {
                return { full: null, morning: partB, afternoon: partA };
            }
        }

        // 情況：單一班別 (整日或半天)
        if (MAJOR_SHIFTS[majorShift]) {
            if (MAJOR_SHIFT_GROUPS.FULL_DAY.shifts.includes(majorShift)) {
                return { full: majorShift, morning: null, afternoon: null };
            }
            if (MAJOR_SHIFT_GROUPS.MORNING_HALF.shifts.includes(majorShift)) {
                return { full: null, morning: majorShift, afternoon: null };
            }
            if (MAJOR_SHIFT_GROUPS.AFTERNOON_HALF.shifts.includes(majorShift)) {
                return { full: null, morning: null, afternoon: majorShift };
            }
        }

        // 情況：無或無效
        return { full: null, morning: null, afternoon: null };
    };

    const initial = parseInitialShift(employee.majorShift);

    const [selectedFull, setSelectedFull] = useState(initial.full);
    const [selectedMorning, setSelectedMorning] = useState(initial.morning);
    const [selectedAfternoon, setSelectedAfternoon] = useState(initial.afternoon);
    const [mainSessionId, setMainSessionId] = useState(employee.mainSessionId || '');

    // 選擇整日班：自動清除早/午班
    const handleFullDaySelect = (shift) => {
        setSelectedFull(selectedFull === shift ? null : shift);
        setSelectedMorning(null);
        setSelectedAfternoon(null);
    };

    // 選擇早班：自動清除整日班
    const handleMorningHalfSelect = (shift) => {
        setSelectedFull(null);
        setSelectedMorning(selectedMorning === shift ? null : shift);
    };

    // 選擇午班：自動清除整日班
    const handleAfternoonHalfSelect = (shift) => {
        setSelectedFull(null);
        setSelectedAfternoon(selectedAfternoon === shift ? null : shift);
    };

    const handleNoneSelect = () => {
        // 直接儲存為未設定狀態
        onSave(employee.id, 'NONE', '');
    };

    const getFinalShift = () => {
        if (selectedFull) return selectedFull;
        if (selectedMorning && selectedAfternoon) {
            return `${selectedMorning}/${selectedAfternoon}`;
        }
        if (selectedMorning) return selectedMorning;
        if (selectedAfternoon) return selectedAfternoon;
        return 'NONE';
    };

    const finalShiftKey = getFinalShift();
    const finalDisplay = MAJOR_SHIFTS[finalShiftKey] || finalShiftKey;

    const handleSave = () => {
        const trimmedSessionId = mainSessionId.trim();

        // 檢查主診次是否重複
        if (trimmedSessionId) {
            const duplicateEmployee = allEmployees.find(emp =>
                emp.id !== employee.id && // 排除自己
                emp.mainSessionId === trimmedSessionId
            );

            if (duplicateEmployee) {
                alert(`儲存失敗：主診次「${trimmedSessionId}」已被員工「${duplicateEmployee.name}」使用！\n請更換診次編號。`);
                return;
            }
        }

        onSave(employee.id, finalShiftKey, trimmedSessionId);
    };

    const isSaveDisabled = !mainSessionId.trim() || finalShiftKey === 'NONE';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="Briefcase" size={20} className="text-sky-500" /> 設定 {employee.name} 的主要班別
                </h3>

                {/* 主要診次輸入 */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Icon name="ListOrdered" size={16} className="text-pink-500" /> 主要診次 (輸入診次編號，例如: 83)
                    </label>
                    <input
                        type="text"
                        value={mainSessionId}
                        onChange={(e) => setMainSessionId(e.target.value.replace(/[^0-9\u4e00-\u9fa5]/g, ''))}
                        placeholder="例如: 83 或 門診"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                <p className="text-sm text-slate-600 mb-4 font-medium">
                    目前選擇:
                    <span className={`font-bold ml-1 ${finalShiftKey === 'NONE' ? 'text-gray-500' : 'text-sky-700'}`}>
                        {finalDisplay}
                    </span>
                </p>

                <div className="space-y-4 mb-6">
                    {/* 整日班 */}
                    <div className="p-3 border border-slate-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">{MAJOR_SHIFT_GROUPS.FULL_DAY.label} (單選)</h4>
                        <div className="flex flex-wrap gap-2">
                            {MAJOR_SHIFT_GROUPS.FULL_DAY.shifts.map(shift => {
                                const isHalfDaySelected = !!selectedMorning || !!selectedAfternoon;
                                return (
                                    <button
                                        key={shift}
                                        onClick={() => handleFullDaySelect(shift)}
                                        className={`min-w-touch min-h-touch px-3 py-2 text-xs rounded-lg transition-all font-medium ${selectedFull === shift
                                            ? 'bg-sky-600 text-white shadow-md'
                                            : 'bg-white text-sky-600 border border-sky-200 hover:bg-sky-50'
                                            } ${isHalfDaySelected ? 'opacity-40 grayscale' : ''}`}
                                    >
                                        {MAJOR_SHIFTS[shift]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 早班半天 */}
                    <div className="p-3 border border-slate-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">{MAJOR_SHIFT_GROUPS.MORNING_HALF.label} (可單選，與午班組合)</h4>
                        <div className="flex flex-wrap gap-2">
                            {MAJOR_SHIFT_GROUPS.MORNING_HALF.shifts.map(shift => (
                                <button
                                    key={shift}
                                    onClick={() => handleMorningHalfSelect(shift)}
                                    className={`min-w-touch min-h-touch px-3 py-2 text-xs rounded-lg transition-all font-medium ${selectedMorning === shift
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                        } ${!!selectedFull ? 'opacity-40 grayscale' : ''}`}
                                >
                                    {MAJOR_SHIFTS[shift]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 午班半天 */}
                    <div className="p-3 border border-slate-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">{MAJOR_SHIFT_GROUPS.AFTERNOON_HALF.label} (可單選，與早班組合)</h4>
                        <div className="flex flex-wrap gap-2">
                            {MAJOR_SHIFT_GROUPS.AFTERNOON_HALF.shifts.map(shift => (
                                <button
                                    key={shift}
                                    onClick={() => handleAfternoonHalfSelect(shift)}
                                    className={`min-w-touch min-h-touch px-3 py-2 text-xs rounded-lg transition-all font-medium ${selectedAfternoon === shift
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                        } ${!!selectedFull ? 'opacity-40 grayscale' : ''}`}
                                >
                                    {MAJOR_SHIFTS[shift]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleNoneSelect}
                        className="mr-auto min-w-touch min-h-touch px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                        清除設定
                    </button>

                    <button
                        onClick={onCancel}
                        className="min-w-touch min-h-touch px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={`min-w-touch min-h-touch px-4 py-2 text-white rounded-lg font-medium transition-colors ${isSaveDisabled
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        儲存主要班別
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MajorShiftModal;
