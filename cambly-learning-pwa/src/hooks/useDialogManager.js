import { useState, useCallback } from 'react';

/**
 * Dialog yönetim hook'u - aynı anda sadece bir dialog açılmasını sağlar
 */
export const useDialogManager = () => {
  const [activeDialog, setActiveDialog] = useState(null);
  const [dialogData, setDialogData] = useState(null);

  // Dialog açma fonksiyonu
  const openDialog = useCallback((dialogType, data = null) => {
    // Eğer zaten bir dialog açıksa, önce onu kapat
    if (activeDialog) {
      setActiveDialog(null);
      setDialogData(null);
    }
    
    // Yeni dialog'u aç
    setActiveDialog(dialogType);
    setDialogData(data);
  }, [activeDialog]);

  // Dialog kapatma fonksiyonu
  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setDialogData(null);
  }, []);

  // Belirli bir dialog'u açma fonksiyonları
  const openConfirmDialog = useCallback((data) => {
    openDialog('confirm', data);
  }, [openDialog]);

  const openAlertDialog = useCallback((data) => {
    openDialog('alert', data);
  }, [openDialog]);

  const openCustomDialog = useCallback((dialogType, data) => {
    openDialog(dialogType, data);
  }, [openDialog]);

  return {
    activeDialog,
    dialogData,
    openDialog,
    closeDialog,
    openConfirmDialog,
    openAlertDialog,
    openCustomDialog,
    isDialogOpen: activeDialog !== null
  };
};
