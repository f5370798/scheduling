import React, { useState } from 'react';
import Icon from './Icon';

/**
 * 編輯員工資訊模態框
 */
const EditEmployeeModal = ({ employee, roles, skills, onSave, onCancel }) => {
    const [name, setName] = useState(employee.name);
    const [role, setRole] = useState(employee.role);
    const [employeeSkills, setEmployeeSkills] = useState(employee.skills || []);

    const handleSave = () => {
        if (!name.trim()) return;

        onSave({
            ...employee,
            name: name.trim(),
            role,
            skills: employeeSkills,
        });
    };

    const handleToggleSkill = (skill) => {
        setEmployeeSkills(prevSkills =>
            prevSkills.includes(skill)
                ? prevSkills.filter(s => s !== skill)
                : [...prevSkills, skill]
        );
    };

    const isSkillListEmpty = skills.length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-scaleIn">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Icon name="User" size={20} className="text-indigo-500" /> 編輯員工資訊
                </h3>
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">職位</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* 具備技能選擇 */}
                    <div className={isSkillListEmpty ? "p-3 border border-red-300 bg-red-50 rounded-lg" : ""}>
                        <label className={`block text-sm font-medium mb-2 ${isSkillListEmpty ? 'text-red-700' : 'text-slate-700'}`}>
                            {isSkillListEmpty ? (
                                <span className='flex items-center'>
                                    <Icon name="AlertCircle" size={16} className="mr-1" /> 尚未設定任何技能
                                </span>
                            ) : '具備技能 (可複選)'}
                        </label>

                        {isSkillListEmpty ? (
                            <p className='text-xs text-red-600'>
                                請先點擊右下角的**齒輪按鈕**，並在「**技能需求管理**」中新增技能，才能在此選擇。
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <button
                                        type="button"
                                        key={skill}
                                        onClick={() => handleToggleSkill(skill)}
                                        className={`min-w-touch min-h-touch px-3 py-1 text-xs rounded-full transition-colors ${employeeSkills.includes(skill) ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="min-w-touch min-h-touch px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={`min-w-touch min-h-touch px-4 py-2 text-white rounded-lg font-medium transition-colors ${!name.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
