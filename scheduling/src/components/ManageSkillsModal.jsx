import React, { useState } from 'react';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

/**
 * 技能需求管理模態框
 */
const ManageSkillsModal = ({ skills, onSave, onCancel, checkSkillUsage, showToast, onForceDelete }) => {
    const [localSkills, setLocalSkills] = useState([...skills]);
    const [newSkill, setNewSkill] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(null);

    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();
        if (!trimmedSkill) return;

        if (localSkills.includes(trimmedSkill)) {
            showToast('此技能已存在！', 'warning');
            return;
        }

        setLocalSkills([...localSkills, trimmedSkill]);
        setNewSkill('');
        setIsAdding(false);
    };

    const handleDeleteSkill = (skillToDelete) => {
        const usage = checkSkillUsage(skillToDelete);

        if (usage.employees.length > 0 || usage.rules.length > 0) {
            const employeeList = usage.employees.join(', ');
            const ruleList = usage.rules.join(', ');
            let message = `此技能「${skillToDelete}」正在被使用中：\n`;

            if (usage.employees.length > 0) {
                message += `\n員工：${employeeList}`;
            }
            if (usage.rules.length > 0) {
                message += `\n診次：${ruleList}`;
            }

            message += `\n\n警告：強制刪除將會一併移除所有員工及診次規則中的此項技能！此操作無法復原。`;

            setConfirmationModal({
                title: '強制刪除技能 (1/2)',
                message: message,
                isDestructive: true,
                confirmText: '下一步',
                onConfirm: () => {
                    // 第二次確認
                    setConfirmationModal({
                        title: '最終確認 (2/2)',
                        message: `請再次確認：您真的要刪除「${skillToDelete}」並移除所有相關設定嗎？\n\n此操作真的無法復原！`,
                        isDestructive: true,
                        confirmText: '確認強制刪除',
                        onConfirm: () => {
                            if (onForceDelete) {
                                onForceDelete(skillToDelete);
                                setLocalSkills(localSkills.filter(s => s !== skillToDelete));
                            }
                            setConfirmationModal(null);
                        },
                        onCancel: () => setConfirmationModal(null)
                    });
                },
                onCancel: () => setConfirmationModal(null)
            });
            return;
        }

        setConfirmationModal({
            title: '刪除技能',
            message: `確定要刪除技能「${skillToDelete}」嗎？`,
            isDestructive: true,
            confirmText: '確認刪除',
            onConfirm: () => {
                setLocalSkills(localSkills.filter(s => s !== skillToDelete));
                setConfirmationModal(null);
            },
            onCancel: () => setConfirmationModal(null)
        });
    };

    const handleSave = () => {
        onSave(localSkills);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            {confirmationModal && (
                <div className="absolute inset-0 z-[60]">
                    <ConfirmationModal {...confirmationModal} />
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-scaleIn">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="Award" size={20} className="text-amber-500" /> 技能需求管理
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                    管理系統中可用的技能列表。技能可用於員工能力設定和診次需求限制。
                </p>

                {/* 新增技能區域 */}
                {isAdding ? (
                    <div className="mb-4 p-4 border-2 border-indigo-300 bg-indigo-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-indigo-800 mb-2">新增技能</h4>
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="輸入技能名稱，例如：超音波"
                            className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewSkill('');
                                }}
                                className="min-w-touch min-h-touch px-3 py-1 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddSkill}
                                disabled={!newSkill.trim()}
                                className={`min-w-touch min-h-touch px-3 py-1 text-sm rounded-lg text-white font-medium ${newSkill.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
                                    }`}
                            >
                                確認新增
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full min-h-touch py-2 mb-4 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Icon name="Plus" size={16} /> 新增技能
                    </button>
                )}

                {/* 現有技能列表 */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">現有技能</h4>
                    {localSkills.length === 0 ? (
                        <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                            尚未新增任何技能
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {localSkills.map(skill => {
                                const usage = checkSkillUsage(skill);
                                const isUsed = usage.employees.length > 0 || usage.rules.length > 0;

                                return (
                                    <div key={skill} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50">
                                        <div className="flex-1">
                                            <span className="font-medium text-slate-800">{skill}</span>
                                            {isUsed && (
                                                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    使用中
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSkill(skill)}
                                            className="min-w-touch min-h-touch p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="刪除技能"
                                        >
                                            <Icon name="Trash2" size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 底部按鈕 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                    <button
                        onClick={handleSave}
                        className="min-w-touch min-h-touch px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Icon name="Save" size={18} />
                        儲存技能列表
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageSkillsModal;
