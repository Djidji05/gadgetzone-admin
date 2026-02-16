import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
}

export interface PromptOptions {
    title: string;
    message: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    initialValue?: string;
}

export const useUIStore = defineStore('ui', () => {
    const toasts = ref<Toast[]>([]);
    const confirmDialog = ref<{
        show: boolean;
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
        type: 'danger' | 'info';
        resolve: ((value: boolean) => void) | null;
    }>({
        show: false,
        title: '',
        message: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'info',
        resolve: null
    });

    const promptDialog = ref<{
        show: boolean;
        title: string;
        message: string;
        placeholder: string;
        confirmText: string;
        cancelText: string;
        value: string;
        resolve: ((value: string | null) => void) | null;
    }>({
        show: false,
        title: '',
        message: '',
        placeholder: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        value: '',
        resolve: null
    });

    const addToast = (message: string, type: Toast['type'] = 'info', duration = 5000) => {
        const id = Date.now();
        toasts.value.push({ id, message, type, duration });
        setTimeout(() => {
            removeToast(id);
        }, duration);
    };

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            confirmDialog.value = {
                show: true,
                title: options.title,
                message: options.message,
                confirmText: options.confirmText || 'Confirmer',
                cancelText: options.cancelText || 'Annuler',
                type: options.type || 'info',
                resolve
            };
        });
    };

    const handleConfirm = (value: boolean) => {
        if (confirmDialog.value.resolve) {
            confirmDialog.value.resolve(value);
        }
        confirmDialog.value.show = false;
        confirmDialog.value.resolve = null;
    };

    const prompt = (options: PromptOptions): Promise<string | null> => {
        return new Promise((resolve) => {
            promptDialog.value = {
                show: true,
                title: options.title,
                message: options.message,
                placeholder: options.placeholder || 'Saisissez votre réponse...',
                confirmText: options.confirmText || 'Confirmer',
                cancelText: options.cancelText || 'Annuler',
                value: options.initialValue || '',
                resolve
            };
        });
    };

    const handlePrompt = (value: string | null) => {
        if (promptDialog.value.resolve) {
            promptDialog.value.resolve(value);
        }
        promptDialog.value.show = false;
        promptDialog.value.resolve = null;
    };

    return {
        toasts,
        confirmDialog,
        promptDialog,
        addToast,
        removeToast,
        confirm,
        handleConfirm,
        prompt,
        handlePrompt
    };
});
