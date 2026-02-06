import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        console.log('Theme initial:', savedTheme || 'dark');
        return savedTheme || 'dark';
    });

    useEffect(() => {
        console.log('Applying theme:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        console.log('Toggle clicked! Current theme:', theme);
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            console.log('New theme:', newTheme);
            return newTheme;
        });
    };

    return { theme, toggleTheme };
};