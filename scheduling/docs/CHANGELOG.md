# 變更日誌 (Changelog)

## [1.0.4] - 2025-12-01

### ✨ 新增功能 (Features)
*   **自動資料清理**: 系統啟動時會自動刪除 90 天前的舊排班資料，優化效能。
*   **錯誤防護網 (Error Boundary)**: 
    *   攔截未預期的 React 渲染錯誤。
# 變更日誌 (Changelog)

## [1.0.4] - 2025-12-01

### ✨ 新增功能 (Features)
*   **自動資料清理**: 系統啟動時會自動刪除 90 天前的舊排班資料，優化效能。
*   **錯誤防護網 (Error Boundary)**: 
    *   攔截未預期的 React 渲染錯誤。
    *   提供友善的錯誤提示畫面。
    *   **緊急備份功能**: 即使程式崩潰，也能透過「緊急備份」按鈕直接從 LocalStorage 救出資料。
*   **個人班表增強**: 匯出個人班表時，現在會顯示「科別」與「負責醫師」資訊 (格式: `(科別/醫師)`)。

### 🐛 錯誤修復 (Bug Fixes)
*   **資料完整性**: 修復 JSON 匯出/匯入功能，補回遺漏的 `shiftDoctors` (診次醫師設定) 資料。
*   **UI 一致性**: 統一所有設定彈窗的「儲存」按鈕樣式 (藍色背景 + Save Icon)。

### 📝 文件與代碼品質 (Documentation & Code Quality)
*   **JSDoc**: 為核心資料結構 (`Employee`, `ShiftRule`) 與關鍵函式加入型別註解。
*   **架構文件**: 新增 `docs/ARCHITECTURE.md`。

## [Unreleased]
### Added
- **Tablet UX Enhancements**:
    - **Floating Glass Sidebar**: 側邊欄改為懸浮式設計，搭配 `backdrop-blur-xl` 與 `backdrop-brightness-95`，在不擠壓表格空間的同時提供優雅的視覺層次。
    - **Virtual Keyboard Optimization**: 針對 `ShiftSelectionModal` 與 `ScheduleTable` 輸入框加入 `scrollIntoView` 邏輯，防止虛擬鍵盤遮擋輸入焦點。
    - **Tools FAB**: 新增右下角懸浮按鈕 (Floating Action Button) 整合匯出選單，方便平板單手操作。
- **AI Documentation**:
    - `docs/AI_MEMORY.md`: 新增 AI 專屬記憶庫，記錄專案哲學與維護指南。
    - `docs/ARCHITECTURE.md`: 新增 AI 導航地圖 (Component Tree & Data Flow)。
    - `README.md`: 新增 AI Handover Note。
- **Performance Monitoring**:
    - **系統資訊面板**: 新增 LocalStorage 使用量監控，可查看排班資料、員工資料等各項資料的儲存空間佔用情況。
    - **儲存空間警告**: 當使用量超過 80% 時自動顯示警告，提醒使用者清理或備份資料。
    - **資料統計**: 顯示排班記錄數量、資料範圍（最舊/最新記錄）等統計資訊。
- **Backup Management**:
    - **瀏覽器內建備份**: 支援在瀏覽器中直接建立、還原、刪除與重新命名備份，無需下載檔案。
    - **自動管理**: 系統自動保留最近 10 個備份版本，避免佔用過多空間。
    - **完整還原**: 一鍵還原所有系統狀態（員工、排班、規則、設定等）。
- **Tablet UX**: 新增左右滑動切換週次功能 (Swipe Gestures)，並實作防誤觸機制。
- **AI Workflow**: 更新 `GEMINI.md` 協作指南，強制規範 JSDoc 註解與 Toast 回饋。

### Changed

### Fixed
- **Build Configuration**: 
    - 修正 PWA 資源路徑配置（移除不存在的 favicon.ico 等檔案）
    - 優化 Vite build 設定，啟用 esbuild minify 以減少檔案大小
    - 確保 Service Worker 與 PWA manifest 正確生成

---
