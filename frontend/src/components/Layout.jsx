import React from "react";
import { useState} from "react";
import { Button, Toolbar, AppBar, Typography, Box, IconButton, Avatar, Tooltip, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { doSignOut } from "../../auth";
import { LibraryAdd, Home, AutoAwesomeMotion, Menu as MenuIcon } from "@mui/icons-material";
import "../styles/Layout.css";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
        setMobileOpen(!mobileOpen);
        }
    };
    
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const drawerWidth = 300

    const drawer = (
        <div>
            <Toolbar />
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton component={Link} to="/">
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="my-flashcards" disablePadding>
                        <ListItemButton component={Link} to="/create">
                            <ListItemIcon>
                                <LibraryAdd />
                            </ListItemIcon>
                            <ListItemText primary="Create a new deck" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="edit-my-flashcards" disablePadding>
                        <ListItemButton component={Link} to="/decks">
                            <ListItemIcon>
                                <AutoAwesomeMotion />
                            </ListItemIcon>
                            <ListItemText primary="My decks" />
                        </ListItemButton>
                    </ListItem>
                </List>
        </div>
    )
    return (
        <Box  sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 0 }}>
                <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                    <Typography variant="h4"
                        sx={{ mr: 2}}
                    >
                        Brain Deck
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { md: 'flex' } }}>
                        <Button
                            href="/"
                            color="inherit"
                        >
                            Home
                        </Button>
                    </Box>
                    <Box sx={{ flexGrow: 0, display: {md: 'flex' } }}>
                        <Tooltip title="Open settings">
                            <IconButton  onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar />
                            </IconButton>
                        </Tooltip>
                        <Menu 
                            open={Boolean(anchorElUser)} 
                            anchorEl={anchorElUser}
                            onClose={() => setAnchorElUser(null)}
                        >
                            <MenuItem onClick={doSignOut}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box className="content2" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        xs: 'block', sm: 'none',
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, },
                    }}
                    slotProps={{
                        root: {
                        keepMounted: true, // Better open performance on mobile.
                        },
                    }}
                    >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                    display: { xs: 'none', sm: 'block'},
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, boxShadow: 9 },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box sx={{ position: 'relative', flexGrow: 1, p: 3, maxWidth: { sm: '60%' } }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
        
    );
}

