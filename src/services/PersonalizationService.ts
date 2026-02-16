import api from './api';

export default {
    // Banners
    getBanners() {
        return api.get('/personalization/banners');
    },
    createBanner(banner) {
        return api.post('/personalization/banners', banner);
    },
    updateBanner(id, banner) {
        return api.put(`/personalization/banners/${id}`, banner);
    },
    deleteBanner(id) {
        return api.delete(`/personalization/banners/${id}`);
    },

    // Sections (Top Discovery, Featured, Weather, Deals, etc.)
    getSectionConfig(section) {
        return api.get(`/personalization/sections/${section}`);
    },
    updateSectionConfig(section, data) {
        return api.post(`/personalization/sections/${section}`, data);
    }
};
