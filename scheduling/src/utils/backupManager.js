/**
 * 瀏覽器內建備份管理工具
 */

const BACKUP_STORAGE_KEY = 'backupHistory';
const MAX_BACKUPS = 10;

/**
 * 建立備份
 * @param {Object} data - 要備份的完整資料
 * @param {string} customName - 自訂備份名稱（選填）
 * @returns {string} 備份 ID
 */
export const createBackup = (data, customName = null) => {
    const timestamp = Date.now();
    const backupId = `backup_${timestamp}`;

    // 計算資料大小
    const dataStr = JSON.stringify(data);
    const sizeBytes = new Blob([dataStr]).size;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    // 分析包含的月份
    const months = new Set();
    Object.keys(data.schedule || {}).forEach(key => {
        const date = key.split('_')[0];
        if (date) {
            // 假設 date 格式為 YYYY-MM-DD
            const month = date.substring(0, 7); // YYYY-MM
            months.add(month);
        }
    });
    const sortedMonths = Array.from(months).sort();

    // 預設名稱：日期時間
    const defaultName = new Date(timestamp).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const backup = {
        id: backupId,
        timestamp,
        name: customName || defaultName,
        data,
        metadata: {
            employeeCount: data.employees?.length || 0,
            scheduleCount: Object.keys(data.schedule || {}).length,
            size: `${sizeMB} MB`,
            months: sortedMonths
        }
    };

    // 取得現有備份
    const backups = getBackupList();

    // 加入新備份
    backups[backupId] = backup;

    // 如果超過數量限制，刪除最舊的
    const backupIds = Object.keys(backups).sort((a, b) => {
        return backups[a].timestamp - backups[b].timestamp;
    });

    while (backupIds.length > MAX_BACKUPS) {
        const oldestId = backupIds.shift();
        delete backups[oldestId];
    }

    // 儲存
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));

    return backupId;
};

/**
 * 取得所有備份列表
 * @returns {Object} 備份物件集合
 */
export const getBackupList = () => {
    try {
        const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to load backups:', error);
        return {};
    }
};

/**
 * 取得備份詳細資料
 * @param {string} backupId - 備份 ID
 * @returns {Object|null} 備份資料
 */
export const getBackup = (backupId) => {
    const backups = getBackupList();
    return backups[backupId] || null;
};

/**
 * 還原備份
 * @param {string} backupId - 備份 ID
 * @returns {Object|null} 備份的資料，如果失敗則返回 null
 */
export const restoreBackup = (backupId) => {
    const backup = getBackup(backupId);
    if (!backup) {
        console.error('Backup not found:', backupId);
        return null;
    }
    return backup.data;
};

/**
 * 刪除備份
 * @param {string} backupId - 備份 ID
 * @returns {boolean} 是否成功刪除
 */
export const deleteBackup = (backupId) => {
    const backups = getBackupList();
    if (!backups[backupId]) {
        return false;
    }

    delete backups[backupId];
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
    return true;
};

/**
 * 重新命名備份
 * @param {string} backupId - 備份 ID
 * @param {string} newName - 新名稱
 * @returns {boolean} 是否成功重新命名
 */
export const renameBackup = (backupId, newName) => {
    const backups = getBackupList();
    if (!backups[backupId]) {
        return false;
    }

    backups[backupId].name = newName;
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
    return true;
};

/**
 * 取得備份總數
 * @returns {number} 備份數量
 */
export const getBackupCount = () => {
    return Object.keys(getBackupList()).length;
};

/**
 * 清空所有備份
 * @returns {boolean} 是否成功清空
 */
export const clearAllBackups = () => {
    try {
        localStorage.removeItem(BACKUP_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear backups:', error);
        return false;
    }
};
