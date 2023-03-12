import { access_Token, expires_In, token_Type } from "../common";

const client_id = import.meta.env.VITE_client_id;
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
const redirect_uri = import.meta.env.VITE_redirect_uri;

const appurl = import.meta.env.VITE_app_url;

const authorizeuser = ()=>{
    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${redirect_uri}&scope=${scopes}&show_dialog=true`;
    window.open(url,"login","width=600,height=400");

}


document.addEventListener("DOMContentLoaded",()=>{
    const loginbutton = document.getElementById("login-to-spotify");
    loginbutton.addEventListener("click",authorizeuser);
})


window.addEventListener("load",()=>{
    const accesstoken = localStorage.getItem(access_Token);
    if(accesstoken){
        window.location.href = `${appurl}/dashboard/dashboard.html`;
    }
    
    window.setItemsInLocalStorage = ({accessToken, tokentype, expiresin})=>{
        localStorage.setItem(access_Token, accessToken);
        localStorage.setItem(token_Type, tokentype);
        localStorage.setItem(expires_In,(Date.now() + (expiresin*1000)));
        window.location.href = appurl;
    }

    if(window.opener !==null && !window.opener.closed){
        window.focus();
        if(window.location.href.includes("error")){
            window.close();
        }
        console.log(window.location.hash);
        const {hash} = window.location;
        const searchParam = new URLSearchParams(hash);
        const accessToken = searchParam.get("#access_token");
        const tokentype = searchParam.get("token_type");
        const expiresin = searchParam.get("expires_in");

        if(accessToken){
            window.close();
            window.opener.setItemsInLocalStorage({accessToken, tokentype, expiresin});
            
        }else{
            window.close();
        }
    }
})