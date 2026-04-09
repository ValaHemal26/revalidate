import "../assets/css/style.css";

export function LoaderModal({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;

  return (
    <div className="overlay-modal overlay">
      <div className="modal">
        <div className="spinner" />
        <p>{message}</p>
      </div>
    </div>
  );
}
