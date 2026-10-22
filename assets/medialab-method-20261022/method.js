/* Isolated internal method draft. This controller never edits the header,
   starts media, changes recording selection or creates external state. */
(()=>{'use strict';
 const main=document.querySelector('.mm-method-page');if(!main)return;
 const locales=['en','tr','es','de','it','ar','ru','zh','az','fr'];
 const locale=()=>window.GinovaI18n?.current()||document.documentElement.lang.split('-')[0]||'en';
 const section=main.querySelector('.mm-lyrics-section');
 let renderedLyricsKey='';
 function validateLyrics(data,lang){
  if(!data||data.source?.status!=='verified'||!data.source.reference||!Array.isArray(data.stanzas)||!data.stanzas.length)return false;
  if(data.kind==='layout-fixture'&&!document.body.hasAttribute('data-mm-fixture'))return false;
  const ids=new Set();
  for(const stanza of data.stanzas){
   if(!stanza.id||ids.has(stanza.id)||!Array.isArray(stanza.lines)||!stanza.lines.length)return false;ids.add(stanza.id);
    for(const line of stanza.lines){if(!line.id||ids.has(line.id)||typeof line.original!=='string'||!line.original.trim())return false;ids.add(line.id);if(lang!=='it'&&(!data.availableLocales?.includes(lang)||typeof line.translations?.[lang]!=='string'||!line.translations[lang].trim()))return false}
  }return true;
 }
 function renderLyrics(lang,copy){
  if(!section)return;
  const data=window.MediaLabLyrics,ready=validateLyrics(data,lang),container=section.querySelector('.mm-lyrics-content'),pending=section.querySelector('.mm-lyrics-pending');
  container.hidden=!ready;pending.hidden=ready;
  const fallback=section.querySelector('[data-mm-lyrics-fallback]');if(fallback)fallback.hidden=ready;
  section.classList.toggle('mm-lyrics-original-only',lang==='it');
  const fixture=document.body.hasAttribute('data-mm-fixture');
  section.querySelector('.mm-lyrics-draft').hidden=fixture||lang==='it'||data?.translationState!=='draft_for_review';
  section.querySelector('.mm-lyrics-source-note').hidden=fixture||lang==='it';
  const translationLabel=section.querySelector('#mm-translation-label');translationLabel.lang=lang==='zh'?'zh-Hans':lang;translationLabel.dir=lang==='ar'?'rtl':'ltr';
  if(!ready){renderedLyricsKey='';section.querySelector('.mm-lyrics-stanzas').replaceChildren();return}
  const key=lang+'|'+JSON.stringify(data);if(key===renderedLyricsKey)return;renderedLyricsKey=key;
  const sourceLinks=section.querySelector('.mm-lyrics-sources');sourceLinks.replaceChildren();
  for(const [i,reference] of [data.source.reference,data.source.comparisonReference].filter(Boolean).entries()){try{const url=new URL(reference);if(url.protocol!=='https:')continue;const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=copy.sourceLink+' '+String(i+1).padStart(2,'0')+' ↗';sourceLinks.append(link)}catch{}}
  const fragment=document.createDocumentFragment();
  data.stanzas.forEach(stanza=>{const group=document.createElement('div');group.className='mm-lyrics-stanza';group.dataset.stanzaId=stanza.id;
   stanza.lines.forEach(line=>{const row=document.createElement('div');row.className='mm-lyrics-line';row.dataset.lineId=line.id;
    const original=document.createElement('p');original.className='mm-lyrics-original';original.lang='it';original.dir='ltr';original.setAttribute('aria-describedby','mm-original-label');original.textContent=line.original;row.append(original);
    if(lang!=='it'){const translation=document.createElement('p');translation.className='mm-lyrics-translation';translation.lang=lang==='zh'?'zh-Hans':lang;translation.dir=lang==='ar'?'rtl':'ltr';translation.setAttribute('aria-describedby','mm-translation-label');translation.dataset.label=copy.translationLabel;translation.textContent=line.translations[lang];row.append(translation)}group.append(row);
   });fragment.append(group);
  });section.querySelector('.mm-lyrics-stanzas').replaceChildren(fragment);
 }
 function render(){const lang=locale(),copy=window.MediaLabMethodCopy?.[lang]||window.MediaLabMethodCopy?.en;if(!copy)return;
  main.querySelectorAll('[data-mm-copy]').forEach(el=>{const value=copy[el.dataset.mmCopy];if(typeof value==='string'&&el.textContent!==value)el.textContent=value});
  renderLyrics(lang,copy);
  if(!document.body.hasAttribute('data-mm-fixture'))document.title=copy.caseKicker+' | GiNOVA MediaLab';
 }
 document.addEventListener('ginova-language',render);document.addEventListener('medialab-lyrics-ready',()=>{renderedLyricsKey='';render()});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-locale']});
 document.addEventListener('DOMContentLoaded',render,{once:true});
 window.MediaLabMethodDraft={render,validateLyrics,locales:Object.freeze(locales)};render();
})();
