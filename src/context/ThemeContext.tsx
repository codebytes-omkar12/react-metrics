import React, { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = 'theme-preference';

const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Initialize state from localStorage or user's system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
            return storedTheme === 'dark';
        }
        // If no theme is stored, check the user's OS preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 2. This effect runs whenever isDarkMode changes
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem(THEME_STORAGE_KEY, 'dark'); // Save preference
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem(THEME_STORAGE_KEY, 'light'); // Save preference
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
