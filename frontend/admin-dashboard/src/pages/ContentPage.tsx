import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tabs,
    Tab,
    IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { cmsApi } from '../api';
import { format } from 'date-fns';

const ContentPage: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        try {
            if (tab === 0) {
                const res = await cmsApi.getAnnouncements();
                if (res.data.success) setAnnouncements(res.data.data);
            } else {
                const res = await cmsApi.getBanners();
                if (res.data.success) setBanners(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    };

    const handleOpenDialog = (item?: any) => {
        setEditingItem(item || null);
        if (item) {
            reset(item);
        } else {
            reset({});
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = async (data: any) => {
        try {
            if (tab === 0) {
                // Announcements
                if (editingItem) {
                    await cmsApi.updateAnnouncement(editingItem.id, data);
                } else {
                    await cmsApi.createAnnouncement(data);
                }
            } else {
                // Banners
                if (editingItem) {
                    await cmsApi.updateBanner(editingItem.id, data);
                } else {
                    await cmsApi.createBanner(data);
                }
            }
            handleCloseDialog();
            loadData();
        } catch (error) {
            console.error('Failed to save content:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            if (tab === 0) {
                await cmsApi.deleteAnnouncement(id);
            } else {
                await cmsApi.deleteBanner(id);
            }
            loadData();
        } catch (error) {
            console.error('Failed to delete content:', error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Content Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage announcements and banners for kiosks
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    {tab === 0 ? 'New Announcement' : 'New Banner'}
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Announcements" />
                    <Tab label="Banners" />
                </Tabs>
            </Box>

            <Card>
                <CardContent>
                    {tab === 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Active</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>End Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {announcements.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.title}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                <Chip label={item.priority} size="small" color="primary" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={item.active ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {item.start_date ? format(new Date(item.start_date), 'MMM dd, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {item.end_date ? format(new Date(item.end_date), 'MMM dd, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(item.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {announcements.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No announcements found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Order</TableCell>
                                        <TableCell>Active</TableCell>
                                        <TableCell>Clicks</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {banners.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.title}</TableCell>
                                            <TableCell>{item.position}</TableCell>
                                            <TableCell>{item.display_order}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={item.active ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{item.click_count || 0}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(item.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {banners.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No banners found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        {editingItem ? 'Edit' : 'Create'} {tab === 0 ? 'Announcement' : 'Banner'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {tab === 0 ? (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        {...register('title', { required: true })}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Content"
                                        {...register('content', { required: true })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Type"
                                        {...register('type')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Priority"
                                        {...register('priority')}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        {...register('title')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Image URL"
                                        {...register('image_url')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Link URL"
                                        {...register('link_url')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Position"
                                        {...register('position')}
                                    />
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Display Order"
                                        {...register('display_order')}
                                    />
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editingItem ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ContentPage;
