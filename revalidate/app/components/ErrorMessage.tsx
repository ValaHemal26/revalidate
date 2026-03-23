export default function ErrorMessage({ message }: any) {
  if (!message) return null;

  return (
    <div className="error-box">
      {message}
    </div>
  );
}