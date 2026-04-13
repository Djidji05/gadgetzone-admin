import { createI18n } from 'vue-i18n'
import fr from './locales/fr'
import en from './locales/en'

const savedLocale = localStorage.getItem('userLanguage') || 'fr'

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'fr',
    messages: {
        fr,
        en,
    },
})

export default i18n
