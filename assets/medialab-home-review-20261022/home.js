/* Homepage scenes: localized commissions, accessible tabs and retained mailto flow. */
(()=>{'use strict';
 const main=document.querySelector('main.mh-home');if(!main)return;
 const locale=()=>window.GinovaI18n?.current()||document.documentElement.lang.split('-')[0]||'en';
 const tabs=[...main.querySelectorAll('[data-home-service]')],panels=[...main.querySelectorAll('[data-home-service-panel]')];let selected=0;
 function choose(index,focus=false){if(!Number.isInteger(index)||index<0||index>=panels.length)return;selected=index;tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1});panels.forEach((p,i)=>p.hidden=i!==index);if(focus)tabs[index].focus()}
 function render(){const c=window.MediaLabHomeCopy?.[locale()]||window.MediaLabHomeCopy?.en;if(!c)return;
  main.querySelectorAll('[data-home-copy]').forEach(e=>{const value=c[e.dataset.homeCopy];if(typeof value==='string'&&e.textContent!==value)e.textContent=value});
  main.querySelectorAll('[data-home-aria]').forEach(e=>{const value=c[e.dataset.homeAria];if(typeof value==='string')e.setAttribute('aria-label',value)});
  main.querySelector('.atlas-tracks')?.setAttribute('aria-label',c.collectionTracks);
 }
 if(tabs.length===3&&panels.length===3){
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(i));t.addEventListener('keydown',e=>{let next=i;const key=window.GinovaI18n?.key?window.GinovaI18n.key(e):e.key;if(key==='ArrowRight'||key==='ArrowDown')next=(i+1)%tabs.length;else if(key==='ArrowLeft'||key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;else if(key==='Home')next=0;else if(key==='End')next=tabs.length-1;else return;e.preventDefault();choose(next,true)})});
  choose(0);main.querySelector('.mh-service-tabs').hidden=false;
 }
 main.querySelectorAll('[data-home-area]').forEach(a=>a.addEventListener('click',()=>{const form=main.querySelector('.proposal-form');if(!form)return;form.elements.area.value=a.dataset.homeArea;const heading=main.querySelector('#enquiry h2');if(heading)requestAnimationFrame(()=>{heading.tabIndex=-1;heading.focus({preventScroll:true})})}));
 const atlas=main.querySelector('#atlas-album'),atlasReady=atlas?.dataset.atlasReady==='true';
 if(atlas){atlas.querySelector('.atlas-layout').hidden=!atlasReady;atlas.querySelector('[data-home-audio-fallback]').hidden=atlasReady}
 const cinema=main.querySelector('#studies'),filmFallback=cinema?.querySelector('[data-home-film-fallback]');if(filmFallback&&cinema.dataset.homeCinema==='ready')filmFallback.hidden=true;
 const filmDirect=main.querySelector('[data-home-film-direct]'),film=main.querySelector('#mh-cinema-video');
 if(filmDirect&&film){const update=()=>filmDirect.href=film.getAttribute('src')||window.MediaLabHomeFilms?.[0]?.src;new MutationObserver(update).observe(film,{attributes:true,attributeFilter:['src']});update()}
 main.querySelector('.mh-released-archive')?.addEventListener('toggle',e=>{if(!e.target.open){const slot=document.getElementById('album-player-slot');slot?.replaceChildren();const panel=document.getElementById('album-player-panel');if(panel)panel.hidden=true}});
 // A visitor's explicit playback choice owns the sound. Remove a legacy album
 // embed when native media begins, without stealing focus or claiming playback.
 document.addEventListener('play',e=>{if(!['AUDIO','VIDEO'].includes(e.target?.tagName))return;document.querySelectorAll('audio,video').forEach(other=>{if(other!==e.target)other.pause()});const slot=document.getElementById('album-player-slot');slot?.replaceChildren();const panel=document.getElementById('album-player-panel');if(panel)panel.hidden=true},true);
 document.addEventListener('ginova-language',render);new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-locale']});
 main.dataset.homeReady='true';render();
})();
