/* Progressive content enhancement. No framework, tracking, automatic sound,
   synthetic credits or dependence on scroll-driven rendering. */
(()=>{'use strict';
 const root=document.documentElement,main=document.getElementById('top');
 if(!main)return;
 const isProject=document.body.hasAttribute('data-ml-project-page');
 const locale=()=>window.GinovaI18n?.current()||root.lang.split('-')[0]||'en';
 function render(){
  const lang=locale(),copy=window.MediaLabCopy?.[lang]||window.MediaLabCopy?.en;
  if(!copy)return;
  main.querySelectorAll('[data-ml-copy]').forEach(el=>{const value=copy[el.dataset.mlCopy];if(value!==undefined)el.textContent=value});
  document.querySelectorAll('[data-ml-project-link]').forEach(a=>a.href='/work/campi-flegrei/?lang='+lang);
  document.querySelectorAll('[data-ml-home-link]').forEach(a=>a.href='/?lang='+lang);
  document.querySelectorAll('[data-ml-enquiry-link]').forEach(a=>a.href='/?lang='+lang+'#enquiry');
  const video=main.querySelector('#ml-ident-dialog video');if(video)video.setAttribute('aria-label',copy.filmLabel);
  main.querySelector('.ml-version-choice')?.setAttribute('aria-label',copy.versions);
  main.querySelectorAll('[data-ml-study]').forEach(el=>el.querySelector('img').alt=copy[el.dataset.mlStudy==='0'?'study1Alt':'study2Alt']);
  main.querySelectorAll('[data-ml-recording]').forEach(el=>el.querySelector('audio').setAttribute('aria-label','Campi Flegrei — '+copy[el.dataset.mlRecording==='0'?'original':'orchestral']));
  if(isProject)document.title='Campi Flegrei | GiNOVA MediaLab';
 }
 if(isProject&&window.GinovaI18n){
  let lang=GinovaI18n.initial();
  function navigation(){
   GinovaI18n.apply(lang);
   const labels=window.MediaLabNavigationLabels[lang];
   document.querySelectorAll('header [data-t]').forEach(el=>{if(labels[el.dataset.t]!==undefined)el.textContent=labels[el.dataset.t]});
   const strategy=window.GinovaStrategyCopy?.[lang];
   document.querySelectorAll('header [data-strategy]').forEach(el=>{const value=el.dataset.strategy.split('.').reduce((a,k)=>a&&a[k],strategy);if(typeof value==='string')el.textContent=value});
   document.querySelectorAll('[data-route]').forEach(a=>GinovaI18n.route(a,lang));
   document.querySelectorAll('#primaryNav a[data-strategy="common.about"]').forEach(a=>{const url=new URL(a.href,location.href);url.searchParams.set('lang',lang);a.href=url.href});
   document.dispatchEvent(new Event('ginova-language'));render();root.removeAttribute('data-locale-pending');
  }
  document.getElementById('language-select').addEventListener('change',e=>{lang=e.target.value;GinovaI18n.navigate(lang);navigation()});
  document.querySelector('.menu-toggle').addEventListener('click',function(){const open=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',open);document.querySelector('.nav').classList.toggle('menu-open',open)});
  document.querySelectorAll('.navlinks a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav').classList.remove('menu-open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false')}));
  addEventListener('popstate',()=>{lang=GinovaI18n.initial();navigation()});navigation();
 }
 document.addEventListener('ginova-language',render);
 new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang','data-locale']});
 const choices=[...main.querySelectorAll('[data-ml-version]')],recordings=[...main.querySelectorAll('[data-ml-recording]')],studies=[...main.querySelectorAll('[data-ml-study]')];
 function choose(index){
  recordings.forEach((panel,i)=>{const audio=panel.querySelector('audio');audio.pause();panel.hidden=i!==index});
  studies.forEach((study,i)=>study.hidden=i!==index);
  choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 }
 if(choices.length){
  choices.forEach((button,index)=>{button.hidden=false;button.addEventListener('click',()=>choose(index));button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?choices.length-1:(index+1)%choices.length;choose(next);choices[next].focus()})});
  choose(0);
  recordings.forEach(panel=>panel.querySelector('audio').addEventListener('play',e=>{recordings.forEach(other=>{const audio=other.querySelector('audio');if(audio!==e.target)audio.pause()})}));
  addEventListener('pagehide',()=>recordings.forEach(panel=>panel.querySelector('audio').pause()));
 }
 document.addEventListener('DOMContentLoaded',render,{once:true});render();
})();
