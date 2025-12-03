import React, { useState } from 'react';
import Icon from './Icon';
import { ALL_SHIFT_TYPES, SHIFT_TYPES } from '../constants/shifts';

/**
 * 班別顯示管理模態框
 */
const ManageVisibleShiftsModal = ({ visibleShifts, onSave, onCancel }) => {
    const [localVisibleShifts, setLocalVisibleShifts] = useState(visibleShifts);

    const handleToggleShift = (shiftType) => {
        setLocalVisibleShifts(prevShifts => {
            const isCurrentlyVisible = prevShifts.includes(shiftType);
            const newShifts = isCurrentlyVisible
                ? prevShifts.filter(s => s !== shiftType)
                : [...prevShifts, shiftType].sort((a, b) => ALL_SHIFT_TYPES.indexOf(a) - ALL_SHIFT_TYPES.indexOf(b));

            // 必須至少保留一個班別
            if (isCurrentlyVisible && newShifts.length === 0) {
                return prevShifts;
            }

            return newShifts;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-scaleIn">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="Eye" size={20} className="text-teal-500" /> 班別顯示設定
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    選擇您希望在排班表上顯示和啟用的班別欄位：
                </p>

                <div className="space-y-4 mb-6">
                    {ALL_SHIFT_TYPES.map(type => {
                        const shift = SHIFT_TYPES[type];
                        const isVisible = localVisibleShifts.includes(type);
                        const isDisabled = isVisible && localVisibleShifts.length === 1;

                        return (
                            <div key={type} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                <label htmlFor={`shift-${type}`} className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${shift.color.split(' ')[0]}`}></span>
                                    {shift.fullLabel}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleToggleShift(type)}
                                    disabled={isDisabled}
                                    className={`min-w-touch min-h-touch px-3 py-1 text-xs rounded-full transition-colors font-medium ${isVisible ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isVisible ? '顯示中' : '隱藏'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-red-500 mb-4">
                    注意：隱藏的班別將不會在排班表上顯示，且無法排班。您必須至少保留一個班別。
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="min-w-touch min-h-touch px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => onSave(localVisibleShifts)}
                        className="min-w-touch min-h-touch px-4 py-2 text-white rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Icon name="Save" size={18} />
                        儲存設定
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageVisibleShiftsModal;
