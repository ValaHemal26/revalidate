export function LoaderModal({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div className="spinner" />
        <p>{message}</p>
      </div>

      <style jsx>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top: 4px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
};