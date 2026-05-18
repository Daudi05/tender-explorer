/*
  ConfirmDialog.jsx — a small confirmation modal for destructive actions.
  Props: isOpen, onConfirm, onCancel, message, confirmLabel, confirmVariant
  Used before deleting documents — we never delete without a confirmation step.
*/
import Modal from './Modal'
import Button from './Button'
import './ConfirmDialog.css'

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm action" size="sm">
      <p className="confirm-dialog-message">{message}</p>
      <div className="confirm-dialog-actions">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
