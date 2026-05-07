function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="confirm-dialog">
        <div className="confirm-icon">!</div>

        <div>
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <div className="confirm-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelText}
          </button>

          <button type="button" className="danger-button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;