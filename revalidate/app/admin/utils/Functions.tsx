import Cookies from 'js-cookie';
export  function GetAuthCookie(){
    
    const token = Cookies.get("userToken");

    return token ?? null;
}