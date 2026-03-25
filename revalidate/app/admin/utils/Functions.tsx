import Cookies from 'js-cookie';
export  function GetAuthCookie(){
    const token = Cookies.get("token");
    return token ?? null;
}