/**
 * 計算 LocalStorage 使用量的工具函數
 */

/**
 * 計算字串的位元組大小
 * @param {string} str - 要計算的字串
 * @returns {number} 位元組大小
 */
export const getStringByteSize = (str) => {
    return new Blob([str]).size;
};

/**
 * 計算 LocalStorage 中特定 key 的大小
 * @param {string} key - LocalStorage 的 key
 * @returns {number} 位元組大小
 */
export const getLocalStorageItemSize = (key) => {
    const item = localStorage.getItem(key);
    if (!item) return 0;
    return getStringByteSize(item);
};

/**
 * 計算 LocalStorage 總使用量
 * @returns {number} 總位元組大小
 */
export const getTotalLocalStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += getStringByteSize(localStorage.getItem(key) || '');
        }
    }
    return total;
};

/**
 * 將位元組轉換為可讀格式
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的字串 (例如: "2.3 MB")
 */
export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 獲取系統資訊統計
 * @param {Object} scheduleData - 排班資料
 * @param {Array} employees - 員工列表
 * @param {Array} customShiftRules - 規則列表
 * @returns {Object} 系統資訊物件
 */
export const getSystemInfo = (scheduleData, employees, customShiftRules) => {
    // 計算各項資料大小
    const scheduleSize = getLocalStorageItemSize('scheduleData');
    const employeesSize = getLocalStorageItemSize('employees');
    const rulesSize = getLocalStorageItemSize('customShiftRules');
    const skillsSize = getLocalStorageItemSize('skills');
    const totalSize = getTotalLocalStorageSize();

    // LocalStorage 理論上限（大多數瀏覽器為 5-10MB）
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    const usagePercentage = ((totalSize / estimatedLimit) * 100).toFixed(1);

    // 計算排班記錄數量
    const scheduleRecordCount = Object.keys(scheduleData || {}).length;

    // 找出最舊和最新的排班記錄
    const dates = Object.keys(scheduleData || {})
        .map(key => key.split('_')[0])
        .filter(date => date);

    const oldestDate = dates.length > 0 ? dates.sort()[0] : null;
    const newestDate = dates.length > 0 ? dates.sort().reverse()[0] : null;

    return {
        storage: {
            total: totalSize,
            totalFormatted: formatBytes(totalSize),
            limit: estimatedLimit,
            limitFormatted: formatBytes(estimatedLimit),
            usagePercentage: parseFloat(usagePercentage),
            breakdown: {
                schedule: { size: scheduleSize, formatted: formatBytes(scheduleSize) },
                employees: { size: employeesSize, formatted: formatBytes(employeesSize) },
                rules: { size: rulesSize, formatted: formatBytes(rulesSize) },
                skills: { size: skillsSize, formatted: formatBytes(skillsSize) },
                other: {
                    size: totalSize - scheduleSize - employeesSize - rulesSize - skillsSize,
                    formatted: formatBytes(totalSize - scheduleSize - employeesSize - rulesSize - skillsSize)
                }
            }
        },
        data: {
            scheduleRecordCount,
            employeeCount: employees?.length || 0,
            ruleCount: customShiftRules?.length || 0,
            oldestDate,
            newestDate
        }
    };
};
