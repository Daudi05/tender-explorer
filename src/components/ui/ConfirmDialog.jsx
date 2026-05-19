import { Modal } from './Modal'
import { Button } from './Button'

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
  confirmDisabled = false,
}) => {
  const handleClose = onClose || onCancel

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
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
      }
    >
      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  )
}

export default ConfirmDialog
