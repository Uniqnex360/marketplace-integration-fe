// src\Components\TheameContext\TheameContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the Theme Context
const ThemeContext = createContext();

// Create a custom hook to use the ThemeContext
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component to wrap the app
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);  // State to manage theme

  const toggleTheme = () => {
    setDarkMode(!darkMode);  // Toggle theme
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
