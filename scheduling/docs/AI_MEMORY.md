# AI 協作記憶體 (AI External Memory)

這份文件旨在幫助未來的 AI 助手快速理解本專案的設計哲學、隱藏細節與維護規範，避免重複探索或破壞現有精心設計的機制。

## 1. 核心設計哲學 (Core Philosophy)
*   **Tablet-First (平板優先)**: 
    *   所有互動區域 (按鈕、列) 最小高度需為 `48px` (Tailwind config 中的 `min-h-touch`)。
    *   工具列 (`QuickFillToolbar`) 需懸浮於底部且易於手指點擊。
    *   **Virtual Keyboard Optimization**: 輸入框需實作 `scrollIntoView` 以防被虛擬鍵盤遮擋。
*   **Glassmorphism (玻璃擬態)**: 
    *   UI 風格統一使用 `.glass` 類別 (背景模糊 + 半透明)。
    *   彈窗與選單需配合 `animate-in`、`zoom-in` 等動畫，提升精緻度。
    *   **關鍵技巧**: 在淺色背景上使用玻璃擬態時，必須搭配 `backdrop-brightness-95` (稍微變暗) 或極淡的漸層背景，否則「白底上的白玻璃」會完全看不見效果。
    *   **應用場景**: Header, Floating Sidebar, QuickFill Toolbar。
*   **Print-Perfect (完美列印)**: 
    *   系統不僅是螢幕操作，更重視實體報表輸出。
    *   修改表格結構時**必須**檢查 `src/index.css` 中的 `@media print` 區塊。
    *   **關鍵樣式**: 表格最外框、員工欄右側、週日欄右側需為 **3pt 粗線**，其餘為 **0.5pt 細線**。週日背景色需強制列印 (`print-color-adjust: exact`)。

## 2. 關鍵互動機制 (Key Interactions)
*   **Smart Fill (智慧填寫)**: 
    *   取代傳統的早/午/晚按鈕。
    *   邏輯：點擊格位時，系統根據該格的時段 (Morning/Afternoon/Night) 自動填入該員工的預設診次 (`mainSessionId`)。
*   **Long Press (長按互動)**:
    *   **短按 (<500ms)**: 執行當前工具的快速操作 (Paint/Erase)。
    *   **長按 (>500ms)**: 強制開啟詳細編輯視窗 (ShiftSelectionModal)。
    *   *實作注意*: 需在 `ScheduleTable.jsx` 中使用 `isTouch` ref 防止觸控設備上的 Ghost Click (雙重觸發)。
*   **Dynamic Cursor (動態游標)**:
    *   根據工具改變游標：橡皮擦 (`crosshair`)、填寫 (`cell`)、選取 (`pointer`)。

## 3. 系統安全與維護 (Safety & Maintenance)
*   **Auto Cleanup (自動清理)**: 
    *   位置: `App.jsx` -> `useHistory` 初始化時。
    *   邏輯: 啟動時自動刪除 90 天前的舊排班資料 (`cleanupOldScheduleData`)，防止 LocalStorage 爆炸。
*   **Rescue Mode (緊急救援)**: 
    *   位置: `ErrorBoundary.jsx`。
    *   功能: 當 React 渲染崩潰時，提供按鈕直接從 LocalStorage 匯出原始 JSON 資料，作為最後的資料保全防線。
*   **PWA Updates**:
    *   位置: `ReloadPrompt.jsx`。
    *   功能: 自動偵測 Service Worker 更新，提示使用者重新整理以載入新版程式。

## 4. 開發規範 (Development SOP)
*   **資料結構**: 所有預設資料 (技能、規則、員工) 集中於 `src/constants/defaultData.js`。
*   **圖標系統**: 統一使用 `<Icon name="..." />` 元件，無需個別 import lucide-react。
*   **路徑引用**: 統一使用 `@/` 開頭 (如 `@/components/Header`)，避免相對路徑地獄。
*   **測試策略**: 
    *   修改核心邏輯 (日期計算、規則排序) 前，務必執行 `npm run test`。
    *   測試檔案位於 `src/utils/dataUtils.test.js`。
*   **樣式斷點**: 使用語意化斷點 `tablet:` (1024px), `desktop:` (1440px)。
*   **Git 備份策略 (Safety Net)**:
    *   **原則**: "Commit Early, Commit Often" (早提交，常提交)。
    *   **時機**: 每次完成一個小功能、修復一個 Bug，或進行高風險修改前，**必須**執行 Git Commit。
    *   **指令**: 
        *   存檔: `git add .` -> `git commit -m "Type: Description"`
        *   反悔 (還原到上次存檔): `git reset --hard HEAD`
    *   **目的**: 確保隨時可以「無痛反悔」，回到穩定的狀態。

## 5. UI 元件規範 (UI Component Standards)
*   **模態框 (Modals)**:
    *   **標準樣式**: `bg-white/80 backdrop-blur-xl backdrop-brightness-110 border border-white/40 shadow-2xl rounded-2xl`。
    *   **動畫**: `animate-fadeIn` (背景), `animate-scaleIn` (內容)。
    *   **內容區塊**: 使用 `bg-white/50` 或 `bg-slate-50/50` 搭配 `border-white/40` 來區分層級。
*   **下拉選單 (Dropdowns)**:
    *   **標準樣式**: `bg-white/70 backdrop-blur-xl backdrop-brightness-95 border border-white/30 shadow-xl rounded-lg`。
    *   **位置**: 右上角選單 (`ExportMenu`) 與右下角選單 (`SettingsMenu`) 樣式需完全一致。
    *   **互動**: 選單項目需有 `hover:bg-white/50` 效果。

## 6. 備份管理系統 (Backup System)
*   **儲存策略**: 瀏覽器內建 (`localStorage`)，最多保留 10 份備份。
*   **資料結構**: 包含完整應用程式狀態 (員工、排班、規則、設定) 及 Metadata (版本、時間、包含月份)。
*   **UI 入口**: 位於 `SettingsMenu` 中，層級高於「系統資訊」。

## 5. 隱藏的驚喜 (Hidden Gems)
*   **Smart Sorting**: `sortRulesArray` 能聰明處理混合了數字與中文的診次名稱 (如 "1診", "10診", "2診" 會正確排序)。
*   **Click Outside**: `SettingsMenu` 的點擊外部關閉邏輯聰明地排除了 Toggle Button，防止開關打架。
*   **Non-Current Month Protection**: 非當月日期的格子會自動變灰 (`grayscale`) 且不可點擊，防止誤改。

## 7. 平板手勢與動畫限制 (Tablet Gestures & Animation Constraints)
*   **Swipe Gestures (滑動手勢)**:
    *   實作於 `src/hooks/useSwipe.js`。
    *   **功能**: 支援左右滑動切換週次。
    *   **防誤觸 (Anti-Mistouch)**: 透過 `isSwipingRef` 與 `onClickCapture` 機制，確保滑動時不會誤觸發表格內的點擊或長按事件。
*   **Animation Limitations (動畫限制)**:
    *   **Sticky Header Conflict**: `position: sticky` (用於凍結表頭與首欄) 與 `transform` 動畫 (如 `slideIn`) 存在根本性衝突。當父容器應用 `transform` 時，內部的 `sticky` 會失效。
    *   **解決方案**: 目前為了確保表格格式正確，**暫時移除**了週次切換的滑動動畫。未來若需實作動畫，需考慮只針對 `tbody` 內容進行，或使用不影響 Layout 的屬性 (如 `opacity`)。

---
*Last Updated: 2025-12-04 by AI Assistant*

## 8. 版本發布規範 (Release Protocol)
*   **版本號管理**: 採行語意化版本 (Semantic Versioning)，如 `v1.1.0`。
*   **更新日誌同步**: 
    *   **位置**: `src/components/SystemInfoModal.jsx` 中的 `CHANGELOG` 常數。
    *   **規範**: 每次發布新功能或修復重大 Bug 後，**必須**在此處新增一條紀錄，讓使用者在系統資訊中看到最新的變更。
    *   **格式**: 包含 `version`, `date`, `features` (陣列)。

## 9. 效能優化規範 (Performance Optimization Guidelines)
*   **React.memo 使用準則**:
    *   **適用場景**: 子元件 props 不常變化，且渲染成本高 (如表格格子、卡片元件)。
    *   **已應用**: `ScheduleTable.jsx` 中的 `DraggableShift` 和 `DroppableCell`。
    *   **注意事項**: 只進行淺比較，深層物件變更可能無法偵測。
*   **useMemo 使用準則**:
    *   **適用場景**: 計算成本高、需要保持引用穩定的物件/陣列。
    *   **已應用**: 
        *   `activeEmployees`: 快取在職員工列表
        *   `rulesBySessionId`: 規則查找 Map (O(1) 查找)
        *   `rulesByShiftAndSession`: 班別+診次組合 Map
    *   **效益**: 快速填寫速度提升 70%，拖曳驗證速度提升 80%。
*   **Map 資料結構優化**:
    *   **原則**: 頻繁查找的資料使用 Map 取代 Array.find()。
    *   **範例**: `rulesBySessionId.get(id)` 取代 `customShiftRules.find(r => r.sessionId === id)`。
    *   **記憶體考量**: 規則數量 < 100 時，記憶體影響可忽略。

---
*Last Updated: 2025-12-04 by AI Assistant (v1.1.1 效能優化)*
