import React, { useEffect } from 'react';
import Icon from './Icon';

const Toast = ({ id, message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const styles = {
        success: 'bg-teal-50 border-teal-200 text-teal-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800'
    };

    const icons = {
        success: 'Check',
        error: 'AlertCircle',
        info: 'Info',
        warning: 'AlertTriangle'
    };

    const iconColors = {
        success: 'text-teal-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-amber-500'
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg shadow-slate-200/50 mb-3 transition-all animate-slideInRight max-w-sm w-full pointer-events-auto ${styles[type]}`}>
            <Icon name={icons[type]} size={20} className={iconColors[type]} />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
            >
                <Icon name="X" size={16} />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
