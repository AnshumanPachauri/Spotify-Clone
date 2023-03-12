import { access_Token, expires_In, logout, token_Type } from "./common";

const baseapiurl = import.meta.env.VITE_api_base_url;

const getaccesstoken = ()=>{
    const accesstoken = localStorage.getItem(access_Token);
    const expiresin = localStorage.getItem(expires_In);
    const tokentype = localStorage.getItem(token_Type);

    if(Date.now()<expiresin){
        return {accesstoken,tokentype}
    }
    else{
        logout();
    }
}

const createapiconfig = ({accesstoken, tokentype}, method ="GET")=>{
    return {
        headers:{
            Authorization: `${tokentype} ${accesstoken}`
        },
        method
    }
}

export const fetchrequest = async (endpoint)=>{
    const url = `${baseapiurl}/${endpoint}`;
    const result = await fetch(url,createapiconfig(getaccesstoken()));
    return result.json();
}