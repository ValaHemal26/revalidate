import Sidebar from "./Sidebar";

export default function Content({ children,admin }: any) {
  return (
    <div className="content-container">
      <Sidebar admin={admin} />

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}