import React from "react";
import { useState} from "react";
import { Button, Toolbar, AppBar, Typography, Box, IconButton, Avatar, Tooltip, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { doSignOut } from "../../auth";
import { LibraryAdd, Home, AutoAwesomeMotion, Settings, Menu as MenuIcon } from "@mui/icons-material";
import "../styles/Layout.css";
import { Outlet, Link } from "react-router-dom";

export default function Settingslayout() {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const drawerWidth = 240

    const drawer = (
        <div>
            <Toolbar />
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary="Back home" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="general" disablePadding>
                        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/settings/general">
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary="General" />
                        </ListItemButton>
                    </ListItem>
                </List>
        </div>
    )
    return (
        <Box  sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 0, justifyContent: 'space-between'}}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        onClick={() => setMobileOpen(true)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h4"
                        sx={{ mr: 2, flexGrow: 1}}
                    >
                        Brain Deck
                    </Typography>
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
                    onClose={() => setMobileOpen(false)}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, },
                    }}
                    slotProps={{
                        root: {
                        keepMounted: true,
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

