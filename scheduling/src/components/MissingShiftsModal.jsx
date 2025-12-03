import React from 'react';
import Icon from './Icon';
import { SHIFT_TYPES } from '../constants/shifts';

/**
 * 漏排診次報告模態框
 */
const MissingShiftsModal = ({ report, onClose }) => {
    const dateKeys = Object.keys(report).sort();
    const totalMissingShifts = dateKeys.reduce((sum, dateKey) => {
        return sum + Object.values(report[dateKey]).reduce((daySum, shift) => daySum + shift.missing, 0);
    }, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col animate-scaleIn">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="ClipboardList" size={24} className="text-pink-600" /> 排班漏排檢查報告
                </h3>

                {totalMissingShifts === 0 ? (
                    <div className="flex-1 flex items-center justify-center flex-col text-green-600">
                        <Icon name="CheckCircle" size={48} />
                        <p className="mt-4 text-lg font-semibold">恭喜！本月所有診次排班人數皆已達標。</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-600 mb-4 font-medium">
                            發現 <span className="font-bold text-red-600">{totalMissingShifts}</span> 個待補排班。請檢查以下日期和診次：
                        </p>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-3 bg-slate-50">
                            {dateKeys.map(dateKey => {
                                const shifts = report[dateKey];
                                if (Object.keys(shifts).length === 0) return null;

                                const dateParts = dateKey.split('-');
                                const displayDate = `${dateParts[1]}/${dateParts[2]}`;

                                return (
                                    <div key={dateKey} className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                                        <h4 className="text-base font-bold text-slate-800 border-b border-pink-100 pb-1 mb-2 flex items-center gap-2">
                                            <Icon name="Calendar" size={16} className="text-pink-500" />
                                            日期：{displayDate} ({new Date(dateKey).toLocaleDateString('zh-TW', { weekday: 'short' })})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(shifts).map(([fullShiftKey, data]) => {
                                                const parts = fullShiftKey.split(' / ');
                                                const shiftTypeLabel = SHIFT_TYPES[parts[0]].label;
                                                const timeSlot = parts[1];
                                                const sessionId = parts[2];
                                                const requiredSkills = data.requiredSkills.join(', ');

                                                return (
                                                    <div key={fullShiftKey} className="p-3 border border-pink-300 bg-pink-50 rounded-lg">
                                                        <p className="text-sm font-semibold text-pink-700">
                                                            {shiftTypeLabel} / {timeSlot} / {sessionId}
                                                        </p>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            缺口：<span className="font-bold text-red-600">{data.missing}</span> 人 (需 {data.capacity} 人，已排 {data.currentUsage} 人)
                                                        </p>
                                                        {data.requiredSkills.length > 0 && (
                                                            <p className="text-xs text-orange-600 mt-1 flex items-center">
                                                                <Icon name="AlertTriangle" size={12} className="mr-1" />
                                                                技能：{requiredSkills}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                    <button
                        onClick={onClose}
                        className="min-w-touch min-h-touch px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        關閉報告
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissingShiftsModal;
