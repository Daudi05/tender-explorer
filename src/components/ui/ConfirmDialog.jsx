import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  isDanger = false,
  confirmDisabled = false
}) => {
  const handleClose = onClose || onCancel;

  const footerActions = (
    <>
      <Button variant="outline" onClick={handleClose} isDisabled={confirmDisabled}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant || (isDanger ? 'danger' : 'primary')}
        onClick={onConfirm}
        isDisabled={confirmDisabled}
      >
        {confirmLabel || confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} footer={footerActions} size="sm">
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
