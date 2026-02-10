import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Header,
    HeroBanner,
    ServiceBar,
    ProductTabs,
    SaleBanners,
    CategoryGrid,
    NewsSection,
    Footer,
} from '../components/Home';

// Custom theme for TunaShop
const theme = createTheme({
    palette: {
        primary: {
            main: '#f26522',
            light: '#ff8a50',
            dark: '#b84a15',
            contrastText: '#fff',
        },
        secondary: {
            main: '#00a651',
            light: '#4dd87f',
            dark: '#007839',
        },
        background: {
            default: '#f5f5f5',
            paper: '#fff',
        },
        text: {
            primary: '#333',
            secondary: '#666',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

export default function HomePage() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                }}
            >

                {/* Main Content */}
                <Box component="main" sx={{ flexGrow: 1 }}>
                    {/* Hero Banner/Carousel */}
                    <HeroBanner />

                    {/* Service Bar */}
                    <ServiceBar />

                    {/* Featured Products with Tabs */}
                    <ProductTabs />

                    {/* Sale Banners */}
                    <SaleBanners />

                    {/* Category Grid */}
                    <CategoryGrid />

                    {/* News Section */}
                    <NewsSection />
                </Box>

                {/* Footer */}
            </Box>
        </ThemeProvider>
    );
}
