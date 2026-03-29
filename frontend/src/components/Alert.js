function Alert({ alert, onClose }) {
  if (!alert?.message) {
    return null;
  }

  return (
    <div className={`alert ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
      <span>{alert.message}</span>
      <button type="button" onClick={onClose}>
        x
      </button>
    </div>
  );
}

export default Alert;
