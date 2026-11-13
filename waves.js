(function(){
var P=700,N=0,PH=['AMAZON KDP MARKETING','GOODREADS OPTIMIZATION','A+ CONTENT - GUARANTEED','LISTING COPYWRITING','AUTHOR VISIBILITY','BESTSELLER PUSHES'],SEP='\u00A0\u00A0\u2022\u00A0\u00A0';
function build(w){w.dataset.v2=1;
var bot=w.classList.contains('b'),hero=w.parentElement,home=bot&&hero.classList.contains('hero')&&!hero.classList.contains('sm'),H=home?130:90,c=home?80:40.5,a=36,
W=Math.max(innerWidth,1000),half=Math.ceil(W/P)*P,tot=half*2,x,d='M0,'+c;
for(x=0;x<tot;x+=P)d+=' C'+(x+P/3)+','+(c-a)+' '+(x+2*P/3)+','+(c+a)+' '+(x+P)+','+c;
var f=d+(bot?' L'+tot+','+H+' L0,'+H+' Z':' L'+tot+',0 L0,0 Z'),id='wq'+(++N);
w.style.height=H+'px';
var tx=home?[25,75].map(function(o){return'<text class="wt" text-anchor="middle" fill="#fff" font-size="15" font-weight="600" letter-spacing="2.5" dy="-11" style="font-family:Inter,system-ui,sans-serif"><textPath href="#'+id+'p" startOffset="'+o+'%"></textPath></text>'}).join(''):'';
w.innerHTML='<svg width="'+tot+'" height="'+H+'" viewBox="0 0 '+tot+' '+H+'"><defs><linearGradient id="'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#f97316"/><stop offset="1" stop-color="#7c3aed"/></linearGradient><path id="'+id+'p" d="'+d+'"/></defs><path d="'+f+'" fill="var(--l,#fff)"/><path d="'+d+'" fill="none" stroke="url(#'+id+')" stroke-width="3"/>'+tx+'</svg>';
if(home)(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){fill(w,id)})}
function fill(w,id){var ts=w.querySelectorAll('text.wt');if(!ts.length)return;var L=document.getElementById(id+'p').getTotalLength(),goal=L/2-48,s='',k=0,t0=ts[0],tp=t0.firstChild;
tp.textContent=SEP;while(true){var n=s+PH[k%PH.length]+SEP;tp.textContent=n;if(t0.getComputedTextLength()>goal)break;s=n;k++;if(k>200)break}
tp.textContent=s;var len=t0.getComputedTextLength(),ls=2.5+(goal-len)/Math.max(s.length,1);
ts.forEach(function(t){t.firstChild.textContent=s;t.setAttribute('letter-spacing',Math.max(1,Math.min(ls,8)).toFixed(2))})}
function fix(){document.querySelectorAll('.wave:not([data-v2])').forEach(build)}
function go(){[0,90,700].forEach(function(t){setTimeout(fix,t)})}
new MutationObserver(go).observe(document.getElementById('app'),{childList:true});go();
var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){document.querySelectorAll('.wave').forEach(build)},300)});
})();
