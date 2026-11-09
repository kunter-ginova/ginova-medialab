/* GiNOVA MediaLab: the Home / Story still opens in the shared film dialog; the ident is restored when it closes. */
(function(){
'use strict';
var fd=document.getElementById('filmDlg'),fv=document.getElementById('filmVideo'),btn=document.querySelector('.still-play');
if(!fd||!fv||!btn)return;
var identPoster=fv.getAttribute('poster');
btn.addEventListener('click',function(){
  fv.pause();fv.setAttribute('poster',btn.getAttribute('data-poster'));fv.src=btn.getAttribute('data-video');fv.load();
  if(fd.showModal)fd.showModal();else fd.setAttribute('open','');
  var p=fv.play();if(p&&p.catch)p.catch(function(){});
});
fd.addEventListener('close',function(){fv.removeAttribute('src');fv.setAttribute('poster',identPoster);fv.load()});
})();
