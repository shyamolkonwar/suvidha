import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import './i18n';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 18, // Larger for touch screens
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: 48, // Touch-friendly size
                    fontSize: '1.1rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input': {
                        fontSize: '1.1rem',
                    },
                },
            },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);
