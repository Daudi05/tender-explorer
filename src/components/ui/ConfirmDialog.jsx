/*
  ConfirmDialog.jsx — a small confirmation modal for destructive actions.
  Props: isOpen, onConfirm, onCancel, message, confirmLabel, confirmVariant, confirmDisabled
  Used before deleting documents — we never delete without a confirmation step.

  confirmDisabled: pass true while the delete request is in flight to prevent
  double-submit. The button label should also change ("Delete" → "Deleting…")
  so the user knows something is happening.
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
  confirmDisabled = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm action" size="sm">
      <p className="confirm-dialog-message">{message}</p>
      <div className="confirm-dialog-actions">
        <Button variant="ghost" onClick={onCancel} disabled={confirmDisabled}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
