import React, { useState } from 'react';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';
import { ALL_SHIFT_TYPES, SHIFT_TYPES } from '../constants/shifts';
import { DAY_OF_WEEK_MAP, WEEK_FREQUENCIES, WEEK_FREQUENCY_MAP } from '../constants/timeSlots';
import { sortRulesArray } from '../utils/dataUtils';

/**
 * 診次規則管理模態框
 * 依照使用者需求還原：直覺式操作，直接點擊按鈕切換設定
 */
const ManageShiftsModal = ({ rules, onSaveRules, onCancel, skills, timeSlots, showToast }) => {
    const [localRules, setLocalRules] = useState(() => sortRulesArray(rules));
    const [isAdding, setIsAdding] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(null);

    // 編輯班別/時段的暫存狀態
    const [editingShiftId, setEditingShiftId] = useState(null);
    const [tempShiftEdit, setTempShiftEdit] = useState({ shiftType: '', timeSlot: '' });

    // 新增規則的狀態
    const [newRule, setNewRule] = useState({
        sessionId: '',
        capacity: 1,
        shiftType: 'MORNING',
        timeSlot: '8-12',
        days: [1, 2, 3, 4, 5, 6],
        requiredSkills: [],
        weekFrequency: [1, 2, 3, 4, 5],
        isTracked: false,
        department: '' // 新增：科別欄位
    });

    // --- 輔助函數 ---
    const getSessionNumber = (sessionId) => {
        const match = sessionId.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : '';
    };

    const isNumericSession = (sessionId) => {
        return /^\d+診$/.test(sessionId);
    };

    // --- 直接更新規則的處理函數 ---
    const updateRule = (index, updates) => {
        const updatedRules = [...localRules];
        updatedRules[index] = { ...updatedRules[index], ...updates };
        setLocalRules(updatedRules); // 這裡不排序，避免操作時跳動，儲存時再排
    };

    const handleToggleDay = (index, day) => {
        const currentDays = localRules[index].days;
        const updatedDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day].sort((a, b) => a - b);
        updateRule(index, { days: updatedDays });
    };

    const handleToggleWeek = (index, week) => {
        const currentWeeks = localRules[index].weekFrequency;
        const updatedWeeks = currentWeeks.includes(week)
            ? currentWeeks.filter(w => w !== week)
            : [...currentWeeks, week].sort((a, b) => a - b);
        updateRule(index, { weekFrequency: updatedWeeks });
    };

    const handleToggleSkill = (index, skill) => {
        const currentSkills = localRules[index].requiredSkills || [];
        const updatedSkills = currentSkills.includes(skill)
            ? currentSkills.filter(s => s !== skill)
            : [...currentSkills, skill];
        updateRule(index, { requiredSkills: updatedSkills });
    };

    const handleChangeCapacity = (index, delta) => {
        const currentCap = localRules[index].capacity;
        const newCap = Math.max(1, Math.min(5, currentCap + delta));
        updateRule(index, { capacity: newCap });
    };

    const handleToggleTracked = (index) => {
        updateRule(index, { isTracked: !localRules[index].isTracked });
    };

    const handleDeleteRule = (id) => {
        setConfirmationModal({
            title: '刪除診次規則',
            message: '確定要刪除此診次規則嗎？此操作無法復原。',
            isDestructive: true,
            confirmText: '確認刪除',
            onConfirm: () => {
                const filteredRules = localRules.filter(r => r.id !== id);
                setLocalRules(filteredRules);
                setConfirmationModal(null);
            },
            onCancel: () => setConfirmationModal(null)
        });
    };

    // --- 班別/時段 編輯邏輯 ---
    const handleStartEditShift = (rule) => {
        setEditingShiftId(rule.id);
        setTempShiftEdit({ shiftType: rule.shiftType, timeSlot: rule.timeSlot });
    };

    const handleCancelEditShift = () => {
        setEditingShiftId(null);
        setTempShiftEdit({ shiftType: '', timeSlot: '' });
    };

    const handleSaveEditShift = (index) => {
        let newTimeSlot = tempShiftEdit.timeSlot;
        // 驗證時段是否有效
        if (!newTimeSlot || !timeSlots[tempShiftEdit.shiftType].includes(newTimeSlot)) {
            newTimeSlot = timeSlots[tempShiftEdit.shiftType]?.[0] || '8-12';
        }
        updateRule(index, {
            shiftType: tempShiftEdit.shiftType,
            timeSlot: newTimeSlot
        });
        handleCancelEditShift();
    };

    // --- 新增規則邏輯 ---
    const handleNewRuleChange = (field, value) => {
        if (field === 'sessionId' && /^\d+$/.test(value)) value = `${value}診`;
        setNewRule(prev => ({ ...prev, [field]: value }));
    };

    const handleAddRule = () => {
        if (!newRule.sessionId || newRule.days.length === 0 || newRule.weekFrequency.length === 0) {
            showToast('請填寫診次名稱，選擇至少一天和至少一週。', 'warning');
            return;
        }
        const newId = localRules.length > 0 ? Math.max(...localRules.map(r => r.id)) + 1 : 1;
        const newRuleWithId = { ...newRule, id: newId };
        setLocalRules(sortRulesArray([...localRules, newRuleWithId]));
        setIsAdding(false);
        setNewRule({ sessionId: '', capacity: 1, shiftType: 'MORNING', timeSlot: '8-12', days: [1, 2, 3, 4, 5, 6], requiredSkills: [], weekFrequency: [1, 2, 3, 4, 5], isTracked: false, department: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-[95vw] w-full h-[90vh] flex flex-col overflow-hidden relative">
                {confirmationModal && (
                    <div className="absolute inset-0 z-[60]">
                        <ConfirmationModal {...confirmationModal} />
                    </div>
                )}
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Icon name="Settings" size={24} className="text-indigo-500" />
                        診次規則管理 (共 {localRules.length} 條規則)
                    </h3>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Icon name={isAdding ? "X" : "Plus"} size={16} />
                        {isAdding ? "取消新增" : "新增診次規則"}
                    </button>
                </div>

                {/* 新增區塊 (可折疊) */}
                {isAdding && (
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-in slide-in-from-top-2 overflow-y-auto max-h-[40vh]">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500">診次名稱</label>
                                <input
                                    type="text"
                                    placeholder="例如: 71"
                                    value={isNumericSession(newRule.sessionId) ? getSessionNumber(newRule.sessionId) : newRule.sessionId}
                                    onChange={e => handleNewRuleChange('sessionId', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">科別（選填）</label>
                                <input
                                    type="text"
                                    placeholder="例如: 泌尿科"
                                    value={newRule.department || ''}
                                    onChange={e => handleNewRuleChange('department', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">班別</label>
                                <select
                                    value={newRule.shiftType}
                                    onChange={e => handleNewRuleChange('shiftType', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                >
                                    {ALL_SHIFT_TYPES.map(t => <option key={t} value={t}>{SHIFT_TYPES[t].fullLabel}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">時段</label>
                                <select
                                    value={newRule.timeSlot}
                                    onChange={e => handleNewRuleChange('timeSlot', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                >
                                    {timeSlots[newRule.shiftType]?.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">人數</label>
                                <input
                                    type="number" min="1" max="5"
                                    value={newRule.capacity}
                                    onChange={e => handleNewRuleChange('capacity', parseInt(e.target.value))}
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                />
                            </div>
                        </div>

                        {/* 新增規則 - 進階設定 (技能、星期、週次) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            {/* 技能 */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">所需技能</label>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => {
                                        const active = newRule.requiredSkills?.includes(skill);
                                        return (
                                            <button
                                                key={skill}
                                                onClick={() => {
                                                    const current = newRule.requiredSkills || [];
                                                    const updated = current.includes(skill)
                                                        ? current.filter(s => s !== skill)
                                                        : [...current, skill];
                                                    handleNewRuleChange('requiredSkills', updated);
                                                }}
                                                className={`px-3 py-1 text-xs rounded-full border transition-all ${active
                                                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-300 hover:border-orange-300 hover:text-orange-500'
                                                    }`}
                                            >
                                                {skill}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 星期 */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">適用星期</label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(day => {
                                        const active = newRule.days.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const current = newRule.days;
                                                    const updated = current.includes(day)
                                                        ? current.filter(d => d !== day)
                                                        : [...current, day].sort((a, b) => a - b);
                                                    handleNewRuleChange('days', updated);
                                                }}
                                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${active
                                                    ? 'bg-indigo-500 text-white shadow-sm'
                                                    : 'bg-white border border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                                                    }`}
                                            >
                                                {DAY_OF_WEEK_MAP[day].replace('週', '')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 週次 & 追蹤 */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500">開診週次</label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newRule.isTracked}
                                            onChange={(e) => handleNewRuleChange('isTracked', e.target.checked)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs text-slate-600">加入追蹤</span>
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {WEEK_FREQUENCIES.map(week => {
                                        const active = newRule.weekFrequency.includes(week);
                                        return (
                                            <button
                                                key={week}
                                                onClick={() => {
                                                    const current = newRule.weekFrequency;
                                                    const updated = current.includes(week)
                                                        ? current.filter(w => w !== week)
                                                        : [...current, week].sort((a, b) => a - b);
                                                    handleNewRuleChange('weekFrequency', updated);
                                                }}
                                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${active
                                                    ? 'bg-purple-500 text-white shadow-sm'
                                                    : 'bg-white border border-slate-300 text-slate-400 hover:border-purple-300 hover:text-purple-500'
                                                    }`}
                                            >
                                                {week}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-indigo-200">
                            <button onClick={handleAddRule} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-bold shadow-sm">確認新增</button>
                        </div>
                    </div>
                )}

                {/* 規則列表 (表格化) */}
                <div className="flex-1 overflow-auto bg-slate-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        {/* 表頭 */}
                        <div className="grid grid-cols-12 gap-2 p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 text-center">
                            <div className="col-span-2 text-left pl-2">診次/人數</div>
                            <div className="col-span-1">科別</div>
                            <div className="col-span-2">班別/時段</div>
                            <div className="col-span-2">所需技能</div>
                            <div className="col-span-2">適用星期</div>
                            <div className="col-span-2">開診週次</div>
                            <div className="col-span-1">操作</div>
                        </div>

                        {/* 列表內容 */}
                        <div className="divide-y divide-slate-100">
                            {localRules.map((rule, index) => (
                                <div key={rule.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-slate-50 transition-colors text-sm">

                                    {/* 1. 診次 / 人數 */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div className="font-bold text-slate-700 w-8 text-center bg-slate-100 rounded py-1">
                                            {getSessionNumber(rule.sessionId) || rule.sessionId}
                                        </div>
                                        <span className="text-xs text-slate-400">診</span>
                                        <div className="flex items-center border border-slate-200 rounded bg-white">
                                            <button
                                                onClick={() => handleChangeCapacity(index, -1)}
                                                className="px-1.5 py-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                            >-</button>
                                            <span className="px-1 text-xs font-medium w-4 text-center">{rule.capacity}</span>
                                            <button
                                                onClick={() => handleChangeCapacity(index, 1)}
                                                className="px-1.5 py-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* 1.5 科別 (新增) */}
                                    <div className="col-span-1">
                                        <input
                                            type="text"
                                            value={rule.department || ''}
                                            onChange={(e) => updateRule(index, { department: e.target.value })}
                                            placeholder="科別（選填）"
                                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                                        />
                                    </div>

                                    {/* 2. 班別 / 時段 (唯一需要編輯模式的) */}
                                    <div className="col-span-2 flex justify-center">
                                        {editingShiftId === rule.id ? (
                                            <div className="flex flex-col gap-1 w-full z-10 bg-white p-1 border rounded shadow-lg absolute md:static md:shadow-none md:border-0">
                                                <select
                                                    value={tempShiftEdit.shiftType}
                                                    onChange={e => setTempShiftEdit(prev => ({ ...prev, shiftType: e.target.value }))}
                                                    className="text-xs border rounded p-1"
                                                >
                                                    {ALL_SHIFT_TYPES.map(t => <option key={t} value={t}>{SHIFT_TYPES[t].label}</option>)}
                                                </select>
                                                <select
                                                    value={tempShiftEdit.timeSlot}
                                                    onChange={e => setTempShiftEdit(prev => ({ ...prev, timeSlot: e.target.value }))}
                                                    className="text-xs border rounded p-1"
                                                >
                                                    {timeSlots[tempShiftEdit.shiftType]?.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <div className="flex justify-center gap-2 mt-1">
                                                    <button onClick={() => handleSaveEditShift(index)} className="text-green-600 bg-green-50 p-1 rounded"><Icon name="Check" size={14} /></button>
                                                    <button onClick={handleCancelEditShift} className="text-red-600 bg-red-50 p-1 rounded"><Icon name="X" size={14} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleStartEditShift(rule)}>
                                                <div className="text-center">
                                                    <div className="font-medium text-slate-700">{SHIFT_TYPES[rule.shiftType].label}</div>
                                                    <div className="text-xs text-slate-400">{rule.timeSlot}</div>
                                                </div>
                                                <Icon name="Edit2" size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. 所需技能 (直接點擊) */}
                                    <div className="col-span-2 flex flex-wrap gap-1 justify-center">
                                        {skills.map(skill => {
                                            const active = rule.requiredSkills?.includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    onClick={() => handleToggleSkill(index, skill)}
                                                    className={`px-2 py-0.5 text-[10px] rounded-full border transition-all ${active
                                                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-orange-300 hover:text-orange-400'
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* 4. 適用星期 (直接點擊) */}
                                    <div className="col-span-2 flex flex-wrap gap-1 justify-center">
                                        {[1, 2, 3, 4, 5, 6].map(day => {
                                            const active = rule.days.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => handleToggleDay(index, day)}
                                                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${active
                                                        ? 'bg-indigo-500 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-400'
                                                        }`}
                                                >
                                                    {DAY_OF_WEEK_MAP[day].replace('週', '')}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* 5. 開診週次 (直接點擊) */}
                                    <div className="col-span-2 flex flex-wrap gap-1 justify-center">
                                        {WEEK_FREQUENCIES.map(week => {
                                            const active = rule.weekFrequency.includes(week);
                                            return (
                                                <button
                                                    key={week}
                                                    onClick={() => handleToggleWeek(index, week)}
                                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${active
                                                        ? 'bg-purple-500 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-purple-50 hover:text-purple-400'
                                                        }`}
                                                >
                                                    {week}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* 6. 操作 (追蹤 & 刪除) */}
                                    <div className="col-span-1 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleToggleTracked(index)}
                                            className={`p-1.5 rounded transition-colors ${rule.isTracked ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-green-500'}`}
                                            title={rule.isTracked ? "取消追蹤" : "加入追蹤"}
                                        >
                                            <Icon name={rule.isTracked ? "CheckSquare" : "Square"} size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="刪除"
                                        >
                                            <Icon name="Trash2" size={16} />
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                    <button onClick={onCancel} className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                        關閉 (不儲存)
                    </button>
                    <button onClick={() => onSaveRules(sortRulesArray(localRules))} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                        <Icon name="Save" size={18} />
                        儲存所有規則變更
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageShiftsModal;
