import React from 'react';
import EmployeeList from './EmployeeList';

/**
 * 側邊欄元件
 * 包含：員工列表
 */
const Sidebar = ({
    isOpen,
    employees,
    onEditEmployee,
    onDeleteEmployee,
    onSetMajorShift,
    onAddEmployee
}) => {
    return (
        <aside className={`shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out ${isOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <EmployeeList
                employees={employees}
                onEdit={onEditEmployee}
                onDelete={onDeleteEmployee}
                onSetMajorShift={onSetMajorShift}
                onAddEmployee={onAddEmployee}
            />
        </aside>
    );
};

export default Sidebar;
