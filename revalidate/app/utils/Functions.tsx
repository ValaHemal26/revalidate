import { usePathname } from "next/navigation";

export function isActive (path: string) {
    const pathname = usePathname();
     return pathname === path ? true : false;
}
