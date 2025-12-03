import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from './components/Icon';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ConfirmationModal from './components/ConfirmationModal';
import MajorShiftModal from './components/MajorShiftModal';
import ManageVisibleShiftsModal from './components/ManageVisibleShiftsModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import ManageSkillsModal from './components/ManageSkillsModal';
import ManageShiftsModal from './components/ManageShiftsModal';
import ShiftSelectionModal from './components/ShiftSelectionModal';
import MissingShiftsModal from './components/MissingShiftsModal';
import TrackingReportModal from './components/TrackingReportModal';
import ExportMenu from './components/ExportMenu';
import SettingsMenu from './components/SettingsMenu';
import ScheduleTable from './components/ScheduleTable';
import EmployeeReorderModal from './components/EmployeeReorderModal';
import MonthSelectionModal from './components/MonthSelectionModal';

import useHistory from './hooks/useHistory';
import ManageTimeSlotsModal from './components/ManageTimeSlotsModal';
import ReloadPrompt from './components/ReloadPrompt';

import IndividualScheduleModal from './components/IndividualScheduleModal';
import ManageDoctorsModal from './components/ManageDoctorsModal';
import QuickFillToolbar from './components/QuickFillToolbar';
import SystemInfoModal from './components/SystemInfoModal';
import BackupManagerModal from './components/BackupManagerModal';

import { ROLES } from './constants/roles';
import { ALL_SHIFT_TYPES } from './constants/shifts';
import { ALL_TIME_SLOTS as INITIAL_TIME_SLOTS } from './constants/timeSlots';
import { INITIAL_SKILLS, INITIAL_CUSTOM_SHIFT_RULES, DEFAULT_EMPLOYEES } from './constants/defaultData';
import {
    formatDateKey,
    getWeekOfMonth,
    buildShiftData,
    getShiftLabel,
    getShiftMemo,
    cleanupOldScheduleData
} from './utils/dataUtils';
import { getSystemInfo } from './utils/performance';
import { getBackupList, createBackup, restoreBackup, deleteBackup, renameBackup } from './utils/backupManager';

import ToastContainer from './components/Toast';
import { TOAST_TYPES } from './constants/ui';

/**
 * @typedef {Object} Employee 員工資料
 * @property {number} id - 員工 ID
 * @property {string} name - 姓名
 * @property {string} role - 職稱 (Doctor/Nurse/Admin)
 * @property {boolean} isActive - 是否在職
 * @property {number} [displayOrder] - 顯示順序
 */

/**
 * @typedef {Object} ShiftRule 診次規則
 * @property {string} shiftType - 班別 (如: 71診)
 * @property {string} timeSlot - 時段 (Morning/Afternoon/Night)
 * @property {string} sessionId - 診次代碼 (如: 01, 02)
 * @property {number} capacity - 需求人數
 * @property {number[]} days - 星期幾 (1-6)
 * @property {number[]} weekFrequency - 週頻率 (1-5)
 * @property {string[]} [requiredSkills] - 必要技能
 */

/**
 * 主應用程式元件
 * 負責管理所有全域狀態、路由與核心邏輯
 */
function App() {
    // ============ 狀態管理 ============

    // Toast 通知狀態
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = TOAST_TYPES.INFO, category = null) => {
        const id = Date.now();
        setToasts(prev => {
            // 如果有指定類別，先移除同類別的舊 Toast
            const filtered = category ? prev.filter(t => t.category !== category) : prev;
            return [...filtered, { id, message, type, category }];
        });
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // 當前排班月份 (預設為下個月)
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    });

    // 初始化日期：預設為當前月份的第一週週一
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const day = nextMonth.getDay();
        const diff = nextMonth.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(nextMonth.setDate(diff));
    });

    // 當月份改變時，重設週次到該月第一週
    useEffect(() => {
        const day = currentMonth.getDay();
        const diff = currentMonth.getDate() - day + (day === 0 ? -6 : 1);
        const newStart = new Date(new Date(currentMonth).setDate(diff));
        setCurrentWeekStart(newStart);
    }, [currentMonth]);

    // ============ 全域狀態管理 (支援 Undo/Redo) ============
    const [appState, setAppState, { undo, redo, canUndo, canRedo }] = useHistory(() => {
        const safeJSONParse = (key, defaultValue) => {
            try {
                const saved = localStorage.getItem(key);
                if (!saved || saved === 'undefined' || saved === 'null') return defaultValue;
                return JSON.parse(saved);
            } catch (e) {
                console.error(`Error parsing ${key}:`, e);
                return defaultValue;
            }
        };

        // 自動清理舊資料邏輯 (保留 90 天內的資料)
        const cleanupOldSchedule = (data) => {
            try {
                const { cleanedData, deletedCount } = cleanupOldScheduleData(data);

                if (deletedCount > 0) {
                    console.log(`[Auto Cleanup] 已自動清理 ${deletedCount} 筆舊排班資料`);
                }
                return cleanedData;
            } catch (error) {
                console.error('Auto cleanup failed:', error);
                return data; // 如果出錯，回傳原始資料以確保安全
            }
        };

        const rawSchedule = safeJSONParse('schedulingData', {});
        const cleanedSchedule = cleanupOldSchedule(rawSchedule);

        return {
            employees: safeJSONParse('schedulingEmployees', DEFAULT_EMPLOYEES),
            schedule: cleanedSchedule,
            skills: safeJSONParse('schedulingSkills', INITIAL_SKILLS),
            customShiftRules: safeJSONParse('schedulingRules', INITIAL_CUSTOM_SHIFT_RULES),
            visibleShifts: safeJSONParse('schedulingVisibleShifts', ALL_SHIFT_TYPES),
            timeSlots: safeJSONParse('schedulingTimeSlots', INITIAL_TIME_SLOTS),
            shiftDoctors: safeJSONParse('schedulingShiftDoctors', [])
        };
    });


    // 解構狀態以便向下相容
    const { employees, schedule, skills, customShiftRules, visibleShifts, timeSlots, shiftDoctors } = appState;

    // ============ 效能優化：使用 useMemo 快取計算結果 ============

    // 快取在職員工列表 (避免每次渲染都重新過濾)
    const activeEmployees = useMemo(() =>
        employees.filter(e => e.isActive !== false),
        [employees]
    );

    // 快取規則查找 Map (O(1) 查找效能，取代 O(n) 的 find)
    const rulesBySessionId = useMemo(() => {
        const map = new Map();
        customShiftRules.forEach(rule => {
            const normalizedId = String(rule.sessionId).replace(/診/g, '').trim();
            map.set(normalizedId, rule);
        });
        return map;
    }, [customShiftRules]);

    // 快取規則查找 Map (依班別 + 診次組合)
    const rulesByShiftAndSession = useMemo(() => {
        const map = new Map();
        customShiftRules.forEach(rule => {
            const key = `${rule.shiftType}_${String(rule.sessionId).replace(/診/g, '').trim()}`;
            map.set(key, rule);
        });
        return map;
    }, [customShiftRules]);

    // 封裝 setters 以更新全域狀態
    const setEmployees = (action, description = '更新員工資料') => {
        setAppState(prev => ({
            ...prev,
            employees: typeof action === 'function' ? action(prev.employees) : action
        }), description);
    };

    const setSchedule = (action, description = '更新排班資料') => {
        setAppState(prev => ({
            ...prev,
            schedule: typeof action === 'function' ? action(prev.schedule) : action
        }), description);
    };

    const setSkills = (action, description = '更新技能列表') => {
        setAppState(prev => ({
            ...prev,
            skills: typeof action === 'function' ? action(prev.skills) : action
        }), description);
    };

    const setCustomShiftRules = (action, description = '更新診次規則') => {
        setAppState(prev => ({
            ...prev,
            customShiftRules: typeof action === 'function' ? action(prev.customShiftRules) : action
        }), description);
    };

    const setVisibleShifts = (action, description = '更新班別顯示設定') => {
        setAppState(prev => ({
            ...prev,
            visibleShifts: typeof action === 'function' ? action(prev.visibleShifts) : action
        }), description);
    };

    const setTimeSlots = (action, description = '更新時段設定') => {
        setAppState(prev => ({
            ...prev,
            timeSlots: typeof action === 'function' ? action(prev.timeSlots) : action
        }), description);
    };

    const setShiftDoctors = (action, description = '更新診次醫師設定') => {
        setAppState(prev => ({
            ...prev,
            shiftDoctors: typeof action === 'function' ? action(prev.shiftDoctors) : action
        }), description);
    };

    // ============ Undo/Redo 處理 ============
    const handleUndo = () => {
        const action = undo();
        if (action) showToast(`已復原：${action}`, TOAST_TYPES.INFO, 'UNDO_REDO');
    };

    const handleRedo = () => {
        const action = redo();
        if (action) showToast(`已重做：${action}`, TOAST_TYPES.INFO, 'UNDO_REDO');
    };

    // 模態框狀態
    const [selectionModal, setSelectionModal] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [majorShiftModal, setMajorShiftModal] = useState(null);
    const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);
    const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
    const [isManageVisibleShiftsOpen, setIsManageVisibleShiftsOpen] = useState(false);
    const [isManageTimeSlotsOpen, setIsManageTimeSlotsOpen] = useState(false);
    const [isManageDoctorsOpen, setIsManageDoctorsOpen] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [missingShiftsReport, setMissingShiftsReport] = useState(null);
    const [trackingReport, setTrackingReport] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(null);
    const [showIndividualExportModal, setShowIndividualExportModal] = useState(false);
    const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);
    const [isBackupManagerOpen, setIsBackupManagerOpen] = useState(false);
    const [backups, setBackups] = useState({});

    const settingsMenuContainerRef = useRef(null);
    const settingsButtonRef = useRef(null);





    // ============ 快速填寫工具狀態 ============
    const [activeTool, setActiveTool] = useState('SELECT');


    // ============ LocalStorage 同步 (統一管理) ============
    // 優化：合併為單一 useEffect，減少重複執行，提升可維護性
    useEffect(() => {
        // 批次寫入所有資料到 localStorage
        const syncData = {
            schedulingEmployees: employees,
            schedulingData: schedule,
            schedulingTimeSlots: timeSlots,
            schedulingSkills: skills,
            schedulingRules: customShiftRules,
            schedulingVisibleShifts: visibleShifts,
            schedulingShiftDoctors: shiftDoctors
        };

        // 統一寫入，未來可輕鬆加入壓縮、錯誤處理等功能
        Object.entries(syncData).forEach(([key, value]) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(`Failed to save ${key} to localStorage:`, error);
                // 可選：顯示錯誤提示給使用者
            }
        });
    }, [employees, schedule, timeSlots, skills, customShiftRules, visibleShifts, shiftDoctors]);

    // ============ 載入備份列表 ============
    useEffect(() => {
        if (isBackupManagerOpen) {
            setBackups(getBackupList());
        }
    }, [isBackupManagerOpen]);

    // ============ 鍵盤快捷鍵 (Undo/Redo) ============
    useEffect(() => {
        const handleKeyDown = (e) => {
            // 檢查是否按下 Ctrl 鍵 (Mac 上是 Meta 鍵)
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (canUndo) handleUndo();
            }
            // Redo: Ctrl+Y 或 Ctrl+Shift+Z
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault();
                if (canRedo) handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    // ============ 計算當週日期 (7天) ============
    const currentWeekDays = useMemo(() => {
        const days = [];
        const start = new Date(currentWeekStart);

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push({
                date: date,
                dateKey: formatDateKey(date),
                dayOfWeek: date.getDay(), // 0 is Sunday
                dayNumber: date.getDate()
            });
        }
        return days;
    }, [currentWeekStart]);

    // ============ 計算當月所有日期 (用於列印) ============
    const fullMonthDays = useMemo(() => {
        const days = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({
                date: date,
                dateKey: formatDateKey(date),
                dayOfWeek: date.getDay(),
                dayNumber: date.getDate()
            });
        }
        return days;
    }, [currentMonth]);

    // ============ 建構班別階層 ============
    const { SHIFT_HIERARCHY } = useMemo(() => buildShiftData(customShiftRules), [customShiftRules]);

    // ============ 週次導航 (限制在當前月份相關週次) ============
    const handlePreviousWeek = () => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 7);

            // 檢查上一週的結束日期是否小於當月1號 (完全在上個月)
            const weekEnd = new Date(newDate);
            weekEnd.setDate(newDate.getDate() + 6);
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

            if (weekEnd < currentMonthStart) {
                return prev;
            }
            return newDate;
        });
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 7);

            // 檢查下一週的開始日期是否大於當月最後一天 (完全在下個月)
            const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            if (newDate > currentMonthEnd) {
                return prev;
            }
            return newDate;
        });
    };

    const handleMonthSelect = (newDate) => {
        setCurrentMonth(newDate);
    };

    const handleResetToCurrentMonth = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    };

    // ============ 員工管理 ============
    const handleAddEmployee = (name, role) => {
        if (!name || !name.trim()) return;

        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        const newEmployee = {
            id: newId,
            name: name.trim(),
            role: role || '正職',
            skills: [],
            majorShift: 'NONE',
            mainSessionId: ''
        };

        setEmployees([...employees, newEmployee], '新增員工');
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
    };

    const handleEditSave = (updatedEmployee) => {
        setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e), '編輯員工資料');
        setEditingEmployee(null);
    };

    const handleDeleteEmployee = (emp) => {
        setConfirmationModal({
            title: '刪除員工',
            message: `確定要刪除員工「${emp.name}」嗎？此操作將同時移除該員工的所有排班資料，且無法復原。`,
            isDestructive: true,
            confirmText: '確認刪除',
            onConfirm: () => {
                performDeleteEmployee(emp.id);
                setConfirmationModal(null);
            },
            onCancel: () => setConfirmationModal(null)
        });
    };

    const performDeleteEmployee = (empId) => {
        // 使用 setAppState 進行原子更新，確保 undo 能同時恢復員工和排班
        setAppState(prev => {
            const newEmployees = prev.employees.filter(e => e.id !== empId);
            const newSchedule = {};
            Object.keys(prev.schedule).forEach(key => {
                const [date, id, shift] = key.split('_');
                if (parseInt(id) !== empId) {
                    newSchedule[key] = prev.schedule[key];
                }
            });
            return {
                ...prev,
                employees: newEmployees,
                schedule: newSchedule
            };
        }, '刪除員工');
    };

    const handleMajorShiftSave = (empId, newMajorShift, newMainSessionId) => {
        setEmployees(employees.map(e =>
            e.id === empId ? { ...e, majorShift: newMajorShift, mainSessionId: newMainSessionId } : e
        ), '更新主診/時段');
        setMajorShiftModal(null);
    };

    // ============ 排班操作 ============
    const handleCellClick = (dateKey, dateDisplay, empId, empName, shiftType, empSkills) => {
        const currentData = schedule[`${dateKey}_${empId}_${shiftType}`];
        const currentLabel = currentData ? getShiftLabel(currentData) : 'OFF';
        const currentMemo = currentData ? getShiftMemo(currentData) : '';

        const allShiftDetails = {};
        ALL_SHIFT_TYPES.forEach(st => {
            const key = `${dateKey}_${empId}_${st}`;
            allShiftDetails[st] = schedule[key] || null;
        });

        setSelectionModal({
            dateKey,
            dateDisplay,
            employeeName: empName,
            empId,
            shiftType,
            currentLabel,
            currentMemo,
            allShiftDetails,
            employeeSkills: empSkills,
            customShiftRules
        });
    };

    const handleShiftSave = (empId, shiftType, label, memo) => {
        const newSchedule = { ...schedule };

        // 如果是設定 OFF 或 OFF_CONFIRMED，則套用到當天所有時段
        if (label === 'OFF' || label === 'OFF_CONFIRMED') {
            ALL_SHIFT_TYPES.forEach(st => {
                const key = `${selectionModal.dateKey}_${empId}_${st}`;
                newSchedule[key] = memo ? { label, memo } : label;
            });
        } else {
            // 設定一般班別時
            const key = `${selectionModal.dateKey}_${empId}_${shiftType}`;

            // 1. 設定當前時段
            if (label.includes(' / ')) {
                newSchedule[key] = memo ? { label, memo } : label;
            } else {
                newSchedule[key] = label;
            }

            // 2. 檢查其他時段，如果是 OFF 則自動清除
            ALL_SHIFT_TYPES.forEach(st => {
                if (st !== shiftType) {
                    const otherKey = `${selectionModal.dateKey}_${empId}_${st}`;
                    const otherData = newSchedule[otherKey];
                    const otherLabel = getShiftLabel(otherData);

                    if (otherLabel === 'OFF' || otherLabel === 'OFF_CONFIRMED') {
                        delete newSchedule[otherKey];
                    }
                }
            });
        }

        setSchedule(newSchedule, '更新排班');
        setSelectionModal(null);
    };

    const handleShiftClear = (empId, shiftType) => {
        const key = `${selectionModal.dateKey}_${empId}_${shiftType}`;
        const currentData = schedule[key];
        const currentLabel = getShiftLabel(currentData);

        const newSchedule = { ...schedule };

        // 如果當前是 OFF 或 OFF_CONFIRMED，則清除當天所有時段
        if (currentLabel === 'OFF' || currentLabel === 'OFF_CONFIRMED') {
            ALL_SHIFT_TYPES.forEach(st => {
                const k = `${selectionModal.dateKey}_${empId}_${st}`;
                delete newSchedule[k];
            });
        } else {
            delete newSchedule[key];
        }

        setSchedule(newSchedule, '清除排班');
        setSelectionModal(null);
        setSchedule(newSchedule, '清除排班');
        setSelectionModal(null);
    };

    // ============ 快速填寫邏輯 (平板優先) ============
    const handleQuickFill = (dateKey, empId, shiftType) => {
        // 1. 清除模式
        if (activeTool === 'ERASER') {
            const key = `${dateKey}_${empId}_${shiftType}`;
            if (schedule[key]) {
                const newSchedule = { ...schedule };
                delete newSchedule[key];

                // 如果是 OFF，清除整天
                const currentLabel = getShiftLabel(schedule[key]);
                if (currentLabel === 'OFF' || currentLabel === 'OFF_CONFIRMED') {
                    ALL_SHIFT_TYPES.forEach(st => {
                        delete newSchedule[`${dateKey}_${empId}_${st}`];
                    });
                }

                setSchedule(newSchedule, '快速清除排班');
            }
            return;
        }

        // 2. 智慧填寫模式 (PAINT)
        if (activeTool === 'PAINT') {
            const employee = employees.find(e => e.id === empId);
            if (!employee) return;

            // 決定要填入的內容
            let newLabel = '';

            // 檢查是否有主要診次
            if (employee.mainSessionId && employee.mainSessionId !== '') {
                // 核心邏輯：在規則中尋找 "主診代碼" + "當前班別" 的匹配項
                // 使用快取的 Map 進行 O(1) 查找，取代原本的 O(n) find
                const normalizedSessionId = String(employee.mainSessionId).replace(/診/g, '').trim();
                const lookupKey = `${shiftType}_${normalizedSessionId}`;
                const matchedRule = rulesByShiftAndSession.get(lookupKey);

                if (matchedRule) {
                    // 如果找到了匹配的規則，直接使用該規則的時段填入
                    newLabel = `${shiftType} / ${matchedRule.timeSlot} / ${employee.mainSessionId}`;
                }
            }

            // 如果沒有主要診次，則開啟選擇視窗
            if (!newLabel) {
                const dateObj = new Date(dateKey);
                const dateDisplay = dateObj.toLocaleDateString('zh-TW');
                handleCellClick(dateKey, dateDisplay, empId, employee.name, shiftType, employee.skills);
                return;
            }

            const key = `${dateKey}_${empId}_${shiftType}`;
            const newSchedule = { ...schedule };

            // 設定新值
            newSchedule[key] = newLabel;

            // 清除同天其他時段的 OFF
            ALL_SHIFT_TYPES.forEach(st => {
                if (st !== shiftType) {
                    const otherKey = `${dateKey}_${empId}_${st}`;
                    const otherData = newSchedule[otherKey];
                    const otherLabel = getShiftLabel(otherData);
                    if (otherLabel === 'OFF' || otherLabel === 'OFF_CONFIRMED') {
                        delete newSchedule[otherKey];
                    }
                }
            });

            setSchedule(newSchedule, '快速排班');
        }
    };

    // ============ 拖曳排班處理 ============
    const handleShiftMove = (from, to) => {
        const fromKey = `${from.dateKey}_${from.empId}_${from.shiftType}`;
        const toKey = `${to.dateKey}_${to.empId}_${to.shiftType}`;

        // 1. 基本檢查：來源目標相同，或班別不同，則不處理
        if (fromKey === toKey) return;
        if (from.shiftType !== to.shiftType) {
            showToast('只能在相同班別之間移動', TOAST_TYPES.ERROR);
            return;
        }

        const newSchedule = { ...schedule };
        const fromContent = newSchedule[fromKey];
        const toContent = newSchedule[toKey];

        // 如果來源是空的，不做任何事
        if (!fromContent) return;

        // 3. 規則驗證 (Rule Validation)
        const parseSessionId = (content) => {
            const label = getShiftLabel(content);
            const parts = label.split(' / ');
            return parts.length === 3 ? parts[2] : null;
        };

        const isRuleValid = (sessionId, dateKey) => {
            if (!sessionId) return true; // 非診次 (如 OFF) 不檢查規則

            const normalizedSessionId = String(sessionId).replace(/診/g, '').trim();
            const date = new Date(dateKey);
            const dayOfWeek = date.getDay();
            // 使用當前選中的月份來計算週次，確保跨月邊界正確
            const weekOfMonth = getWeekOfMonth(date, currentMonth);

            // 使用快取的 Map 進行 O(1) 查找
            const rule = rulesBySessionId.get(normalizedSessionId);

            if (!rule) return true; // 找不到規則時允許操作

            // 檢查星期 (使用 days 屬性)
            if (rule.days && rule.days.length > 0 && !rule.days.includes(dayOfWeek)) {
                return false;
            }
            // 檢查週次 (使用 weekFrequency 屬性)
            if (rule.weekFrequency && rule.weekFrequency.length > 0 && !rule.weekFrequency.includes(weekOfMonth)) {
                return false;
            }
            return true;
        };

        const fromSessionId = parseSessionId(fromContent);
        if (fromSessionId && !isRuleValid(fromSessionId, to.dateKey)) {
            showToast(`${fromSessionId} 不允許排在該日期 (規則限制)`, TOAST_TYPES.ERROR);
            return;
        }

        if (toContent) {
            const toSessionId = parseSessionId(toContent);
            if (toSessionId && !isRuleValid(toSessionId, from.dateKey)) {
                showToast(`${toSessionId} 不允許排在該日期 (規則限制)`, TOAST_TYPES.ERROR);
                return;
            }

            // 目標有資料 -> 交換
            newSchedule[toKey] = fromContent;
            newSchedule[fromKey] = toContent;
            setSchedule(newSchedule, `交換排班: ${from.dateDisplay} <-> ${to.dateDisplay}`);
            showToast('排班已交換', TOAST_TYPES.SUCCESS);
        } else {
            // 目標無資料 -> 移動
            newSchedule[toKey] = fromContent;
            delete newSchedule[fromKey];
            setSchedule(newSchedule, `移動排班: ${from.dateDisplay} -> ${to.dateDisplay}`);
            showToast('排班已移動', TOAST_TYPES.SUCCESS);
        }
    };
    const getSessionCapacity = (dateKey, fullShiftKey) => {
        let count = 0;
        Object.keys(schedule).forEach(key => {
            if (key.startsWith(dateKey)) {
                const data = schedule[key];
                const label = getShiftLabel(data);
                if (label.startsWith(fullShiftKey)) {
                    count++;
                }
            }
        });
        return count;
    };

    // ============ 技能管理 ============
    const checkSkillUsage = (skill) => {
        const usedByEmployees = employees.filter(e => e.skills && e.skills.includes(skill)).map(e => e.name);
        const usedByRules = customShiftRules
            .filter(r => r.requiredSkills && r.requiredSkills.includes(skill))
            .map(r => r.sessionId);

        return { employees: usedByEmployees, rules: usedByRules };
    };

    const handleSaveSkills = (newSkills) => {
        setSkills(newSkills, '更新技能列表');
        setIsManageSkillsOpen(false);
        showToast('技能列表已更新', TOAST_TYPES.SUCCESS);
    };

    const handleForceDeleteSkill = (skillToDelete) => {
        // 使用 setAppState 進行原子更新
        setAppState(prev => {
            // 1. 從技能列表中移除
            const newSkills = prev.skills.filter(s => s !== skillToDelete);

            // 2. 從所有員工的技能中移除
            const newEmployees = prev.employees.map(emp => ({
                ...emp,
                skills: emp.skills ? emp.skills.filter(s => s !== skillToDelete) : []
            }));

            // 3. 從所有診次規則的需求技能中移除
            const newRules = prev.customShiftRules.map(rule => ({
                ...rule,
                requiredSkills: rule.requiredSkills ? rule.requiredSkills.filter(s => s !== skillToDelete) : []
            }));

            return {
                ...prev,
                skills: newSkills,
                employees: newEmployees,
                customShiftRules: newRules
            };
        }, `強制刪除技能「${skillToDelete}」`);

        setIsManageSkillsOpen(false);
        showToast(`已強制刪除技能「${skillToDelete}」並更新相關資料`, TOAST_TYPES.SUCCESS);
    };

    // ============ 規則管理 ============
    const handleSaveRules = (newRules) => {
        setCustomShiftRules(newRules, '更新診次規則');
        setIsManageShiftsOpen(false);
        showToast('診次規則已更新', TOAST_TYPES.SUCCESS);
    };

    // ============ 可見班別管理 ============
    const handleSaveVisibleShifts = (newVisibleShifts) => {
        setVisibleShifts(newVisibleShifts, '更新班別顯示設定');
        setIsManageVisibleShiftsOpen(false);
        showToast('班別顯示設定已更新', TOAST_TYPES.SUCCESS);
    };

    // ============ 時段管理 ============
    const checkTimeSlotUsage = (timeSlot, shiftType) => {
        // 1. 檢查診次規則
        const usedByRules = customShiftRules
            .filter(r => r.timeSlot === timeSlot && r.shiftType === shiftType)
            .map(r => r.sessionId);

        // 2. 檢查排班資料
        const usedBySchedule = [];
        Object.keys(schedule).forEach(key => {
            const data = schedule[key];
            const label = typeof data === 'object' ? data.label : data;
            if (label && label.includes(' / ')) {
                const parts = label.split(' / ');
                if (parts[0] === shiftType && parts[1] === timeSlot) {
                    const datePart = key.split('_')[0];
                    if (!usedBySchedule.includes(datePart)) {
                        usedBySchedule.push(datePart);
                    }
                }
            }
        });

        return { rules: usedByRules, scheduleDates: usedBySchedule };
    };

    const handleSaveTimeSlots = (newTimeSlots) => {
        setTimeSlots(newTimeSlots, '更新時段設定');
        setIsManageTimeSlotsOpen(false);
        showToast('時段設定已更新', TOAST_TYPES.SUCCESS);
    };

    // ============ 匯出/匯入 ============
    // ============ 匯出/匯入 ============
    /**
     * 匯出所有系統資料為 JSON 檔案
     * 包含：員工、排班、技能、規則、顯示設定、時段、診次醫師
     */
    const handleExportJSON = () => {
        const exportData = {
            version: '1.0.4',
            employees,
            schedule,
            skills,
            customShiftRules,
            visibleShifts,
            timeSlots,
            shiftDoctors,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scheduling_backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    /**
     * 從 JSON 檔案匯入系統資料
     * 會執行格式驗證，並一次性更新所有狀態
     */
    const handleImportJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);

                    // 基本格式驗證
                    if (!importedData || typeof importedData !== 'object') {
                        throw new Error('無效的資料格式');
                    }

                    // 檢查是否包含必要的資料欄位
                    const hasValidData =
                        (Array.isArray(importedData.employees)) ||
                        (importedData.schedule && typeof importedData.schedule === 'object') ||
                        (Array.isArray(importedData.customShiftRules));

                    if (!hasValidData) {
                        showToast('匯入失敗：檔案內容不符合系統格式', TOAST_TYPES.ERROR);
                        return;
                    }

                    // 執行匯入 (使用 setAppState 一次性更新)
                    setAppState(prev => ({
                        ...prev,
                        employees: Array.isArray(importedData.employees) ? importedData.employees : prev.employees,
                        schedule: (importedData.schedule && typeof importedData.schedule === 'object') ? importedData.schedule : prev.schedule,
                        skills: Array.isArray(importedData.skills) ? importedData.skills : prev.skills,
                        customShiftRules: Array.isArray(importedData.customShiftRules) ? importedData.customShiftRules : prev.customShiftRules,
                        visibleShifts: Array.isArray(importedData.visibleShifts) ? importedData.visibleShifts : prev.visibleShifts,
                        timeSlots: (importedData.timeSlots && typeof importedData.timeSlots === 'object') ? importedData.timeSlots : prev.timeSlots,
                        shiftDoctors: Array.isArray(importedData.shiftDoctors) ? importedData.shiftDoctors : prev.shiftDoctors
                    }));

                    showToast('資料匯入成功！', TOAST_TYPES.SUCCESS);
                } catch (error) {
                    console.error('Import Error:', error);
                    showToast('匯入失敗：檔案格式錯誤或損毀', TOAST_TYPES.ERROR);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleExportPDF = () => {
        window.print();
    };

    // ============ 檢查漏排診次 ============
    const handleCheckMissingShifts = () => {
        const report = {};

        currentWeekDays.forEach(day => {
            if (day.dayOfWeek === 0) return; // 跳過週日

            const dayReport = {};
            const weekOfMonth = getWeekOfMonth(day.date, currentMonth);

            customShiftRules.forEach(rule => {
                if (!rule.days.includes(day.dayOfWeek)) return;
                if (!rule.weekFrequency.includes(weekOfMonth)) return;

                const fullShiftKey = `${rule.shiftType} / ${rule.timeSlot} / ${rule.sessionId}`;
                const currentUsage = getSessionCapacity(day.dateKey, fullShiftKey);
                const missing = rule.capacity - currentUsage;

                if (missing > 0) {
                    dayReport[fullShiftKey] = {
                        capacity: rule.capacity,
                        currentUsage,
                        missing,
                        requiredSkills: rule.requiredSkills || []
                    };
                }
            });

            if (Object.keys(dayReport).length > 0) {
                report[day.dateKey] = dayReport;
            }
        });

        setMissingShiftsReport(report);
    };

    // ============ 生成追蹤報告 (僅限當月) ============
    const handleGenerateTrackingReport = () => {
        const report = {};
        const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

        employees.forEach(emp => {
            const empReport = {};

            customShiftRules.forEach(rule => {
                if (!rule.isTracked) return;

                const targetShiftKey = `${rule.shiftType} / ${rule.timeSlot} / ${rule.sessionId}`;
                let count = 0;
                let dates = [];

                Object.keys(schedule).forEach(key => {
                    const [date, schEmpId, schShiftType] = key.split('_');
                    if (parseInt(schEmpId) !== emp.id) return;

                    // 檢查日期是否屬於當前月份
                    if (!date.startsWith(currentMonthStr)) return;

                    const fullLabelData = schedule[key];
                    const fullLabel = getShiftLabel(fullLabelData);

                    if (fullLabel.startsWith(targetShiftKey)) {
                        count++;
                        dates.push(date);
                    }
                });

                if (count > 0) {
                    empReport[targetShiftKey] = { count, dates };
                }
            });

            if (Object.keys(empReport).length > 0) {
                report[emp.name] = empReport;
            }
        });

        setTrackingReport(report);
    };

    // ============ 備份管理 ============
    const handleCreateBackup = (name) => {
        const fullData = {
            version: '1.0.4',
            employees,
            schedule,
            skills,
            customShiftRules,
            visibleShifts,
            timeSlots,
            shiftDoctors,
            exportDate: new Date().toISOString()
        };

        createBackup(fullData, name);
        setBackups(getBackupList());
        showToast('備份建立成功', TOAST_TYPES.SUCCESS);
    };

    const handleRestoreBackup = (backupId) => {
        const data = restoreBackup(backupId);
        if (data) {
            // 恢復所有狀態
            if (data.employees) setEmployees(data.employees, '還原備份');
            if (data.schedule) setSchedule(data.schedule, '還原備份');
            if (data.skills) setSkills(data.skills, '還原備份');
            if (data.customShiftRules) setCustomShiftRules(data.customShiftRules, '還原備份');
            if (data.visibleShifts) setVisibleShifts(data.visibleShifts, '還原備份');
            if (data.timeSlots) setTimeSlots(data.timeSlots, '還原備份');
            if (data.shiftDoctors) setShiftDoctors(data.shiftDoctors, '還原備份');

            setIsBackupManagerOpen(false);
            showToast('備份還原成功', TOAST_TYPES.SUCCESS);
        } else {
            showToast('備份還原失敗', TOAST_TYPES.ERROR);
        }
    };

    const handleDeleteBackup = (backupId) => {
        if (deleteBackup(backupId)) {
            setBackups(getBackupList());
            showToast('備份已刪除', TOAST_TYPES.SUCCESS);
        } else {
            showToast('刪除失敗', TOAST_TYPES.ERROR);
        }
    };

    const handleRenameBackup = (backupId, newName) => {
        if (renameBackup(backupId, newName)) {
            setBackups(getBackupList());
            showToast('備份已重新命名', TOAST_TYPES.SUCCESS);
        } else {
            showToast('重新命名失敗', TOAST_TYPES.ERROR);
        }
    };

    // ============ 顯示日期範圍 ============
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <ReloadPrompt />

            {/* 列印專用視圖 (全月) */}
            <div className="hidden print:block p-4">
                <h1 className="text-2xl font-bold text-center mb-4 text-slate-800">
                    {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月 外科門診排班表
                </h1>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <ScheduleTable
                        currentMonthDays={fullMonthDays}
                        employees={employees}
                        schedule={schedule}
                        visibleShifts={visibleShifts}
                        onCellClick={() => { }} // 列印時不需互動
                        onMajorShiftClick={() => { }}
                        highlightedEmpId={null}
                        currentMonth={currentMonth}
                        activeTool="SELECT"
                    />
                </div>
                <div className="mt-4 text-right text-sm text-slate-500">
                    列印日期：{new Date().toLocaleDateString('zh-TW')}
                </div>
            </div>

            {/* 一般視圖 (螢幕顯示) */}
            <div className="h-screen flex flex-col bg-white overflow-hidden print:hidden">
                <Header
                    currentMonth={currentMonth}
                    currentWeekStart={currentWeekStart}
                    onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
                    onPreviousWeek={handlePreviousWeek}
                    onNextWeek={handleNextWeek}
                    onResetWeek={handleResetToCurrentMonth}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onCheckMissingShifts={handleCheckMissingShifts}
                    onOpenReorderModal={() => setIsReorderModalOpen(true)}
                    onExportJSON={handleExportJSON}
                    onImportJSON={handleImportJSON}
                    onExportPDF={handleExportPDF}
                    onExportIndividual={() => setShowIndividualExportModal(true)}
                >
                    {/* 設定選單 (整合至 Header) */}
                    <div className="relative" ref={settingsMenuContainerRef}>
                        <button
                            ref={settingsButtonRef}
                            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                            className={`w-9 h-9 flex items-center justify-center rounded transition-all active:scale-95 shadow-sm border ${isSettingsMenuOpen ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            title="系統設定"
                        >
                            <Icon name="Settings" size={20} />
                        </button>
                        {isSettingsMenuOpen && (
                            <SettingsMenu
                                onManageShifts={() => setIsManageShiftsOpen(true)}
                                onManageDoctors={() => setIsManageDoctorsOpen(true)}
                                onManageSkills={() => setIsManageSkillsOpen(true)}
                                onManageVisibleShifts={() => setIsManageVisibleShiftsOpen(true)}
                                onManageTimeSlots={() => setIsManageTimeSlotsOpen(true)}
                                onGenerateReport={handleGenerateTrackingReport}
                                onShowBackupManager={() => { setIsBackupManagerOpen(true); setIsSettingsMenuOpen(false); }}
                                onShowSystemInfo={() => { setIsSystemInfoOpen(true); setIsSettingsMenuOpen(false); }}
                                onClose={() => setIsSettingsMenuOpen(false)}
                                toggleButtonRef={settingsButtonRef}
                            />
                        )}
                    </div>
                </Header>

                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden relative">
                    <Sidebar
                        isOpen={isSidebarOpen}
                        employees={employees}
                        onEditEmployee={handleEditEmployee}
                        onDeleteEmployee={handleDeleteEmployee}
                        onSetMajorShift={(emp) => setMajorShiftModal(emp)}
                        onAddEmployee={handleAddEmployee}
                    />

                    {/* 右側：排班表 (自適應寬度) */}
                    <section className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 to-slate-100 relative">
                        {/* 側邊欄切換按鈕 */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`absolute top-1/2 -translate-y-1/2 z-50 bg-white border border-slate-200 shadow-md p-0.5 rounded-r-md hover:bg-slate-50 text-slate-500 flex items-center justify-center h-16 w-5 transition-all duration-300 hover:scale-105 ${isSidebarOpen ? 'left-[280px]' : 'left-0'}`}
                            title={isSidebarOpen ? "收起列表" : "展開列表"}
                        >
                            <Icon name={isSidebarOpen ? "ChevronLeft" : "ChevronRight"} size={16} />
                        </button>

                        {/* 圖例與說明 Bar */}
                        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-6 text-xs text-slate-600 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <Icon name="Info" size={14} className="text-slate-400" />
                                <span>點擊格子設定排班。</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-sky-100 border border-sky-300"></span>
                                    <span>早班</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-300"></span>
                                    <span>午班</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-100 border border-indigo-300"></span>
                                    <span>晚班</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-300"></span>
                                    <span>休假 (OFF)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar relative">
                            <ScheduleTable
                                currentMonthDays={currentWeekDays}
                                employees={employees}
                                schedule={schedule}
                                visibleShifts={visibleShifts}
                                onCellClick={(dateKey, dateDisplay, empId, empName, shiftType, empSkills, forceModal = false) => {
                                    if (activeTool === 'SELECT' || forceModal) {
                                        handleCellClick(dateKey, dateDisplay, empId, empName, shiftType, empSkills);
                                    } else {
                                        handleQuickFill(dateKey, empId, shiftType);
                                    }
                                }}
                                onMajorShiftClick={(emp) => setMajorShiftModal(emp)}
                                highlightedEmpId={selectionModal?.empId || editingEmployee?.id}
                                currentMonth={currentMonth}
                                activeTool={activeTool}
                                onShiftMove={handleShiftMove}
                            />
                            {/* 底部空白區，防止被工具列遮擋 */}
                            <div className="h-10 w-full shrink-0 print:hidden" />
                        </div>
                    </section>
                </main>

                {/* 平板快速填寫工具列 */}
                <QuickFillToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                />





                {/* Modals */}
                {selectionModal && (
                    <ShiftSelectionModal
                        {...selectionModal}
                        onCancel={() => setSelectionModal(null)}
                        onSave={handleShiftSave}
                        onClear={handleShiftClear}
                        SHIFT_HIERARCHY={SHIFT_HIERARCHY}
                        getSessionCapacity={getSessionCapacity}
                        scheduleData={schedule}
                    />
                )}

                {editingEmployee && (
                    <EditEmployeeModal
                        employee={editingEmployee}
                        roles={ROLES}
                        skills={skills}
                        onSave={handleEditSave}
                        onCancel={() => setEditingEmployee(null)}
                    />
                )}

                {majorShiftModal && (
                    <MajorShiftModal
                        employee={majorShiftModal}
                        allEmployees={employees}
                        onSave={handleMajorShiftSave}
                        onCancel={() => setMajorShiftModal(null)}
                        customShiftRules={customShiftRules}
                    />
                )}

                {isManageShiftsOpen && (
                    <ManageShiftsModal
                        rules={customShiftRules}
                        onSaveRules={handleSaveRules}
                        onCancel={() => setIsManageShiftsOpen(false)}
                        timeSlots={timeSlots}
                        skills={skills}
                    />
                )}

                {isManageSkillsOpen && (
                    <ManageSkillsModal
                        skills={skills}
                        onSave={handleSaveSkills}
                        onCancel={() => setIsManageSkillsOpen(false)}
                        checkSkillUsage={checkSkillUsage}
                        onForceDelete={handleForceDeleteSkill}
                    />
                )}

                {isManageVisibleShiftsOpen && (
                    <ManageVisibleShiftsModal
                        visibleShifts={visibleShifts}
                        onSave={handleSaveVisibleShifts}
                        onCancel={() => setIsManageVisibleShiftsOpen(false)}
                    />
                )}

                {isManageTimeSlotsOpen && (
                    <ManageTimeSlotsModal
                        timeSlots={timeSlots}
                        onSave={handleSaveTimeSlots}
                        onCancel={() => setIsManageTimeSlotsOpen(false)}
                        checkTimeSlotUsage={checkTimeSlotUsage}
                        showToast={showToast}
                    />
                )}

                {isManageDoctorsOpen && (
                    <ManageDoctorsModal
                        rules={customShiftRules}
                        shiftDoctors={shiftDoctors}
                        onSave={(newDoctors) => {
                            setShiftDoctors(newDoctors);
                            setIsManageDoctorsOpen(false);
                            showToast('已更新診次醫師設定', 'success');
                        }}
                        onCancel={() => setIsManageDoctorsOpen(false)}
                        showToast={showToast}
                    />
                )}

                {missingShiftsReport && (
                    <MissingShiftsModal
                        report={missingShiftsReport}
                        onClose={() => setMissingShiftsReport(null)}
                    />
                )}

                <EmployeeReorderModal
                    isOpen={isReorderModalOpen}
                    onClose={() => setIsReorderModalOpen(false)}
                    employees={employees}
                    onSave={setEmployees}
                />

                <MonthSelectionModal
                    isOpen={isMonthSelectorOpen}
                    onClose={() => setIsMonthSelectorOpen(false)}
                    currentMonth={currentMonth}
                    onMonthChange={handleMonthSelect}
                />

                {showIndividualExportModal && (
                    <IndividualScheduleModal
                        isOpen={showIndividualExportModal}
                        onClose={() => setShowIndividualExportModal(false)}
                        employees={employees}
                        currentMonth={currentMonth}
                        schedule={schedule}
                        customShiftRules={customShiftRules}
                        shiftDoctors={shiftDoctors}
                    />
                )}

                {trackingReport && (
                    <TrackingReportModal
                        report={trackingReport}
                        onClose={() => setTrackingReport(null)}
                        monthLabel={`${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`}
                    />
                )}

                {confirmationModal && (
                    <ConfirmationModal
                        isOpen={!!confirmationModal}
                        title={confirmationModal.title}
                        message={confirmationModal.message}
                        onConfirm={confirmationModal.onConfirm}
                        onCancel={confirmationModal.onCancel}
                        confirmText={confirmationModal.confirmText}
                        cancelText={confirmationModal.cancelText}
                        isDestructive={confirmationModal.isDestructive}
                    />
                )}

                {isBackupManagerOpen && (
                    <BackupManagerModal
                        backups={backups}
                        onCreate={handleCreateBackup}
                        onRestore={handleRestoreBackup}
                        onDelete={handleDeleteBackup}
                        onRename={handleRenameBackup}
                        onClose={() => setIsBackupManagerOpen(false)}
                    />
                )}

                {isSystemInfoOpen && (() => {
                    const systemInfo = getSystemInfo(schedule, employees, customShiftRules);
                    return (
                        <SystemInfoModal
                            systemInfo={systemInfo}
                            onClose={() => setIsSystemInfoOpen(false)}
                        />
                    );
                })()}
            </div>
        </>
    );
}

export default App;
