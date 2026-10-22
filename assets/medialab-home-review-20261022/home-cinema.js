/* One poster-first cinema stage. Selection never starts playback or sound.
   This controller replaces medialab-motion.js for the new #studies layout. */
(()=>{'use strict';
 const host=document.querySelector('#studies.mh-cinema');if(!host)return;
 const video=host.querySelector('#mh-cinema-video'),play=host.querySelector('[data-home-film-play]'),status=host.querySelector('[data-home-film-status]'),current=host.querySelector('[data-home-film-current]'),strip=host.querySelector('[data-home-filmstrip]');
 if(!video||!play||!status||!current||!strip)return;
 const buttons=[...strip.querySelectorAll('[data-home-film-index]')];
 let films=[],selected=0,ready=false,request=0,failed=false;
 const locale=()=>window.GinovaI18n?.current()||document.documentElement.lang.split('-')[0]||'en';
 const copy=()=>window.MediaLabHomeCopy?.[locale()]||window.MediaLabHomeCopy?.en;
 const title=index=>copy()?.[films[index]?.titleKey]||films[index]?.titleKey||'';
 function render(){
  if(!ready)return;const words=copy();if(!words)return;
  current.textContent=title(selected);current.dataset.homeCopy=films[selected].titleKey;
  video.setAttribute('aria-label',title(selected));strip.setAttribute('role','group');strip.setAttribute('aria-label',words.filmstripLabel);
  buttons.forEach((button,index)=>{button.setAttribute('aria-pressed',String(index===selected));button.tabIndex=index===selected?0:-1;button.setAttribute('aria-label',title(index));const label=button.querySelector('[data-home-copy]');if(label){label.dataset.homeCopy=films[index].titleKey;label.textContent=title(index)}});
  const key=video.paused||video.ended?'playFilm':'pauseFilm';
  const label=play.querySelector('[data-home-copy]');if(label){label.dataset.homeCopy=key;label.textContent=words[key]}
  play.setAttribute('aria-label',words[key]+' — '+title(selected));play.title=words[key];play.hidden=!video.paused&&!video.ended;
  host.classList.toggle('mh-cinema-playing',!video.paused&&!video.ended);
  status.hidden=!failed;if(failed)status.textContent=words.filmError;
 }
 function showError(){failed=true;render()}
 function select(index,focus=false){
  if(!ready||!Number.isInteger(index)||index<0||index>=films.length)return;
  request++;video.pause();try{video.currentTime=0}catch{}
  selected=index;failed=false;video.muted=true;video.defaultMuted=true;video.preload='none';
  video.poster=films[index].poster;video.src=films[index].src;video.load();render();
  if(focus){buttons[index].focus({preventScroll:true});buttons[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'})}
 }
 async function explicitPlay(){
  if(!ready)return;if(!video.paused&&!video.ended){request++;video.pause();return}
  const ticket=++request;failed=false;render();
  try{await video.play()}catch(error){if(ticket===request&&error?.name!=='AbortError')showError()}
  if(ticket===request)render();
 }
 function initialize(){
  if(ready)return;
  const candidate=window.MediaLabHomeFilms,words=copy();
  if(!Array.isArray(candidate)||candidate.length!==6||buttons.length!==6||!words)return;
  if(!candidate.every((film,index)=>typeof film?.src==='string'&&film.src.trim()&&typeof film.poster==='string'&&film.poster.trim()&&typeof film.titleKey==='string'&&typeof words[film.titleKey]==='string'&&Number(buttons[index].dataset.homeFilmIndex)===index))return;
  films=candidate;ready=true;video.preload='none';video.removeAttribute('autoplay');video.loop=false;video.defaultMuted=true;video.muted=true;video.playsInline=true;video.controls=true;video.tabIndex=0;
  buttons.forEach((button,index)=>{
   button.addEventListener('click',()=>select(index));
   button.addEventListener('keydown',event=>{
    const key=window.GinovaI18n?.key?window.GinovaI18n.key(event):event.key;let next=index;
    if(key==='ArrowRight'||key==='ArrowDown')next=(index+1)%films.length;
    else if(key==='ArrowLeft'||key==='ArrowUp')next=(index-1+films.length)%films.length;
    else if(key==='Home')next=0;else if(key==='End')next=films.length-1;else return;
    event.preventDefault();select(next,true);
   });
  });
  play.addEventListener('click',explicitPlay);
  video.addEventListener('play',()=>{
   failed=false;
   document.querySelectorAll('audio,video').forEach(media=>{if(media!==video){try{media.pause()}catch{}}});
   document.dispatchEvent(new CustomEvent('ginova-audio-focus',{detail:{media:video}}));
   if(document.activeElement===play)video.focus({preventScroll:true});render();
  });
  for(const event of ['pause','ended','loadedmetadata'])video.addEventListener(event,render);
  video.addEventListener('error',showError);
  document.addEventListener('play',event=>{if(event.target!==video&&['AUDIO','VIDEO'].includes(event.target?.tagName)&&!video.paused)video.pause()},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});addEventListener('pagehide',()=>video.pause());
  strip.hidden=false;play.hidden=false;host.dataset.homeCinema='ready';render();
 }
 const language=()=>{initialize();render()};
 document.addEventListener('ginova-language',language);document.addEventListener('medialab-home-films-ready',initialize);
 new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-locale']});
 initialize();
})();
