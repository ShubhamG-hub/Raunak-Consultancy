import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to English, but check localStorage
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = translations[language];

    const toggleLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
