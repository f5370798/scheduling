import React from 'react';
import Icon from './Icon';

/**
 * 系統資訊模態框 - 玻璃擬態版
 * 顯示 LocalStorage 使用量和資料統計
 */
const SystemInfoModal = ({ systemInfo, onClose }) => {
    const { storage, data } = systemInfo;
    const isWarning = storage.usagePercentage > 80;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl backdrop-brightness-110 p-6 rounded-2xl shadow-2xl border border-white/40 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleIn">
                {/* 標題 */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                            <Icon name="Info" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">系統資訊</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100/50 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* 儲存空間 */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Icon name="HardDrive" size={16} />
                        儲存空間使用
                    </h4>

                    <div className="bg-white/50 p-4 rounded-xl border border-white/40 shadow-sm mb-3">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">總使用量</span>
                            <span className="font-bold text-slate-800">{storage.totalFormatted} <span className="text-slate-400 font-normal">/ {storage.limitFormatted}</span></span>
                        </div>

                        {/* 進度條 */}
                        <div className="w-full bg-slate-200/50 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isWarning ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                                style={{ width: `${Math.min(storage.usagePercentage, 100)}%` }}
                            ></div>
                        </div>
                        <div className="text-right text-xs">
                            <span className={`font-semibold ${isWarning ? 'text-red-600' : 'text-blue-600'}`}>
                                {storage.usagePercentage}% 使用中
                            </span>
                        </div>
                    </div>

                    {/* 警告 */}
                    {isWarning && (
                        <div className="bg-red-50/80 border border-red-200/60 rounded-xl p-3 text-xs text-red-800 mb-3 flex items-start gap-2">
                            <Icon name="AlertTriangle" size={14} className="mt-0.5 shrink-0" />
                            <span>儲存空間即將用盡，建議清理舊資料或匯出備份</span>
                        </div>
                    )}

                    {/* 詳細分佈 */}
                    <div className="bg-white/30 rounded-xl p-4 border border-white/20 space-y-2">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                排班資料
                            </span>
                            <span className="font-medium text-slate-700">{storage.breakdown.schedule.formatted} <span className="text-xs text-slate-400">({data.scheduleRecordCount} 筆)</span></span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                員工資料
                            </span>
                            <span className="font-medium text-slate-700">{storage.breakdown.employees.formatted} <span className="text-xs text-slate-400">({data.employeeCount} 位)</span></span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                規則設定
                            </span>
                            <span className="font-medium text-slate-700">{storage.breakdown.rules.formatted} <span className="text-xs text-slate-400">({data.ruleCount} 條)</span></span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                其他資料
                            </span>
                            <span className="font-medium text-slate-700">{storage.breakdown.skills.formatted}</span>
                        </div>
                    </div>
                </div>

                {/* 資料範圍 */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Icon name="Calendar" size={16} />
                        資料範圍
                    </h4>
                    <div className="bg-white/50 p-4 rounded-xl border border-white/40 shadow-sm space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">最舊記錄</span>
                            <span className="font-medium text-slate-800">{data.oldestDate || '無資料'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">最新記錄</span>
                            <span className="font-medium text-slate-800">{data.newestDate || '無資料'}</span>
                        </div>
                    </div>
                </div>

                {/* 關閉按鈕 */}
                <div className="flex justify-end pt-4 border-t border-slate-200/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800/90 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-medium text-sm backdrop-blur-sm"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemInfoModal;
