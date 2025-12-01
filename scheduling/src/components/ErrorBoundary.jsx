import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 以便下一次渲染顯示 fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // 您可以將錯誤記錄到錯誤回報服務
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleEmergencyExport = () => {
        try {
            const getLocalData = (key, defaultVal) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultVal;
                } catch (e) {
                    console.error(`Error parsing ${key}`, e);
                    return defaultVal;
                }
            };

            const exportData = {
                version: '1.0.4',
                employees: getLocalData('schedulingEmployees', []),
                schedule: getLocalData('schedulingData', {}),
                skills: getLocalData('schedulingSkills', []),
                customShiftRules: getLocalData('schedulingRules', []),
                visibleShifts: getLocalData('schedulingVisibleShifts', []),
                timeSlots: getLocalData('schedulingTimeSlots', {}),
                shiftDoctors: getLocalData('schedulingShiftDoctors', []),
                exportDate: new Date().toISOString(),
                isEmergencyBackup: true
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scheduling_emergency_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            link.click();
        } catch (e) {
            alert('緊急備份失敗，請嘗試手動複製 localStorage 資料。');
            console.error(e);
        }
    };

    render() {
        if (this.state.hasError) {
            // 您可以渲染任何自訂的 fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border border-red-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">系統發生未預期的錯誤</h1>
                        <p className="text-slate-600 mb-6">
                            很抱歉，程式遇到了一些問題需要重新啟動。這可能是暫時性的網路或資料問題。
                        </p>

                        <div className="bg-slate-50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-32 text-xs text-slate-500 font-mono border border-slate-200">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                            >
                                重新整理頁面
                            </button>

                            <button
                                onClick={this.handleEmergencyExport}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                緊急備份資料 (Rescue Data)
                            </button>
                            <p className="text-xs text-slate-400 mt-1">
                                如果重新整理無效，請點擊「緊急備份」下載您的資料，並聯絡技術人員。
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
