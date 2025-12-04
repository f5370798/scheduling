# 班別專屬視覺回饋使用說明

## 🎨 已實作的動畫

### 班別專屬閃爍顏色
- **早班 (MORNING)**: 藍色閃爍 `rgba(59, 130, 246, 0.25)`
- **午班 (AFTERNOON)**: 橘色閃爍 `rgba(249, 115, 22, 0.25)`
- **晚班 (NIGHT)**: 紫色閃爍 `rgba(168, 85, 247, 0.25)`

### CSS 類別
- `.cell-success-morning` - 早班藍色閃爍
- `.cell-success-afternoon` - 午班橘色閃爍
- `.cell-success-night` - 晚班紫色閃爍
- `.cell-erase` - 清除紅色閃爍
- `.cell-success` - 通用綠色閃爍 (向下相容)

---

## 🔧 如何使用

### 方法 1: 在 App.jsx 的 handleCellClick 中加入

```javascript
const handleCellClick = (dateKey, dateDisplay, empId, empName, shiftType, skills) => {
    // 原本的邏輯...
    
    // 加入視覺回饋 (需要傳入 event)
    if (event && event.currentTarget) {
        const cell = event.currentTarget;
        
        // 根據班別加入對應的閃爍效果
        const className = activeTool === 'PAINT' 
            ? `cell-success-${shiftType.toLowerCase()}`  // 早班: cell-success-morning
            : activeTool === 'ERASER'
            ? 'cell-erase'
            : '';
        
        if (className) {
            cell.classList.add(className);
            setTimeout(() => cell.classList.remove(className), 500);
        }
    }
};
```

### 方法 2: 在 ScheduleTable.jsx 中加入

```javascript
// 在 onClick 處理中
onClick={(event) => {
    if (isCurrentMonth) {
        // 加入視覺回饋
        const className = activeTool === 'PAINT'
            ? `cell-success-${col.type.toLowerCase()}`
            : activeTool === 'ERASER'
            ? 'cell-erase'
            : '';
        
        if (className) {
            event.currentTarget.classList.add(className);
            setTimeout(() => event.currentTarget.classList.remove(className), 500);
        }
        
        // 原本的邏輯
        onCellClick(day.dateKey, day.date.toLocaleDateString('zh-TW'), emp.id, emp.name, col.type, emp.skills || []);
    }
}}
```

---

## 🎯 效果預覽

### 早班 (MORNING)
```
點擊 → 藍色閃爍 (0.5秒) → 恢復
顏色: rgba(59, 130, 246, 0.25)
```

### 午班 (AFTERNOON)
```
點擊 → 橘色閃爍 (0.5秒) → 恢復
顏色: rgba(249, 115, 22, 0.25)
```

### 晚班 (NIGHT)
```
點擊 → 紫色閃爍 (0.5秒) → 恢復
顏色: rgba(168, 85, 247, 0.25)
```

### 清除 (ERASER)
```
點擊 → 紅色閃爍 (0.5秒) → 恢復
顏色: rgba(239, 68, 68, 0.2)
```

---

## ✅ 目前狀態

- [x] CSS 動畫已建立
- [x] 班別專屬顏色已定義
- [ ] JS 邏輯需要加入 (待實作)

---

## 💡 建議

### 選項 A: 簡單實作 (推薦)
在 ScheduleTable.jsx 的 onClick 中直接加入類別切換

### 選項 B: 完整實作
在 App.jsx 中建立統一的視覺回饋函數

### 選項 C: 自動實作
我可以立即幫你實作選項 A

---

**建立時間**: 2025-12-04
**版本**: v1.1.2
