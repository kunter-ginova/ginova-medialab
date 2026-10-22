/* A quiet hero until interaction. Selecting a recording plays it; the original
   film may loop silently alongside music, but only one source may be audible. */
(()=>{'use strict';
 const hero=document.querySelector('.sg-hero');if(!hero)return;
 const picker=document.getElementById('medialab-track'),list=document.getElementById('medialab-track-list'),options=[...list.querySelectorAll('[data-track]')],audio=document.getElementById('medialab-audio'),musicToggle=document.getElementById('medialab-music-toggle'),box=audio.closest('.ms-listening-selection');
 const film=hero.querySelector('[data-branch-film]'),video=film.querySelector('video'),filmToggle=film.querySelector('[data-film-toggle]'),sound=film.querySelector('[data-film-sound]'),filmStatus=film.querySelector('.branch-film-status');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),allMedia=[...document.querySelectorAll('audio,video')];
 let selected=0,hasChosen=false,manualPause=false,inView=true,failed=false,request=0,lastAlbumTrigger=null;
 const copy={"az":["Musiqi seçin","Musiqini səsləndir","Musiqiyə fasilə ver","Animasiyanı oynat","Animasiyaya fasilə ver","Səsi aç","Səsi bağla"],"fr":["Choisir un morceau","Lire la musique","Mettre la musique en pause","Lire l’animation","Mettre l’animation en pause","Activer le son","Couper le son"],
  en:['Choose a track','Play music','Pause music','Play animation','Pause animation','Sound on','Mute'],
  es:['Elige una canción','Reproducir música','Pausar música','Reproducir animación','Pausar animación','Activar sonido','Silenciar'],
  de:['Titel auswählen','Musik abspielen','Musik pausieren','Animation abspielen','Animation pausieren','Ton an','Stumm'],
  it:['Scegli un brano','Riproduci musica','Pausa musica','Riproduci animazione','Pausa animazione','Attiva audio','Disattiva audio'],
  ar:['اختر مقطعًا','تشغيل الموسيقى','إيقاف الموسيقى مؤقتًا','تشغيل الرسوم المتحركة','إيقاف الرسوم المتحركة مؤقتًا','تشغيل الصوت','كتم الصوت'],
  ru:['Выберите композицию','Включить музыку','Приостановить музыку','Включить анимацию','Приостановить анимацию','Включить звук','Выключить звук'],
  tr:['Parça seçin','Müziği oynat','Müziği duraklat','Animasyonu oynat','Animasyonu duraklat','Sesi aç','Sesi kapat'],
  zh:['选择曲目','播放音乐','暂停音乐','播放动画','暂停动画','开启声音','静音']
 };
 const paths={play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M9 5v14M15 5v14"/>',sound:'<path d="m11 5-5 4H3v6h3l5 4Z"/><path d="M15 8c2 2 2 6 0 8M18 5c4 4 4 10 0 14"/>',muted:'<path d="m11 5-5 4H3v6h3l5 4Z"/><path d="m16 9 6 6m0-6-6 6"/>'};
 function icon(button,type,label){button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+paths[type]+'</svg>';button.setAttribute('aria-label',label);button.title=label}
 function track(){return options[selected].dataset}
 function labels(){const lang=(document.documentElement.dataset.locale||document.documentElement.lang||'en').split('-')[0];return copy[lang]||copy.en}
 function render(){const t=track(),c=labels();picker.setAttribute('aria-label',c[0]+': '+t.title);picker.title=t.title+' — '+t.artist+' — '+t.duration;list.setAttribute('aria-label',c[0]);audio.setAttribute('aria-label',t.title+' — '+t.artist+' — '+t.duration);musicToggle.hidden=!hasChosen;icon(musicToggle,audio.paused?'play':'pause',c[audio.paused?1:2]);icon(filmToggle,video.paused?'play':'pause',c[video.paused?3:4]);icon(sound,video.muted?'muted':'sound',c[video.muted?5:6]);sound.setAttribute('aria-pressed',String(!video.muted));}
 function closeList(restore=false){list.hidden=true;picker.setAttribute('aria-expanded','false');if(restore)picker.focus({preventScroll:true})}
 function openList(){list.hidden=false;picker.setAttribute('aria-expanded','true');options.forEach((o,i)=>o.tabIndex=i===selected?0:-1);options[selected].focus({preventScroll:true})}
 picker.addEventListener('click',()=>list.hidden?openList():closeList());
 picker.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openList()}});
 list.addEventListener('keydown',e=>{let at=options.indexOf(document.activeElement),next=at;if(e.key==='ArrowDown')next=(at+1)%options.length;else if(e.key==='ArrowUp')next=(at-1+options.length)%options.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=options.length-1;else if(e.key==='Escape'){e.preventDefault();closeList(true);return}else if(e.key==='Tab'){return}else return;e.preventDefault();options.forEach((o,i)=>o.tabIndex=i===next?0:-1);options[next].focus()});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.ms-track-picker'))closeList()});
 document.addEventListener('focusin',e=>{if(!e.target.closest('.ms-track-picker'))closeList()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!list.hidden){e.preventDefault();closeList(true)}});
 function clearYouTube(){const slot=document.getElementById('album-player-slot'),panel=document.getElementById('album-player-panel');if(slot)slot.replaceChildren();if(panel)panel.hidden=true}
 function quietOthers(active){
  for(const media of allMedia){if(media===active)continue;if(media===video||media.matches('[data-showcase-video]')){media.muted=true;continue}media.pause()}
  clearYouTube();render();
 }
 function audioFailure(){box.querySelector('.media-error').hidden=false;box.querySelector('.ms-audio-fallback').hidden=false;render()}
 async function playMusic(){const ticket=++request;quietOthers(audio);try{await audio.play()}catch(e){if(ticket===request)audioFailure()}render()}
 options.forEach((option,index)=>option.addEventListener('click',()=>{
  request++;audio.pause();selected=index;hasChosen=true;const t=track();
  audio.querySelector('source').src=t.source;audio.load();try{audio.currentTime=0}catch(e){}
  options.forEach((o,i)=>o.setAttribute('aria-selected',String(i===index)));
  picker.querySelector('.ms-current-track').textContent=index===0?'End of the Century':t.title;
  box.querySelector('.ms-track-title').textContent=t.title;box.querySelector('.ms-track-artist').textContent=t.artist;box.querySelector('.ms-track-duration').textContent=t.duration;
  const [minutes,seconds]=t.duration.split(':');box.querySelector('.ms-track-duration').dateTime='PT'+minutes+'M'+Number(seconds)+'S';
  const fallback=box.querySelector('.ms-audio-fallback');fallback.href=t.source;fallback.hidden=true;box.querySelector('.media-error').hidden=true;
  closeList(true);render();playMusic();
 }));
 musicToggle.addEventListener('click',()=>{if(audio.paused)playMusic();else{request++;audio.pause();render()}});
 function loadFilm(){if(!video.getAttribute('src')){video.src=film.dataset.filmBase+'soundlab.mp4';video.load()}}
 async function startFilm(manual=false){if(manual)film.dataset.userStarted='true';if(film.hasAttribute('data-ml-film-manual')&&!film.dataset.userStarted)return;if(!manual&&(reduce.matches||navigator.connection?.saveData||document.hidden||manualPause||!inView))return;loadFilm();if(manual)manualPause=false;try{await video.play()}catch(e){manualPause=true;render()}}
 video.muted=true;video.defaultMuted=true;video.loop=false;video.playsInline=true;if(reduce.matches)video.removeAttribute('autoplay');
 filmToggle.addEventListener('click',()=>{if(video.paused)startFilm(true);else{manualPause=true;video.pause();render()}});
 sound.addEventListener('click',()=>{if(video.muted){quietOthers(video);video.muted=false;if(video.paused)startFilm(true)}else video.muted=true;render()});
 for(const media of allMedia){media.addEventListener('play',()=>{
   if(media===video){if(!video.muted)quietOthers(video)}else if(media.matches('[data-showcase-video]')){if(!media.muted)quietOthers(media)}else{quietOthers(media);startFilm()}
   if(media===audio&&'mediaSession'in navigator&&'MediaMetadata'in window){const t=track();navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist})}render();
  });media.addEventListener('pause',render);media.addEventListener('ended',render);
  media.addEventListener('error',()=>{if(media===audio)audioFailure();else if(media===video){failed=true;filmStatus.classList.remove('sr-only');filmStatus.textContent=GinovaI18n.runtime[GinovaI18n.current()].error}else{const error=media.parentElement.querySelector('.media-error');if(error)error.hidden=false}});
 }
 document.addEventListener('ginova-audio-focus',e=>{if(allMedia.includes(e.detail?.media))quietOthers(e.detail.media)});
 video.addEventListener('volumechange',()=>{if(!video.muted)quietOthers(video);render()});
 document.querySelectorAll('.track-select').forEach(button=>button.addEventListener('click',()=>{
  lastAlbumTrigger=button;allMedia.forEach(m=>{if(m===video||m.matches('[data-showcase-video]'))m.muted=true;else m.pause()});
  const panel=document.getElementById('album-player-panel'),slot=document.getElementById('album-player-slot'),title=document.getElementById('album-selected-title');slot.replaceChildren();
  const iframe=document.createElement('iframe');iframe.src='https://www.youtube.com/embed/'+button.dataset.video+'?autoplay=0&controls=1&playsinline=1&hl='+encodeURIComponent(GinovaI18n.current());iframe.title=button.dataset.title+' — YouTube';iframe.allow='encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';slot.appendChild(iframe);title.textContent=button.dataset.title;document.getElementById('album-watch-link').href='https://music.youtube.com/watch?v='+button.dataset.video;panel.hidden=false;panel.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});title.focus({preventScroll:true});render();
 }));
 document.getElementById('album-close-player').addEventListener('click',()=>{clearYouTube();lastAlbumTrigger?.focus()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startFilm()});addEventListener('pagehide',()=>{allMedia.forEach(m=>m.pause());closeList()});addEventListener('pageshow',()=>startFilm());
 reduce.addEventListener('change',()=>{if(reduce.matches){video.removeAttribute('autoplay');video.pause();video.removeAttribute('src');video.load()}else{video.setAttribute('autoplay','');startFilm()}render()});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);if(inView)startFilm();else video.pause()},{threshold:.1}).observe(film);
 const identDialog=document.getElementById('ml-ident-dialog');document.querySelector('[data-ml-open-ident]')?.addEventListener('click',e=>{if(!identDialog?.showModal)return;e.preventDefault();identDialog.showModal();video.muted=true;startFilm(true)});document.querySelector('[data-ml-close-ident]')?.addEventListener('click',()=>identDialog.close());identDialog?.addEventListener('close',()=>{manualPause=true;video.pause();video.muted=true;delete film.dataset.userStarted;render()});
 document.addEventListener('ginova-language',()=>{closeList();render();if(failed)filmStatus.textContent=GinovaI18n.runtime[GinovaI18n.current()].error});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-locale']});render();startFilm();
})();
