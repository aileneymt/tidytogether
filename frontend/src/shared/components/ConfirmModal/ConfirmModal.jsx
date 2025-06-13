import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import './ConfirmModal.css';

function ConfirmModal({title, bodyText, handleConfirm, confirmModalOpen, handleCloseConfirmModal, confirmBtnText, cancelBtnText }) {

    return (
    <>
        <Dialog
                open={confirmModalOpen}
                onClose={handleCloseConfirmModal}
                className='modal'
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: '#628DDE',
                            border: '5px solid white',
                            borderRadius: '15px',
                            color: 'white'
                        }
                    },
                }}
            >
                <DialogTitle>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <h2>{title}</h2>
                        <Box>
                            <IconButton className='icon-btn' onClick={() => handleCloseConfirmModal(false)}>
                                <CancelOutlinedIcon sx={{ color: 'white'}}/>
                            </IconButton>
                        </Box>
                    </Box>
                    
                </DialogTitle>
                <DialogContent>
                    <p>{bodyText}</p>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end'}}>
                    <Button variant='contained' size='medium' id='confirmModalConfirmBtn' onClick={() => handleConfirm(true)}>
                        {confirmBtnText ?? 'Confirm'}
                    </Button>
                    <Button variant='outlined' size='medium' id='confirmModalCancelBtn' onClick={() => handleConfirm(false)}>
                        {cancelBtnText ?? 'Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default ConfirmModal;