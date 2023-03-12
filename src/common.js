export const access_Token = "accessToken";
export const token_Type = "tokentype";
export const expires_In = "expiresin";
export const loaded_tracks = "loaded_tracks";
const app_url = import.meta.env.VITE_app_url;

export const endpoint = {
    userinfo : "me",
    featuredplaylist :"browse/featured-playlists?limit=5",
    toplists:"browse/categories/toplists/playlists?limit=10",
    playlist:"playlists",
    userplaylist:"me/playlists"
}

export const logout = ()=>{
    localStorage.removeItem(access_Token);
    localStorage.removeItem(expires_In);
    localStorage.removeItem(token_Type);
    window.location.href = app_url;
}

export const setitemsinlocalstorage = (key, value)=> localStorage.setItem(key, JSON.stringify(value));
export const getitemfromlocalstorage = (key)=> JSON.parse(localStorage.getItem(key));

export const sectiontype = {
    dashboard:"DASHBOARD",
    playlist: "PLAYLIST"
}