/* Shared reader behavior for the renormalization-group notes. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const key = 'renormalization-group-note-theme';
  const modes = ['system', 'light', 'dark'];
  let mode = 'system';
  try { mode = localStorage.getItem(key) || mode; } catch (_) {}
  if (!modes.includes(mode)) mode = 'system';
  function theme() {
    if (mode === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = mode;
    const b = $('#theme-toggle');
    if (b) b.textContent = `表示: ${{system:'自動',light:'明',dark:'暗'}[mode]}`;
    try { localStorage.setItem(key, mode); } catch (_) {}
  }
  theme();
  $('#theme-toggle')?.addEventListener('click', () => {mode=modes[(modes.indexOf(mode)+1)%3];theme();});
  let toastTimer;
  function notify(text) {
    const t=$('.toast');if(!t)return;
    t.textContent=text;t.classList.add('visible');clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>t.classList.remove('visible'),2500);
  }
  const headings = $$('.article h2, .article h3');
  headings.forEach((h,i) => {
    if(!h.id)h.id='topic-'+(i+1);
    const a=document.createElement('a');a.className='permalink';a.href='#'+h.id;
    a.textContent='#';a.setAttribute('aria-label','この位置へのリンク');h.append(a);
    a.addEventListener('click',async()=>{
      try {const u=new URL(location.href);u.hash=h.id;await navigator.clipboard.writeText(u.href);notify('この位置へのリンクをコピーしました');}
      catch(_){notify('アドレス欄からこの位置へのリンクをコピーできます');}
    });
  });
  $$('.math-display').forEach((box,i)=>{
    box.id=box.id||'equation-'+(i+1);
    const a=document.createElement('a');a.className='equation-anchor';a.href='#'+box.id;
    a.setAttribute('aria-label','式へのリンク');a.textContent='#';box.append(a);
  });
  if(window.renderMathInElement){
    window.renderMathInElement(document.body,{
      delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],
      throwOnError:false,strict:'ignore',trust:false,
      macros:{'\\Tr':'\\operatorname{Tr}','\\dd':'\\mathrm{d}'}
    });
  }
  if('IntersectionObserver' in window){
    const links=$$('.generated-toc a[data-target]');
    const observer=new IntersectionObserver(entries=>{
      const top=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(top)links.forEach(a=>a.classList.toggle('active',a.dataset.target===top.target.id));
    },{rootMargin:'-10% 0px -65% 0px',threshold:0});
    $$('.book-section h2').forEach(h=>observer.observe(h));
  }
  const field=$('#note-search');
  if(field){
    const list=$('#search-results'),status=$('#search-status');
    field.addEventListener('input',()=>{
      list.replaceChildren();const q=field.value.trim().normalize('NFKC').toLowerCase();
      if(!q){status.textContent='';return;}
      const terms=q.split(/\s+/);
      const hits=(window.RG_SEARCH||[]).filter(s=>terms.every(t=>(s.title+' '+s.text).normalize('NFKC').toLowerCase().includes(t)));
      status.textContent=`${hits.length}節が見つかりました`;
      hits.slice(0,30).forEach(s=>{
        const li=document.createElement('li'),a=document.createElement('a');a.href=s.href;a.textContent=s.chapter+' · '+s.title;li.append(a);
        const p=document.createElement('p');const low=s.text.normalize('NFKC').toLowerCase();const at=Math.max(0,low.indexOf(terms[0])-35);
        p.textContent=(at?'…':'')+s.text.slice(at,at+150)+'…';li.append(p);list.append(li);
      });
    });
  }
})();
