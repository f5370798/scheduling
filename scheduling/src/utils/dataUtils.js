// 格式化日期鍵 (YYYY-MM-DD)
/**
 * 格式化日期物件為 YYYY-MM-DD 字串格式
 * @param {Date} date - 要格式化的日期物件
 * @returns {string} 格式化後的日期字串 (例如: "2023-12-01")
 */
export const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// 獲取當前日期是當月的第几週 (1-5)
// 獲取當前日期是當月的第几週
/**
 * 計算指定日期是該月份的第幾週
 * 邏輯：以該月 1 號所在的週作為第一週
 * @param {Date} weekStart - 該週的起始日期 (通常是週一)
 * @param {Date} [currentMonth] - 當前月份 (用於計算基準)
 * @returns {number} 第幾週 (1-5)
 */
export const getWeekOfMonth = (weekStart, currentMonth) => {
    if (!currentMonth) {
        const dayOfMonth = weekStart.getDate();
        return Math.ceil(dayOfMonth / 7);
    }

    // 找到 currentMonth 第一天所在的週的起始日 (週一)
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    // 計算該週週一的日期
    // 如果是週日(0)，往前推6天；否則往前推 dayOfWeek - 1 天
    const diff = firstDayOfMonth.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const firstWeekStart = new Date(firstDayOfMonth);
    firstWeekStart.setDate(diff);

    // 計算週數差
    const timeDiff = weekStart.getTime() - firstWeekStart.getTime();
    const weekDiff = Math.round(timeDiff / (7 * 24 * 60 * 60 * 1000));

    return weekDiff + 1;
};

// 從排班數據中獲取標籤
/**
 * 從排班資料中獲取顯示標籤
 * @param {string|Object} shift - 排班資料 (可能是字串或包含 label 的物件)
 * @returns {string} 顯示標籤 (若無則回傳 'OFF')
 */
export const getShiftLabel = (shift) => {
    if (typeof shift === 'object' && shift !== null && shift.label) {
        return shift.label;
    }
    return shift || 'OFF';
};

// 從排班數據中獲取備註
/**
 * 從排班資料中獲取備註
 * @param {string|Object} shift - 排班資料
 * @returns {string} 備註內容 (若無則回傳空字串)
 */
export const getShiftMemo = (shift) => {
    if (typeof shift === 'object' && shift !== null && shift.memo) {
        return shift.memo.trim();
    }
    return '';
};

// 用於對診次名稱進行數字/中文排序
/**
 * 解析診次名稱中的數字部分，用於排序
 * @param {string} sessionId - 診次 ID (例如 "01診", "10診")
 * @returns {number} 解析出的數字，若無數字則回傳 Infinity
 */
export const getNumericSortValue = (sessionId) => {
    const match = sessionId.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
};

/**
 * 對規則陣列進行排序
 * 排序邏輯：先比對數字部分，若相同則使用中文語系排序
 * @param {Array} rulesArray - 規則陣列
 * @returns {Array} 排序後的新陣列
 */
export const sortRulesArray = (rulesArray) => {
    return [...rulesArray].sort((a, b) => {
        const numA = getNumericSortValue(a.sessionId);
        const numB = getNumericSortValue(b.sessionId);

        if (numA !== numB) {
            return numA - numB;
        }
        return a.sessionId.localeCompare(b.sessionId, 'zh-TW');
    });
};

// 根據規則構建 SHIFT_HIERARCHY
/**
 * 根據診次規則建構階層式資料結構 (SHIFT_HIERARCHY)
 * 結構: ShiftType -> TimeSlot -> [SessionId, ...]
 * @param {Array} rules - 診次規則陣列
 * @returns {Object} 包含 SHIFT_HIERARCHY 的物件
 */
export const buildShiftData = (rules) => {
    const hierarchy = {};
    const sortedRules = sortRulesArray(rules);

    sortedRules.forEach(rule => {
        if (!hierarchy[rule.shiftType]) {
            hierarchy[rule.shiftType] = {};
        }
        if (!hierarchy[rule.shiftType][rule.timeSlot]) {
            hierarchy[rule.shiftType][rule.timeSlot] = [];
        }

        if (!hierarchy[rule.shiftType][rule.timeSlot].includes(rule.sessionId)) {
            hierarchy[rule.shiftType][rule.timeSlot].push(rule.sessionId);
        }
    });

    return { SHIFT_HIERARCHY: hierarchy };
};

// 獲取診次所需技能
/**
 * 獲取特定診次規則所需的技能列表
 * @param {Array} rules - 所有診次規則
 * @param {string} shiftType - 班別
 * @param {string} timeSlot - 時段
 * @param {string} sessionId - 診次 ID
 * @returns {Array<string>} 技能列表
 */
export const getRuleRequiredSkillsGlobal = (rules, shiftType, timeSlot, sessionId) => {
    const matchingRule = rules.find(rule =>
        rule.shiftType === shiftType &&
        rule.timeSlot === timeSlot &&
        rule.sessionId === sessionId
    );
    return matchingRule?.requiredSkills || [];
};

/**
 * 清理舊排班資料
 * @param {Object} scheduleData - 原始排班資料
 * @param {number} retentionDays - 保留天數 (預設 90)
 * @param {Date} [baseDate] - 基準日期 (預設為今天，方便測試)
 * @returns {Object} { cleanedData, deletedCount }
 */
export const cleanupOldScheduleData = (scheduleData, retentionDays = 90, baseDate = new Date()) => {
    if (!scheduleData) return { cleanedData: {}, deletedCount: 0 };

    const cutoffDate = new Date(baseDate);
    cutoffDate.setDate(baseDate.getDate() - retentionDays);
    cutoffDate.setHours(0, 0, 0, 0);

    const newData = { ...scheduleData };
    let deletedCount = 0;

    Object.keys(newData).forEach(key => {
        // key 格式: YYYY-MM-DD_EmpId_ShiftType
        const parts = key.split('_');
        if (parts.length > 0) {
            const dateStr = parts[0];
            const itemDate = new Date(dateStr);

            // 確保日期有效且早於截止日期
            if (!isNaN(itemDate.getTime()) && itemDate < cutoffDate) {
                delete newData[key];
                deletedCount++;
            }
        }
    });

    return { cleanedData: newData, deletedCount };
};
