import React, { useRef, useEffect } from 'react';
import Icon from './Icon';

/**
 * 設定選單元件
 */
const SettingsMenu = ({ onClose, onManageVisibleShifts, onManageShifts, onManageDoctors, onManageSkills, onManageTimeSlots, onGenerateReport, onShowBackupManager, onShowSystemInfo, toggleButtonRef }) => {
    const menuRef = useRef(null);

    // 點擊外部關閉選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 如果點擊的是選單內部，或是切換按鈕本身，則不執行關閉
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                (!toggleButtonRef?.current || !toggleButtonRef.current.contains(event.target))
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, toggleButtonRef]);

    return (
        <div
            ref={menuRef}
            className="absolute top-14 right-0 w-64 bg-white/90 backdrop-blur-xl backdrop-brightness-95 rounded-lg shadow-xl border border-white/30 z-50 origin-top-right animate-in fade-in zoom-in-95"
        >
            <div className="p-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Icon name="Settings" size={14} /> 系統設定
                </h4>
                <div className="space-y-1">
                    <button
                        onClick={onManageSkills}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Award" size={16} className="text-amber-500" /> 技能需求管理
                    </button>
                    <button
                        onClick={onManageShifts}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Settings" size={16} className="text-indigo-500" /> 診次規則管理
                    </button>
                    <button
                        onClick={onManageDoctors}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Users" size={16} className="text-blue-500" /> 診次醫師管理
                    </button>
                    <button
                        onClick={onManageTimeSlots}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Clock" size={16} className="text-purple-500" /> 時段設定
                    </button>
                    <button
                        onClick={onManageVisibleShifts}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Eye" size={16} className="text-teal-500" /> 班別顯示設定
                    </button>
                </div>

                <div className="my-2 border-t border-slate-100"></div>

                <div className="space-y-1">
                    <button
                        onClick={onGenerateReport}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Target" size={16} className="text-green-600" /> 跟診追蹤報告
                    </button>
                </div>

                <div className="my-2 border-t border-white/30"></div>

                <div className="space-y-1">
                    <button
                        onClick={onShowBackupManager}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Archive" size={16} className="text-purple-600" /> 備份管理
                    </button>
                    <button
                        onClick={onShowSystemInfo}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Info" size={16} className="text-blue-600" /> 系統資訊
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsMenu;
