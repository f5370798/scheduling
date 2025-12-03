import React, { useState } from 'react';
import Icon from './Icon';
import { ROLES } from '../constants/roles';

/**
 * 員工列表元件
 * 顯示所有員工及其基本資訊，並提供新增、編輯和刪除功能
 * 特性：依照職位分組，並依姓名筆畫排序
 */
const EmployeeList = ({
    employees,
    onEdit,
    onDelete,
    onAddEmployee
}) => {
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpRole, setNewEmpRole] = useState(ROLES[0]);

    const handleAdd = () => {
        if (newEmpName.trim()) {
            onAddEmployee(newEmpName, newEmpRole);
            setNewEmpName('');
            setNewEmpRole(ROLES[0]);
        }
    };

    const handleDelete = (emp) => {
        onDelete(emp);
    };

    const getMajorShiftLabel = (shift) => {
        switch (shift) {
            case 'FULL': return '全日';
            case 'MORNING': return '上午';
            case 'AFTERNOON': return '下午';
            default: return shift;
        }
    };

    // 分組與排序邏輯
    const groupedEmployees = ROLES.reduce((acc, role) => {
        // 1. 篩選出該職位的員工
        const empsInRole = employees.filter(e => e.role === role);

        // 2. 依照姓名排序 (使用 localeCompare 支援中文筆畫/拼音排序)
        empsInRole.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));

        if (empsInRole.length > 0) {
            acc[role] = empsInRole;
        }
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col border-r border-white/20">
            {/* Header: 新增員工表單 */}
            <div className="p-4 border-b border-white/20">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    員工
                </h4>
                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="輸入新員工姓名"
                            value={newEmpName}
                            onChange={(e) => setNewEmpName(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300/50 bg-white/50 rounded hover:border-indigo-400 focus:border-indigo-500 focus:outline-none transition-colors backdrop-blur-sm"
                        />
                        <Icon name="UserPlus" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={newEmpRole}
                            onChange={(e) => setNewEmpRole(e.target.value)}
                            className="flex-1 px-2 py-2 text-sm border border-slate-300/50 bg-white/50 rounded hover:border-indigo-400 focus:border-indigo-500 focus:outline-none backdrop-blur-sm"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={!newEmpName.trim()}
                            className={`px-3 py-2 text-white rounded transition-colors flex items-center justify-center min-w-[40px] ${newEmpName.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'bg-indigo-300 cursor-not-allowed'
                                }`}
                            title="新增員工"
                        >
                            <Icon name="Plus" size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {employees.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">尚無員工資料</p>
                ) : (
                    ROLES.map(role => {
                        const emps = groupedEmployees[role];
                        if (!emps) return null;

                        return (
                            <div key={role} className="mb-4 last:mb-0">
                                <h5 className="text-xs font-bold text-slate-600 px-1 mb-2 flex items-center gap-1">
                                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                                    {role} ({emps.length})
                                </h5>
                                <div className="space-y-2">
                                    {emps.map(emp => (
                                        <div
                                            key={emp.id}
                                            className="group hover:bg-white/50 p-3 rounded border border-transparent hover:border-white/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                                                    </div>

                                                    {/* 主診資訊顯示 */}
                                                    {emp.majorShift && emp.majorShift !== 'NONE' && (
                                                        <div className="mt-1.5 flex items-center gap-1">
                                                            <span className="text-[10px] font-semibold text-sky-800">
                                                                {emp.mainSessionId || '未定'}
                                                            </span>
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-sky-100/50 text-sky-800 rounded border border-sky-200/50">
                                                                {getMajorShiftLabel(emp.majorShift)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onEdit(emp)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded"
                                                        title="編輯"
                                                    >
                                                        <Icon name="Edit2" size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp)}
                                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                                        title="刪除"
                                                    >
                                                        <Icon name="Trash2" size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {emp.skills && emp.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-slate-200/50">
                                                    {emp.skills.map(skill => (
                                                        <span
                                                            key={skill}
                                                            className="text-[10px] px-1.5 py-0.5 bg-orange-100/50 text-orange-800 rounded border border-orange-200/50"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Count */}
            <div className="p-2 border-t border-white/20 text-center bg-white/10 backdrop-blur-sm">
                <span className="text-xs text-slate-600 font-medium">
                    總計 {employees.length} 位員工
                </span>
            </div>
        </div>
    );
};

export default EmployeeList;
