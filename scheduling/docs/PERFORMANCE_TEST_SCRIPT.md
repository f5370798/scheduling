# 效能測試腳本

## 🧪 自動化測試腳本

### 測試 1: localStorage 寫入監控

在瀏覽器 Console 中執行以下程式碼：

```javascript
// ============ localStorage 寫入監控 ============
(function() {
    let writeCount = 0;
    let writeLog = [];
    const startTime = Date.now();
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        writeCount++;
        const timestamp = Date.now() - startTime;
        writeLog.push({
            count: writeCount,
            key: key,
            size: new Blob([value]).size,
            time: timestamp
        });
        
        console.log(`%c[${writeCount}] localStorage 寫入`, 'color: #0ea5e9; font-weight: bold', {
            key: key,
            size: `${(new Blob([value]).size / 1024).toFixed(2)} KB`,
            time: `${timestamp}ms`
        });
        
        return originalSetItem.apply(this, arguments);
    };
    
    // 提供查詢函數
    window.getStorageStats = function() {
        console.log('%c=== localStorage 寫入統計 ===', 'color: #10b981; font-size: 16px; font-weight: bold');
        console.log(`總寫入次數: ${writeCount}`);
        console.log(`總時間: ${Date.now() - startTime}ms`);
        console.log(`平均每次: ${((Date.now() - startTime) / writeCount).toFixed(2)}ms`);
        console.table(writeLog);
        return { writeCount, writeLog, totalTime: Date.now() - startTime };
    };
    
    console.log('%c✅ localStorage 監控已啟動', 'color: #10b981; font-size: 14px; font-weight: bold');
    console.log('執行操作後，輸入 getStorageStats() 查看統計');
})();
```

**使用方法**:
1. 複製上面的程式碼
2. 貼到 Console 並執行
3. 執行你的操作 (例如：快速填寫 10 個格子)
4. 在 Console 輸入 `getStorageStats()` 查看結果

**預期結果**:
- 優化前: 每次操作寫入 7 次
- 優化後: 每次操作寫入 1 次

---

### 測試 2: 渲染效能監控

```javascript
// ============ React 渲染監控 ============
(function() {
    let renderCount = 0;
    let renderLog = [];
    const startTime = Date.now();
    
    // 監控 React 渲染
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.includes('⚛')) {
                renderCount++;
                const timestamp = Date.now() - startTime;
                renderLog.push({
                    count: renderCount,
                    name: entry.name,
                    duration: entry.duration.toFixed(2),
                    time: timestamp
                });
                
                console.log(`%c[${renderCount}] React 渲染`, 'color: #f59e0b; font-weight: bold', {
                    component: entry.name,
                    duration: `${entry.duration.toFixed(2)}ms`,
                    time: `${timestamp}ms`
                });
            }
        }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    window.getRenderStats = function() {
        console.log('%c=== React 渲染統計 ===', 'color: #f59e0b; font-size: 16px; font-weight: bold');
        console.log(`總渲染次數: ${renderCount}`);
        console.log(`總時間: ${Date.now() - startTime}ms`);
        if (renderCount > 0) {
            const avgDuration = renderLog.reduce((sum, r) => sum + parseFloat(r.duration), 0) / renderCount;
            console.log(`平均渲染時間: ${avgDuration.toFixed(2)}ms`);
        }
        console.table(renderLog);
        return { renderCount, renderLog, totalTime: Date.now() - startTime };
    };
    
    console.log('%c✅ React 渲染監控已啟動', 'color: #f59e0b; font-size: 14px; font-weight: bold');
    console.log('執行操作後，輸入 getRenderStats() 查看統計');
})();
```

---

### 測試 3: 操作計時器

```javascript
// ============ 操作計時器 ============
window.testPerformance = function(testName, iterations = 10) {
    console.log(`%c🧪 開始測試: ${testName}`, 'color: #8b5cf6; font-size: 14px; font-weight: bold');
    console.log(`請執行 ${iterations} 次操作...`);
    
    const startTime = Date.now();
    let clickCount = 0;
    
    // 監聽點擊事件
    const clickHandler = () => {
        clickCount++;
        const elapsed = Date.now() - startTime;
        console.log(`%c[${clickCount}/${iterations}]`, 'color: #8b5cf6', `耗時: ${elapsed}ms`);
        
        if (clickCount >= iterations) {
            document.removeEventListener('click', clickHandler);
            const totalTime = Date.now() - startTime;
            const avgTime = totalTime / iterations;
            
            console.log(`%c✅ 測試完成`, 'color: #10b981; font-size: 16px; font-weight: bold');
            console.log(`總時間: ${totalTime}ms`);
            console.log(`平均每次: ${avgTime.toFixed(2)}ms`);
            console.log(`操作頻率: ${(1000 / avgTime).toFixed(2)} 次/秒`);
            
            return {
                testName,
                iterations,
                totalTime,
                avgTime: avgTime.toFixed(2),
                frequency: (1000 / avgTime).toFixed(2)
            };
        }
    };
    
    document.addEventListener('click', clickHandler);
    
    return `測試已開始，請點擊 ${iterations} 次...`;
};

console.log('%c✅ 操作計時器已就緒', 'color: #8b5cf6; font-size: 14px; font-weight: bold');
console.log('使用方法: testPerformance("快速填寫測試", 10)');
```

---

### 測試 4: 完整效能報告

```javascript
// ============ 完整效能報告 ============
window.generatePerformanceReport = function() {
    console.clear();
    console.log('%c📊 效能測試報告 v1.1.1', 'color: #3b82f6; font-size: 20px; font-weight: bold');
    console.log('%c' + '='.repeat(50), 'color: #3b82f6');
    
    // 1. localStorage 統計
    if (typeof getStorageStats === 'function') {
        const storageStats = getStorageStats();
        console.log('\n');
    }
    
    // 2. React 渲染統計
    if (typeof getRenderStats === 'function') {
        const renderStats = getRenderStats();
        console.log('\n');
    }
    
    // 3. 記憶體使用
    if (performance.memory) {
        console.log('%c=== 記憶體使用 ===', 'color: #ec4899; font-size: 16px; font-weight: bold');
        console.log(`已使用: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`總配置: ${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`上限: ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
        console.log('\n');
    }
    
    // 4. 效能評分
    console.log('%c=== 效能評分 ===', 'color: #10b981; font-size: 16px; font-weight: bold');
    const score = calculatePerformanceScore();
    console.log(`%c總分: ${score}/100`, `color: ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}; font-size: 18px; font-weight: bold`);
    
    console.log('%c' + '='.repeat(50), 'color: #3b82f6');
};

function calculatePerformanceScore() {
    let score = 100;
    
    // 根據 localStorage 寫入次數扣分
    if (typeof getStorageStats === 'function') {
        const stats = getStorageStats();
        if (stats.writeCount > 10) score -= 10;
        if (stats.writeCount > 20) score -= 10;
    }
    
    // 根據渲染次數扣分
    if (typeof getRenderStats === 'function') {
        const stats = getRenderStats();
        if (stats.renderCount > 50) score -= 10;
        if (stats.renderCount > 100) score -= 10;
    }
    
    return Math.max(0, score);
}

console.log('%c✅ 完整效能報告已就緒', 'color: #3b82f6; font-size: 14px; font-weight: bold');
console.log('使用方法: generatePerformanceReport()');
```

---

## 🎯 測試流程

### 步驟 1: 初始化監控
```javascript
// 複製並執行以上所有腳本
// 或者一次性執行：
```

### 步驟 2: 執行測試操作
1. 快速填寫 10 個格子
2. 拖曳 3 個排班
3. 開啟/關閉 2 個模態框

### 步驟 3: 查看報告
```javascript
generatePerformanceReport()
```

---

## 📊 預期結果

### 優化後的理想數據
- ✅ localStorage 寫入次數: < 10 次
- ✅ 平均渲染時間: < 30ms
- ✅ 操作頻率: > 20 次/秒
- ✅ 效能評分: > 80 分

---

## 🚨 如果出現問題

### 錯誤訊息
如果 Console 出現紅色錯誤，請：
1. 截圖錯誤訊息
2. 告訴我錯誤內容
3. 我會協助你修復

### 效能不佳
如果效能評分 < 60 分，請：
1. 執行 `generatePerformanceReport()`
2. 複製完整報告
3. 告訴我，我會分析原因

---

**建立時間**: 2025-12-04  
**版本**: v1.1.1
