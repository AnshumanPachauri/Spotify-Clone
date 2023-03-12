import { doc } from "prettier";
import { fetchrequest } from "../api";
import { endpoint, getitemfromlocalstorage, loaded_tracks, logout, sectiontype, setitemsinlocalstorage } from "../common";


const audio = new Audio();
let displayname;

const onprofileclick = (event)=>{
    event.stopPropagation();
    const profiemenu = document.querySelector("#profile-menu");
    profiemenu.classList.toggle("hidden");
    if(!profiemenu.classList.contains("hidden")){
        profiemenu.querySelector("li#logout").addEventListener("click", logout);
    }
}


const loaduserprofile = ()=>{
    return new Promise(async (resolve, reject)=>{

        const defaultimage = document.querySelector("#default-image");
        const profilebutton = document.querySelector("#user-profile-button");
        const displaynameelement = document.querySelector("#display-name");
    
        const {display_name:displayname, images} = await fetchrequest(endpoint.userinfo);
    
        if(images?.length){
            defaultimage.classList.add("hidden");
        }else{
            defaultimage.classList.remove("hidden");
        }
    
        profilebutton.addEventListener("click",onprofileclick);
    
        displaynameelement.textContent = displayname;

        resolve({displayname});
    });
    
}


const onplaylistitemclicked = (event,id)=>{
    console.log(event.target);
    const section = {type:sectiontype.playlist,playlist:id};
    history.pushState(section,"",`playlist/${id}`);
    loadsections(section);
}


const loadplaylist = async (endpoint,elementId)=>{
    const {playlists:{items}} = await fetchrequest(endpoint);
    const playlistitemssection = document.querySelector(`#${elementId}`);

    for(let {name, description, images, id} of items){
        const playlistitem = document.createElement("section");
        playlistitem.className = " bg-black-secondary rounded p-4  hover:cursor-pointer hover:bg-light-black";
        playlistitem.id = id;
        playlistitem.setAttribute("data-type","playlist");
        playlistitem.addEventListener("click",(event)=> onplaylistitemclicked(event,id));
        const [{url:imageurl}] = images;
        playlistitem.innerHTML =  `<img src="${imageurl}" alt="${name}" class = "rounded mb-2 object-contain shadow"/>
            <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
            <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;
        
            playlistitemssection.appendChild(playlistitem);
        
    }
    
}

const loadplaylists = ()=>{
    loadplaylist(endpoint.featuredplaylist, "featured-playlist-items");
    loadplaylist(endpoint.toplists, "top-playlist-items");

}


const fillcontentfordashboard = ()=>{
    const covercontent = document.querySelector("#cover-content");
    covercontent.innerHTML = `<h1 class = "text-6xl">Hello ${displayname}</h1>`;
    const pagecontent = document.querySelector("#page-content");
    const playlistmap = new Map([["featured","featured-playlist-items"],["top playlists", "top-playlist-items"]]);
    let innerHTML = "";
    for(let [type,id] of playlistmap){
        innerHTML+=`
        <article class="p-4 ">
                <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
                <section class="featured-songs grid grid-cols-auto-fill-cards gap-4" id="${id}">
                    
                </section>
            </article>
        `
    }
    pagecontent.innerHTML = innerHTML;
}

const formattime = (duration)=>{
    const min = Math.floor(duration/60_000);
    const sec = ((duration%6_000)/1000).toFixed(0);
    const formattedtime = sec == 60?
    min + 1+ ":00" : min + ":" + (sec<10? "0" : "")+sec;
    return formattedtime;
}

const ontrackselection = (id, event)=>{
    document.querySelectorAll("#tracks .track").forEach(trackItem=>{
        if(trackItem.id === id){
            trackItem.classList.add("bg-gray", "selected");
        }
        else{
            trackItem.classList.remove("bg-gray", "selected");
        }
    })
}

const updateiconsforplaymode = (id)=>{
    const playbutton = document.querySelector("#play");
    playbutton.querySelector('span').textContent = "pause_circle";
    const playbuttonfromtracks = document.querySelector(`#play-track-${id}`);
    if(playbuttonfromtracks){
        playbuttonfromtracks.textContent = "pause";
    }
}

const updateiconsforpausemode = (id) =>{
    const playbutton = document.querySelector("#play");
    playbutton.querySelector('span').textContent = "play_circle";
    const playbuttonfromtracks = document.querySelector(`#play-track-${id}`);
    if(playbuttonfromtracks){
        playbuttonfromtracks.textContent = "play_arrow";
    }

}

const onaudiometadataloaded = (id)=>{
    const totalsongduration = document.querySelector("#total-song-duration");
    totalsongduration.textContent = `0:${audio.duration.toFixed(0)}`;
}



const toggleplay = ()=>{
    if(audio.src){
        if(audio.paused){
            audio.play();
            
        }
        else{
            audio.pause();    

        }
    }
}

const findcurrenttrack = ()=>{
    const audiocontrol = document.querySelector("#audio-control");
    const trackid = audiocontrol.getAttribute("data-track-id");
    if(trackid){
        const loadedtracks = getitemfromlocalstorage(loaded_tracks);
        const currenttrackindex = loadedtracks?.findIndex(trk=> trk.id === trackid);
        return {currenttrackindex, tracks:loadedtracks};
    }
    return null;
}

const playnexttrack = ()=>{
    const {currenttrackindex = -1, tracks = null} = findcurrenttrack() ?? {};
    if(currenttrackindex>-1 && currenttrackindex < tracks.length -1){
        playtrack(null, tracks[currenttrackindex+1]);
    }
}


const playprevtrack = ()=>{
    const {currenttrackindex = -1, tracks = null} = findcurrenttrack() ?? {};
    if(currenttrackindex > 0 ){
        playtrack(null, tracks[currenttrackindex -1]);
    }
}


const playtrack = (event, {image, artistNames, name, duration, previewUrl, id})=>{
    
    if(event?.stopPropagation){
        event.stopPropagation();
    }


    if(audio.src === previewUrl){
        toggleplay();
        
    }
    else{
        
    console.log(image, artistNames, name, duration, previewUrl, id);
    
    const nowplayingsongimage = document.querySelector("#now-playing-image");
    nowplayingsongimage.src = image.url;
    
    const songtitle = document.querySelector("#now-playing-song");
    const artists = document.querySelector("#now-playing-artists");
    const audiocontrol = document.querySelector("#audio-control");
    const songinfo = document.querySelector("#song-info");
    audiocontrol.setAttribute("data-track-id", id);
    
    songtitle.textContent = name;
    artists.textContent = artistNames;
    audio.src = previewUrl;
    audio.play();
    songinfo.classList.remove("invisible");
    
    }
    
    
}


const loadplaylisttracks = ({tracks})=>{
    const tracksection = document.querySelector("#tracks");
    let trackno = 1;
    const loadedtracks = [];
    for(let trackItem of tracks.items.filter(item=> item.track.preview_url)){
        let {id, artists, name, album, duration_ms:duration, preview_url:previewUrl} = trackItem.track;
        let track = document.createElement("section");
        track.id = id;
        track.className = "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 rounded-md hover:bg-light-black";
        let image = album.images.find(img=> img.height === 64);
        console.log(artists);
        let artistNames = Array.from(artists, artist=>artist.name).join(", ");
        track.innerHTML = `
            <p class="relative w-full flex items-center justify-center justify-self-center"><span class = "track-no">${trackno++}</span></p>
                <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
                    <img class="h-10 w-10" src="${image.url}" alt="${name}"/>
                    <article class="flex flex-col gap-2 justify-center">
                        <h2 class="song-title text-primary text-base line-clamp-1">${name}</h2>
                        <p class="text-xs line-clamp-1">${artistNames}</p>
                    </article>
                </section>
            <p class = "text-sm">${album.name}</p>
            <p class = "text-sm">${formattime(duration)}</p>

        `;

        track.addEventListener("click", (event)=> ontrackselection(id,event));

        const playbutton = document.createElement("button");
        playbutton.id = `play-track-${id}`;
        playbutton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`;
        
        playbutton.textContent = "play_arrow";
        playbutton.addEventListener("click", (event) => playtrack(event, { image, artistNames, name, duration, previewUrl, id }));
        track.querySelector("p").appendChild(playbutton);
        tracksection.appendChild(track);

        loadedtracks.push({id, artistNames, name, album, duration, previewUrl, image});


    }

    setitemsinlocalstorage(loaded_tracks,loadedtracks);
    
}


const fillcontentforplaylist = async (playlistid)=>{
    const playlist = await fetchrequest(`${endpoint.playlist}/${playlistid}`);
    const coverelement = document.querySelector("#cover-content");
    console.log(playlist);
    const {name, description, images, tracks,  } = playlist;
    coverelement.innerHTML = `
                    <img class = "object-contain h-36 w-36" src="${images[0].url}" alt="" />
                    <section>
                        <h2 id="playlist-name" class="text-4xl">${name}</h2>
                    
                        <p id="playlist-details">${tracks.items.length} Songs</p>
                    <section>
                    `
    
    const pagecontent = document.querySelector("#page-content");
    pagecontent.innerHTML = `
    <header id = "playlist-header" class="mx-8 border-secondary border-b-[0.5px] z-10">
                    <nav class = "py-2">
                       <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary">
                        <li class="justify-self-center">#</li>
                        <li>Title</li>
                        <li>Album</li>
                        <li>🕑</li>
                       </ul> 
                    </nav>
    </header >
    <section id="tracks" class="px-8 text-secondary mt-4">
    </section>
    `;

    loadplaylisttracks(playlist);


    console.log(playlist);
}

const oncontentscroll = (event)=>{

    const {scrollTop} = event.target;
    const header = document.querySelector(".header");
    const coverelement = document.querySelector("#cover-content");

    const totalHeight = coverelement.offsetHeight;
    const fiftyPercentHeight = totalHeight / 2;
    const coverOpacity = 100 - (scrollTop >= totalHeight ? 100 : ((scrollTop / totalHeight) * 100));
    
    const headerOpacity = scrollTop >= header.offsetHeight? 100: ((scrollTop/header.offsetHeight)*100);
    coverelement.style.opacity = `${coverOpacity}%`;
    header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;
    
    // let headerOpacity = 0;

    

    if(history.state.type = sectiontype.playlist){
        
        const playlistheader = document.querySelector("#playlist-header");
        if(coverOpacity<=35){
            playlistheader.classList.add("sticky", "bg-black-secondary","px-8"); 
            playlistheader.classList.remove("mx-8");
            playlistheader.style.top = `${header.offsetHeight}px`;
        }
        else{
            playlistheader.classList.remove("sticky", "bg-black-secondary","px-8"); 
            playlistheader.classList.add("mx-8");
            playlistheader.style.top = `revert`;
        }
    }
    
}

const loadsections =(section)=>{
    if(section.type === sectiontype.dashboard){
        fillcontentfordashboard();
        loadplaylists();
    }
    else if(section.type === sectiontype.playlist){
        // load the elements for playlist
        fillcontentforplaylist(section.playlist);
    }
    document.querySelector(".content").removeEventListener("scroll",oncontentscroll);
    document.querySelector(".content").addEventListener("scroll",oncontentscroll);
}

const onuserplaylistclick = (id)=>{
    const section = {type:sectiontype.playlist, playlist: id};
    history.pushState(section,"",`/dashboard/playlist/${id}`);
    loadsections(section);
}

const loaduserplaylists = async () =>{
    const playlists = await fetchrequest(endpoint.userplaylist);
    console.log(playlists);
    const userplaylistssection = document.querySelector("#user-playlists > ul");
    userplaylistssection.innerHTML = "";
    for(let {name, id} of playlists.items){
        const li = document.createElement("li");
        li.textContent = name;
        li.className = "cursor-pointer hover:text-primary";
        li.addEventListener("click", ()=> onuserplaylistclick(id));
        userplaylistssection.appendChild(li);
    }
}


document.addEventListener("DOMContentLoaded",async ()=>{

    const volume = document.querySelector("#volume");
    const playbutton = document.querySelector("#play");
    const songdurationcompleted = document.querySelector("#song-duration-completed");
    const songprogress = document.querySelector("#progress");
    const timeline = document.querySelector("#timeline");
    const audiocontrol = document.querySelector("#audio-control");
    const next = document.querySelector("#next");
    const prev = document.querySelector("#prev");
    let progressinterval;

    ({  displayname} = await loaduserprofile());
    loaduserplaylists();
    const section = {type:sectiontype.dashboard};
    history.pushState(section,"","");
    loadsections(section);
    document.addEventListener("click",()=>{
        const profiemenu = document.querySelector("#profile-menu");
        if(!profiemenu.classList.contains("hidden")){
            profiemenu.classList.add("hidden");
        }
    })

    audio.addEventListener("play",()=>{

        const selectedtrackid = audiocontrol.getAttribute("data-track-id");
        const tracks = document.querySelector("#tracks");
        const playingtrack = tracks?.querySelector("section.playing");
        const selectedtrack = tracks?.querySelector(`[id = "${selectedtrackid}"]`);
        if(playingtrack?.id !== selectedtrack?.id){
            playingtrack?.classList.remove("playing");
        }
        selectedtrack?.classList.add("playing");

        progressinterval =  setInterval(() => {
            if(audio.paused){
                return;
            }
            songdurationcompleted.textContent = `${audio.currentTime.toFixed(0) < 10 ? "0:0" + audio.currentTime.toFixed(0) : "0:"+audio.currentTime.toFixed(0)}`;
            songprogress.style.width = `${(audio.currentTime/audio.duration)*100}%`;
        }, 100);
        updateiconsforplaymode(selectedtrackid);
    });

    audio.addEventListener("pause",()=>{
        if(progressinterval){
            clearInterval(progressinterval);
        }
        const selectedtrackid = audiocontrol.getAttribute("data-track-id");
        updateiconsforpausemode(selectedtrackid);

    });
    
    audio.addEventListener("loadedmetadata", onaudiometadataloaded);
    playbutton.addEventListener("click", toggleplay);

    volume.addEventListener("change", ()=>{
        audio.volume = volume.value / 100;
    })
    
    timeline.addEventListener("click",(e)=>{
        const timelinewidth = window.getComputedStyle(timeline).width;
        const timetoseek = (e.offsetX/parseInt(timelinewidth))*audio.duration;
        audio.currentTime = timetoseek;
        songprogress.style.width = `${(audio.currentTime/audio.duration)*100}%`;
    },false);


    next.addEventListener("click", playnexttrack);
    prev.addEventListener("click", playprevtrack);


    window.addEventListener("popstate",(event)=>{

        loadsections(event.state); 
    })
})