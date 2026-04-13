import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { settingsService } from '@/services/api';
import i18n from '@/i18n';

export const useSettingsStore = defineStore('settings', () => {
    const general = ref({
        site_name: 'HTFasil',
        site_logo: '',
        site_url: '',
        contact_email: '',
        site_description: '',
        timezone: 'America/Port-au-Prince',
        currency: 'HTG',
        language: 'fr'
    });

    const loading = ref(false);

    const fetchGeneralSettings = async () => {
        try {
            loading.value = true;
            const data = await settingsService.get('general');
            const savedLanguage = localStorage.getItem('userLanguage');

            general.value = {
                site_name: data.site_name || 'HTFasil',
                site_logo: data.site_logo || '',
                site_url: data.site_url || '',
                contact_email: data.contact_email || '',
                site_description: data.site_description || '',
                timezone: data.timezone || 'America/Port-au-Prince',
                currency: data.currency || 'HTG',
                language: savedLanguage || data.language || 'fr'
            };

            // Sync with i18n
            if (general.value.language) {
                const { locale } = i18n.global;
                locale.value = general.value.language as any;
            }
        } catch (error) {
            console.error('Error fetching general settings for store:', error);
        } finally {
            loading.value = false;
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3003/api').replace('/api', '');
        return `${baseUrl}${path}`;
    };

    const logoUrl = computed(() => {
        if (general.value.site_logo) {
            return getImageUrl(general.value.site_logo);
        }
        return '/images/logo/logo-htfasil.png'; // Default fallback
    });

    const logoIconUrl = computed(() => {
        // Currently we don't have a specific icon upload, so we fallback to the default
        return '/images/logo/logo htfasil.png';
    });

    return {
        general,
        loading,
        fetchGeneralSettings,
        logoUrl,
        logoIconUrl
    };
});
