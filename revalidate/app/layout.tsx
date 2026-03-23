import "./assets/css/style.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Content from "./components/Content";
import { cookies } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ Get cookie server-side
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin")?.value;
  const admin = adminCookie ? JSON.parse(adminCookie) : null;

  return (
    <html lang="en">
      <body>
        <Header admin={admin} />

        <Content admin={admin}>
          {children}
        </Content>

        <Footer />
      </body>
    </html>
  );
}