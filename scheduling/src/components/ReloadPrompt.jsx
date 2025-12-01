import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Icon from './Icon';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line no-console
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            // eslint-disable-next-line no-console
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-5 right-5 p-4 bg-slate-800 text-white rounded-lg shadow-lg z-[100] flex flex-col gap-3 max-w-xs animate-in slide-in-from-bottom-5">
                    <div className="flex items-start gap-3">
                        <Icon name="Info" size={20} className="text-sky-400 mt-0.5" />
                        <div className="text-sm">
                            {offlineReady ? (
                                <span>應用程式已準備好離線使用！</span>
                            ) : (
                                <span>有新版本可用，請點擊重新整理。</span>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                        {needRefresh && (
                            <button
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 rounded text-xs font-bold transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                重新整理
                            </button>
                        )}
                        <button
                            className="px-3 py-1.5 border border-slate-600 hover:bg-slate-700 rounded text-xs transition-colors"
                            onClick={() => close()}
                        >
                            關閉
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
