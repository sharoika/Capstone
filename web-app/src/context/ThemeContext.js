import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check if user has a preference stored in localStorage
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Check if user prefers dark mode in their OS settings
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // Update localStorage and document body when theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.setAttribute('data-theme', theme);

        // Force a repaint to ensure all styles are applied
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        if (theme === 'dark') {
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = '#e0e0e0';
            // Force navbar to update
            const navbar = document.querySelector('.navbar-custom');
            if (navbar) {
                navbar.style.backgroundColor = '#121212';
            }
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#333333';
            // Force navbar to update
            const navbar = document.querySelector('.navbar-custom');
            if (navbar) {
                navbar.style.backgroundColor = '#ffffff';
            }
        }

        // Force a repaint - use the value to avoid the unused expression error
        const height = document.body.offsetHeight;
        // This is just to use the height variable to avoid linting errors
        if (height) {
            // Do nothing, just using the variable
        }
    }, [theme]);

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider; 