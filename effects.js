(function(){
var S=[["WHAT I DO","I make your book<br>one readers find first.",["Amazon page &amp; A+ content","Keywords, categories &amp; Goodreads","Ads that return, not just burn"]],
["MY PROCESS","Three steps from<br>invisible to unmissable.",["Tell me about your book","I fix what hides it from readers","You get found, bought and reviewed"]],
["WHY CHOOSE ME","An editor's eye.<br>A marketer's hustle.",["Direct 1:1 partnership","You keep 100% of your rights","Results tracked, not promised"]],
["RESULTS YOU CAN TRUST","Real books.<br>Real rank jumps.",["#1,015,254 to #160,872 in a day","4.9 average author rating","40+ genres served"]]];
var T=['WHAT I DO','MY PROCESS','WHY CHOOSE ME','RESULTS YOU CAN TRUST'],tm,idx=0;
function waveSVG(fill,flip){var c='M0,45 C240,5 480,85 720,45 C960,5 1200,85 1440,45 C1680,5 1920,85 2160,45 C2400,5 2640,85 2880,45';
var f=flip?c+' L2880,100 L0,100 Z':c+' L2880,0 L0,0 Z';
return '<svg viewBox="0 0 2880 100" preserveAspectRatio="none"><defs><linearGradient id="wg'+(flip?'b':'t')+'" x1="0" x2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#f97316"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="'+f+'" fill="var(--l,#fff)"/><path d="'+c+'" fill="none" stroke="url(#wg'+(flip?'b':'t')+')" stroke-width="3"/></svg>'}
function waves(){document.querySelectorAll('#app .hero,#app section.dk').forEach(function(el){if(el.dataset.w)return;el.dataset.w=1;el.style.position='relative';
if(!el.classList.contains('hero'))el.insertAdjacentHTML('afterbegin','<div class="wave t">'+waveSVG(0,0)+'</div>');
el.insertAdjacentHTML('beforeend','<div class="wave b">'+waveSVG(0,1)+'</div>')})}
function show(i){idx=(i+S.length)%S.length;document.querySelectorAll('.slide').forEach(function(s,k){s.classList.toggle('on',k==idx)});
document.querySelectorAll('.stabs button').forEach(function(s,k){s.classList.toggle('on',k==idx)});document.querySelectorAll('.sctl .dt').forEach(function(s,k){s.classList.toggle('on',k==idx)})}
function auto(){clearInterval(tm);tm=setInterval(function(){show(idx+1)},6000)}
function slider(){var h=document.querySelector('#app .hero:not(.sm)');if(!h||h.dataset.s||(location.hash&&location.hash!='#home'))return;if(h.querySelector('.portrait'))return;h.dataset.s=1;
var w=h.querySelector('.wrap');w.innerHTML='<div class="slides">'+S.map(function(s,k){return'<div class="slide'+(k?'':' on')+'"><p class="pill">'+s[0]+'</p><h1 class="l">'+s[1]+'</h1><ul class="chk">'+s[2].map(function(x){return'<li>'+x+'</li>'}).join('')+'</ul><a class="btn" href="#contact">Book a free discovery call &#8250;</a> <a class="btn gh" href="#services">See my services</a></div>'}).join('')+'</div><div class="stabs">'+T.map(function(t,k){return'<button class="'+(k?'':'on')+'" data-i="'+k+'">'+t+'</button>'}).join('')+'</div><div class="sctl"><button class="ar" data-d="-1" aria-label="Previous">&#8249;</button>'+S.map(function(s,k){return'<span class="dt'+(k?'':' on')+'" data-i="'+k+'"></span>'}).join('')+'<button class="ar" data-d="1" aria-label="Next">&#8250;</button></div>';
h.insertAdjacentHTML('beforeend','<div class="fl" style="right:12%;top:150px">&#9633;</div><div class="fl" style="right:22%;top:300px;animation-delay:1s">&#9734;</div><div class="fl" style="right:8%;top:340px;animation-delay:2s">&#9825;</div><div class="fl" style="right:30%;top:190px;animation-delay:3s">&#10077;</div>');
w.onclick=function(e){var t=e.target.closest('[data-i],[data-d]');if(!t)return;show(t.dataset.i!=null?+t.dataset.i:idx+ +t.dataset.d);auto()};auto()}
function deco(){waves();slider()}
new MutationObserver(function(){setTimeout(deco,0)}).observe(document.getElementById('app'),{childList:true});deco();
var c=document.getElementById('fx'),x=c.getContext('2d'),W,H,D=[],col=['#ffffff','#ffb27a','#7ee8ff','#ff9ec7','#ffd36b','#b69cff'];
function rs(){var d=window.devicePixelRatio||1;W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0)}rs();addEventListener('resize',rs);
for(var i=0;i<85;i++)D.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+1,v:Math.random()*.7+.25,a:Math.random()*6.28,s:Math.random()*.02+.005,c:col[i%col.length]});
if(matchMedia('(prefers-reduced-motion:reduce)').matches){return}
(function f(){x.clearRect(0,0,W,H);D.forEach(function(d){d.y+=d.v;d.a+=d.s;d.x+=Math.sin(d.a)*.4;if(d.y>H+5){d.y=-5;d.x=Math.random()*W}x.globalAlpha=.8;x.fillStyle=d.c;x.beginPath();x.arc(d.x,d.y,d.r,0,6.28);x.fill()});requestAnimationFrame(f)})()
})();
