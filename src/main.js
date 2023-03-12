import './style.css'

const app_url = import.meta.env.VITE_app_url;

document.addEventListener("DOMContentLoaded",()=>{
  if(localStorage.getItem("accessToken")){
    window.location.href = `${app_url}/dashboard/dashboard.html`;
  }else{
    window.location.href = `${app_url}/login/login.html`;
  }
})

