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
        <aside
            className={`absolute top-0 left-0 h-full w-[280px] bg-white/40 backdrop-blur-md backdrop-brightness-95 border-r border-white/30 flex flex-col z-40 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
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
