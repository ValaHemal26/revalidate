import { usePathname } from "next/navigation";

export function isActive (path: string) {
    const pathname = usePathname();
     return pathname === path ? true : false;
}
export function getCookie(cookieName) {
    const cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].trim().split("=");

        if (cookieName === cookiePair[0]) {
            return cookiePair[1];
        }
    }

    return null;
}