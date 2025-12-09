import { useCallback, useState } from 'react';

/**
 * Hook para controlar confirmação de descarte de alterações em modais/formulários.
 */
const useUnsavedChangesPrompt = ({
  confirmTitle = 'Descartar alterações?',
  confirmMessage = 'As alterações não salvas serão perdidas. Deseja continuar?',
} = {}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const resetDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  const requestClose = useCallback(
    (action) => {
      if (isDirty) {
        setPendingAction(() => action);
        setShowConfirm(true);
      } else if (typeof action === 'function') {
        action();
      }
    },
    [isDirty],
  );

  const confirmClose = useCallback(() => {
    setShowConfirm(false);
    const action = pendingAction;
    setPendingAction(null);
    if (typeof action === 'function') {
      action();
    }
    setIsDirty(false);
  }, [pendingAction]);

  const cancelClose = useCallback(() => {
    setShowConfirm(false);
    setPendingAction(null);
  }, []);

  return {
    isDirty,
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage,
  };
};

export default useUnsavedChangesPrompt;

