/* Click-to-load album context. No image, iframe, fetch or external API is used
   before visitor intent. All content writes stay inside #mm-album. */
(()=>{'use strict';
 const host=document.getElementById('mm-album');if(!host)return;
 const load=host.querySelector('[data-album-load]'),close=host.querySelector('[data-album-close]'),poster=host.querySelector('[data-album-poster]'),player=host.querySelector('[data-album-player]'),slot=host.querySelector('[data-album-slot]'),status=host.querySelector('[data-album-status]'),direct=host.querySelector('[data-album-direct]');
 if(!load||!close||!poster||!player||!slot||!status||!direct)return;
 let iframe=null,frameVideoId='',lastTrigger=load,statusKey='idle',statusVisible=false;
 const locale=()=>window.GinovaI18n?.current()||document.documentElement.lang.split('-')[0]||'en';
 const copy=()=>window.MediaLabAlbumCopy?.[locale()]||window.MediaLabAlbumCopy?.en;
 const data=()=>window.MediaLabAlbum||{};
 const title=()=>typeof data().title==='string'&&data().title.trim()?data().title.trim():copy()?.fallbackTitle||'Linked release';
 function sourceUrl(){
  try{const value=new URL(data().url||direct.getAttribute('href'));if(value.protocol==='https:'&&['youtube.com','www.youtube.com','youtu.be','music.youtube.com'].includes(value.hostname))return value.href}catch{}
  return null;
 }
 function videoId(){const id=data().videoId;return typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null}
 function canEmbed(){const availability=data().embedAvailability;return !!videoId()&&availability!==false&&availability?.available!==false&&!['unavailable','not_embeddable','disabled','blocked','not_available'].includes(availability)}
 function setStatus(key,visible=true){statusKey=key;statusVisible=visible;const words=copy();status.textContent=words?.[key]||'';status.hidden=!visible}
 function removePlayer(restoreFocus=false,key='idle',visible=false){
  if(iframe){iframe.remove();iframe=null}slot.replaceChildren();frameVideoId='';player.hidden=true;poster.hidden=false;load.setAttribute('aria-expanded','false');setStatus(key,visible);
  if(restoreFocus&&!load.hidden)(lastTrigger?.isConnected?lastTrigger:load).focus({preventScroll:true});
 }
 function pauseNativeMedia(){document.querySelectorAll('audio,video').forEach(media=>{try{media.pause()}catch{}})}
 function render(){
  const words=copy();if(!words)return;
  host.querySelectorAll('[data-album-copy]').forEach(el=>{const value=words[el.dataset.albumCopy];if(typeof value==='string'&&el.textContent!==value)el.textContent=value});
  document.querySelector('main#top')?.querySelectorAll('[data-mm-album-copy]').forEach(el=>{const value=words[el.dataset.mmAlbumCopy];if(typeof value==='string'&&el.textContent!==value)el.textContent=value});
  host.querySelectorAll('[data-album-title]').forEach(el=>{el.textContent=title();el.lang='it';el.dir='ltr'});
  const channel=typeof data().channel==='string'?data().channel.trim():'';
  host.querySelectorAll('[data-album-channel]').forEach(el=>el.textContent=channel);
  const channelRow=host.querySelector('[data-album-channel-row]');if(channelRow)channelRow.hidden=!channel;
  const url=sourceUrl();if(url)direct.href=url;
  load.hidden=!canEmbed();
  if(iframe&&(!canEmbed()||frameVideoId!==videoId()))removePlayer(false,'unavailable',true);
  if(iframe)iframe.title=title()+' — '+words.playerSuffix;
  if(!canEmbed())setStatus('unavailable',true);else setStatus(statusKey,statusVisible);
 }
 load.addEventListener('click',()=>{
  if(!canEmbed())return;
  lastTrigger=document.activeElement===load?document.activeElement:load;
  pauseNativeMedia();removePlayer();
  const frame=document.createElement('iframe');
  frameVideoId=videoId();frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(frameVideoId)+'?autoplay=0&controls=1&rel=0&hl='+encodeURIComponent(locale());
  frame.title=title()+' — '+(copy()?.playerSuffix||'YouTube player');frame.width='1280';frame.height='720';
  frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.addEventListener('error',()=>{if(iframe===frame)removePlayer(false,'unavailable',true)});
  iframe=frame;slot.append(frame);poster.hidden=true;player.hidden=false;load.setAttribute('aria-expanded','true');setStatus('opened',true);close.focus({preventScroll:true});
 });
 close.addEventListener('click',()=>removePlayer(true));
 direct.addEventListener('click',()=>{pauseNativeMedia();removePlayer(false)});
 document.addEventListener('play',event=>{if(iframe&&['AUDIO','VIDEO'].includes(event.target?.tagName))removePlayer(false,'stopped',true)},true);
 addEventListener('pagehide',()=>removePlayer(false));
 document.addEventListener('ginova-language',render);
 document.addEventListener('medialab-album-ready',render);
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-locale']});
 render();
})();
