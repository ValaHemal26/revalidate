import { cookies,headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TrackTicketLayout({ children }) {
   const cookieStore = await cookies();
   const headersList = await headers();
 
   const pathname = headersList.get('x-pathname');
   const token = cookieStore.get('userToken');
    if (
        token &&
        (pathname === "/track-ticket/login" || pathname === "/track-ticket/otp")
    ) {
        redirect("/track-ticket/dashboard");
    }
    if (!token && pathname !== "/track-ticket/login" && pathname !== "/track-ticket/otp") {
        redirect("/track-ticket/login");
    }
    
    return (
        <div className="track-ticket-container">
        {children}
        </div>
    );
}