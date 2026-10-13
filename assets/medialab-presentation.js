/* MediaLab's actual header measurement and visitor-controlled local selection. */
(()=>{'use strict';
 const root=document.documentElement,main=document.querySelector('.soundlab-gallery-page'),header=document.querySelector('header');
 if(!main||!header)return;
 let height=0,frame=0;
 function measure(){frame=0;const next=Math.ceil(header.getBoundingClientRect().height);if(next>0&&next!==height){height=next;root.style.setProperty('--ml-header-height',next+'px')}}
 function schedule(){if(!frame)frame=requestAnimationFrame(measure)}
 measure();if('ResizeObserver'in window)new ResizeObserver(schedule).observe(header);
 addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',schedule);
 if(window.visualViewport)visualViewport.addEventListener('resize',schedule,{passive:true});
 if(document.fonts?.ready)document.fonts.ready.then(schedule);
 document.addEventListener('ginova-language',schedule);
})();

/* Tab layout and accessible orientation change together. */
(()=>{const tabs=document.querySelector('#formats .sl-tabs');if(!tabs)return;const desktop=matchMedia('(min-width:901px)');const sync=()=>tabs.setAttribute('aria-orientation',desktop.matches?'horizontal':'vertical');desktop.addEventListener('change',sync);sync()})();
