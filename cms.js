(async function(){var U=window.CMS.url,K=window.CMS.key;if(U.indexOf('YOUR_')==0)return;
var raw=/[?&]raw=1/.test(location.search),g=function(i){return document.getElementById(i)};
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var s=supabase.createClient(U,K),R=await Promise.all([s.from('posts').select('*').eq('published',true).order('created_at',{ascending:false}),s.from('pages').select('*').eq('published',true).order('sort'),s.from('content').select('*')]),C={};
(R[2].data||[]).forEach(function(x){C[x.key]=x.value});
var po=R[0].data||[];
if(po.length)P.blog='<div class="hero sm"><p class="pill">Learn book marketing</p><h1>The Author Marketing Library</h1><p class="sub">Free, practical lessons on Amazon SEO, listing design, Goodreads and launch strategy.</p></div><section><div class="wrap"><div class="grid3">'+po.map(function(x){return'<div class="card bc">'+(x.image_url?'<img src="'+e(x.image_url)+'" alt="">':'')+'<p class="ey">'+e(x.category)+'</p><h4>'+e(x.title)+'</h4><p>'+e(x.excerpt)+'</p><small>'+e(x.read_min)+' min read</small></div>'}).join('')+'</div></div></section>';
function blk(b){var bt=b.link?'<a class="btn" href="'+e(b.link)+'">'+e(b.label||'Learn more')+'</a>':'';
if(b.type=='hero')return'<div class="hero sm"><h1>'+e(b.title)+'</h1><p class="sub">'+e(b.body)+'</p>'+bt+'</div>';
if(b.type=='text')return'<section><div class="wrap"><h2>'+e(b.title)+'</h2><p class="mu">'+e(b.body).replace(/\n/g,'<br>')+'</p>'+bt+'</div></section>';
if(b.type=='cards')return'<section><div class="wrap"><h2>'+e(b.title)+'</h2><div class="grid3">'+String(b.body||'').split('\n').filter(Boolean).map(function(l){var a=l.split('|');return'<div class="card"><h4>'+e(a[0])+'</h4><p>'+e(a[1])+'</p></div>'}).join('')+'</div>'+bt+'</div></section>';
if(b.type=='image')return'<section><div class="wrap c"><h2>'+e(b.title)+'</h2><img src="'+e(b.image)+'" alt="" style="max-width:100%;border-radius:16px">'+bt+'</div></section>';
if(b.type=='button')return'<section><div class="wrap c">'+bt+'</div></section>';
return'<section><div class="wrap">'+(b.body||'')+'</div></section>'}
var nv=document.querySelector('header nav');
(R[1].data||[]).forEach(function(p){P[p.slug]='<div class="hero sm"><h1>'+e(p.title)+'</h1></div>'+(p.blocks||[]).map(blk).join('');
if(p.in_nav&&nv&&!nv.querySelector('[data-k="'+p.slug+'"]')){var a=document.createElement('a');a.dataset.k=p.slug;a.href='#'+p.slug;a.textContent=p.title;nv.insertBefore(a,nv.lastElementChild)}});
function bind(){}
function apply(){if(raw)return;document.querySelectorAll('#app,header,footer').forEach(function(rt){var w=document.createTreeWalker(rt,NodeFilter.SHOW_TEXT),n;while(n=w.nextNode()){var t=n.nodeValue.trim();if(t&&C['txt:'+t]!=null)n.nodeValue=n.nodeValue.replace(t,C['txt:'+t])}})}
function after(){apply();setTimeout(apply,450);bind()}
if(!raw){if(C['set:accent'])document.documentElement.style.setProperty('--o',C['set:accent']);
if(C['set:announcement']){var d=document.createElement('div');d.textContent=C['set:announcement'];d.style.cssText='position:relative;z-index:9;background:var(--o);color:#fff;text-align:center;padding:8px;font-size:13px';document.body.insertBefore(d,document.body.firstChild);document.querySelector('header').style.top='34px'}}
new MutationObserver(after).observe(g('app'),{childList:true});r();after();
})();
