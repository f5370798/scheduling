import React from 'react';
import Icon from './Icon';
import { SHIFT_TYPES } from '../constants/shifts';

/**
 * 追蹤報告模態框
 */
const TrackingReportModal = ({ report, onClose, monthLabel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="Target" size={24} className="text-green-600" /> 護理跟診追蹤報告 ({monthLabel})
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                    以下為本月所有員工在追蹤診次的跟診次數統計：
                </p>

                <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-4 bg-slate-50">
                    {Object.keys(report).length === 0 ? (
                        <div className="flex items-center justify-center h-full flex-col text-slate-400">
                            <Icon name="FileText" size={48} />
                            <p className="mt-4 text-sm">目前沒有設定需要追蹤的診次</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(report).map(([employeeName, sessions]) => (
                                <div key={employeeName} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Icon name="User" size={18} className="text-indigo-500" />
                                        {employeeName}
                                    </h4>

                                    {Object.keys(sessions).length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">此員工未排班任何追蹤診次</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.entries(sessions).map(([sessionKey, data]) => {
                                                const parts = sessionKey.split(' / ');
                                                const shiftTypeLabel = SHIFT_TYPES[parts[0]]?.fullLabel || parts[0];
                                                const sessionLabel = `${shiftTypeLabel} / ${parts[1]} / ${parts[2]}`;

                                                return (
                                                    <div key={sessionKey} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-semibold text-green-800">{sessionLabel}</span>
                                                            <span className="text-lg font-bold text-green-700">{data.count} 次</span>
                                                        </div>
                                                        {data.dates.length > 0 && (
                                                            <div className="text-xs text-slate-600">
                                                                <p className="font-medium mb-1">日期：</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.dates.map((date, idx) => {
                                                                        const dateParts = date.split('-');
                                                                        const displayDate = `${dateParts[1]}/${dateParts[2]}`;
                                                                        return (
                                                                            <span key={idx} className="px-2 py-1 bg-white border border-green-300 rounded text-xs">
                                                                                {displayDate}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                    <button
                        onClick={onClose}
                        className="min-w-touch min-h-touch px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        關閉報告
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrackingReportModal;
