import React from "react";
import { useState} from "react";
import { Button, Toolbar, AppBar, Typography, Box, Link, IconButton, Avatar, Tooltip, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { doSignOut } from "../../auth";
import { LibraryAdd, Home } from "@mui/icons-material";
import "../styles/Layout.css";

export default function Layout({ children }) {
    const [anchorElUser, setAnchorElUser] = useState(null);
    
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const drawerWidth = 300

    return (
        <div className="layout">
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 0 }}>
                <Toolbar>
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
            
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    marginRight: 5,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', boxShadow: 9, },
                }}
                variant="permanent"
            >
                <Toolbar />
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton href="/">
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="my-flashcards" disablePadding>
                        <ListItemButton href="/create">
                            <ListItemIcon>
                                <LibraryAdd />
                            </ListItemIcon>
                            <ListItemText primary="Create a new deck" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <div className="content">
                
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}

