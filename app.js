const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={},P=[],C=[],sb;
const wa=(t='')=>`https://wa.me/${(S.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(t)}`;
const av=p=>`<span class="tag ${p.available?'':'x'}">${p.available?'متوفر':'غير متوفر'}</span>`;
function card(p){const img=p.images?.[0];return `<article class="card"><img loading="lazy" alt="${esc(p.name)}" src="${esc(img||'/favicon.svg')}"><div class="b">${p.is_new?'<span class="tag n">جديد</span>':''}${av(p)}<h3>${esc(p.name)}</h3><p>${esc(p.short_desc)}</p><div class="btns"><button class="btn p" onclick="openM('${p.id}')">عرض التفاصيل</button><a class="btn wa" target="_blank" rel="noopener" href="${wa('استفسار عن: '+p.name)}">واتساب</a></div></div></article>`}
function openM(id){const p=P.find(x=>x.id==id),c=C.find(x=>x.id==p.category_id),im=p.images||[];
$('#mb').innerHTML=`<h2>${esc(p.name)}</h2>${im.length?`<img class="big" id="bg" alt="" src="${esc(im[0])}"><div class="thumbs">${im.map(u=>`<img alt="" src="${esc(u)}" onclick="bg.src=this.src">`).join('')}</div>`:''}
<p>${c?`<span class="tag">${esc(c.name)}</span>`:''}${p.brand?`<span class="tag">${esc(p.brand)}</span>`:''}${av(p)}</p>
${p.show_price&&p.price!=null?`<h3>السعر: ${esc(p.price)}</h3>`:''}<p>${esc(p.details||p.short_desc).replace(/\n/g,'<br>')}</p>${p.specs?`<h3>المواصفات</h3><pre class="sp">${esc(p.specs)}</pre>`:''}
<a class="btn wa" target="_blank" rel="noopener" href="${wa('استفسار عن: '+p.name)}">استفسر عبر واتساب</a>`;$('#m').classList.add('o')}
function closeM(){$('#m').classList.remove('o')}
addEventListener('keydown',e=>e.key=='Escape'&&closeM());$('#m').addEventListener('click',e=>e.target.id=='m'&&closeM());
function filt(){const q=$('#q').value.trim().toLowerCase(),c=$('#fc').value,b=$('#fb').value;
$('#all').innerHTML=P.filter(p=>(!c||p.category_id==c)&&(!b||p.brand==b)&&(!q||[p.name,p.brand,p.short_desc].join(' ').toLowerCase().includes(q))).map(card).join('')||'<div class="msg">لا توجد منتجات مطابقة.</div>'}
const sec=(id,l,e)=>$(id).innerHTML=l.length?l.map(card).join(''):`<div class="msg">${e}</div>`;
async function init(){
 try{if(!window.SB_CONFIG||SB_CONFIG.url.includes('YOUR-'))throw Error('لم يتم ضبط Supabase في js/config.js');
 sb=supabase.createClient(SB_CONFIG.url,SB_CONFIG.key);
 const q=(t,o,a=true)=>sb.from(t).select('*').order(o,{ascending:a});
 const [s,c,p,v,l]=await Promise.all([q('site_settings','key'),q('categories','sort'),q('products','created_at',false),q('services','sort'),q('social_links','sort')]);
 for(const r of [s,c,p,v,l])if(r.error)throw r.error;
 s.data.forEach(r=>S[r.key]=r.value);C=c.data;P=p.data;
 document.querySelectorAll('[data-s]').forEach(e=>e.textContent=S[e.dataset.s]||'');
 document.querySelectorAll('[data-wa]').forEach(e=>e.href=wa('مرحباً، أريد الاستفسار'));
 document.querySelectorAll('[data-tel]').forEach(e=>e.href='tel:'+(S.phone||'').replace(/[^\d+]/g,''));
 const ll=S.map_lat&&S.map_lng,mq=ll?`${S.map_lat},${S.map_lng}`:S.map_query||S.address;
 document.querySelectorAll('[data-map]').forEach(e=>e.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mq));
 if(ll)$('#map').innerHTML=`<iframe loading="lazy" title="الموقع على الخريطة" src="https://maps.google.com/maps?q=${encodeURIComponent(mq)}&z=16&output=embed"></iframe>`;
 $('#why').innerHTML=(S.why||'').split('|').filter(Boolean).map(x=>`<li>✔ ${esc(x)}</li>`).join('');
 $('#soc').innerHTML=l.data.map(x=>`<a class="btn" target="_blank" rel="noopener" href="${esc(x.url)}">${esc({instagram:'إنستغرام',tiktok:'تيك توك',facebook:'فيسبوك'}[x.platform]||x.platform)}</a>`).join('');
 $('#svc').innerHTML=v.data.map(x=>`<div class="card svc"><div class="ic">${esc(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div>`).join('')||'<div class="msg">لا توجد خدمات.</div>';
 document.title=(S.company_name||'')+' | نقرّب المسافات';
 $('#fc').innerHTML+=C.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
 $('#fb').innerHTML+=[...new Set(P.map(x=>x.brand).filter(Boolean))].map(b=>`<option>${esc(b)}</option>`).join('');
 sec('#feat',P.filter(x=>x.featured).slice(0,8),'لم تُضف منتجات مميزة بعد.');sec('#new',P.filter(x=>x.is_new).slice(0,8),'لم تُضف منتجات جديدة بعد.');filt();
 ['#q','#fc','#fb'].forEach(i=>$(i).addEventListener('input',filt));
 }catch(e){console.error(e);document.querySelectorAll('.grid').forEach(g=>g.innerHTML=`<div class="msg err">تعذّر تحميل البيانات: ${esc(e.message||e)}</div>`)}}
init();
