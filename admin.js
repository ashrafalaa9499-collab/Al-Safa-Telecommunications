const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=(t,e)=>{const x=$('#toast');x.textContent=t;x.className=e?'e':'';x.style.display='block';setTimeout(()=>x.style.display='none',3500)};
const app=$('#app');let sb,tab='stats',fails=0,lockUntil=0;
const KEYS={company_name:'اسم الشركة',tagline:'العبارة التسويقية',phone:'رقم الهاتف',whatsapp:'رقم واتساب (دولي بدون +)',address:'العنوان',about:'من نحن',why:'لماذا نحن (افصل بين البنود بـ |)',map_lat:'خط العرض (اختياري)',map_lng:'خط الطول (اختياري)',map_query:'نص البحث في الخريطة',footer:'نص الفوتر'};
const TABS={stats:'الإحصائيات',products:'المنتجات',services:'الخدمات',categories:'التصنيفات',settings:'إعدادات الموقع',social:'روابط التواصل',pass:'كلمة المرور'};
const ok=r=>{if(r.error)throw r.error;return r.data};
async function start(){
 if(!window.SB_CONFIG||SB_CONFIG.url.includes('YOUR-'))return app.innerHTML='<div class="login err">لم يتم ضبط Supabase في js/config.js</div>';
 sb=supabase.createClient(SB_CONFIG.url,SB_CONFIG.key);
 const {data:{session}}=await sb.auth.getSession();session?gate():login()}
function login(m){app.innerHTML=`<form class="login" id="lf"><h2>🔐 دخول المسؤول</h2>${m?`<p class="err">${m}</p>`:''}<label>البريد الإلكتروني</label><input id="em" type="email" required autocomplete="username"><label>كلمة المرور</label><input id="pw" type="password" required autocomplete="current-password"><br><br><button class="btn p" style="width:100%">دخول</button></form>`;
 $('#lf').onsubmit=async e=>{e.preventDefault();if(Date.now()<lockUntil)return toast('محاولات كثيرة، انتظر دقيقة',1);
  const {error}=await sb.auth.signInWithPassword({email:$('#em').value,password:$('#pw').value});
  if(error){if(++fails>=5){lockUntil=Date.now()+60000;fails=0}return login('بيانات الدخول غير صحيحة')}fails=0;gate()}}
async function gate(){const {data}=await sb.from('admin_users').select('user_id').maybeSingle();
 if(!data){await sb.auth.signOut();return login('هذا الحساب غير مصرّح له بالإدارة')}shell()}
function shell(){app.innerHTML=`<div class="adm"><aside class="side"><h3>📡 الإدارة</h3>${Object.entries(TABS).map(([k,v])=>`<button data-t="${k}" class="${k==tab?'on':''}">${v}</button>`).join('')}<button id="out">تسجيل الخروج</button><a href="/" class="btn" style="margin-top:10px;display:block;text-align:center">الموقع ↗</a></aside><div class="main" id="mn"></div></div>`;
 document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;shell()});$('#out').onclick=async()=>{await sb.auth.signOut();login()};render()}
async function render(){const m=$('#mn');m.innerHTML='<div class="msg">جارٍ التحميل…</div>';
 try{await ({stats,products,services,categories,settings,social,pass})[tab](m)}catch(e){m.innerHTML=`<div class="msg err">خطأ: ${esc(e.message)}</div>`}}
async function stats(m){const [p,c,s]=await Promise.all([sb.from('products').select('available'),sb.from('categories').select('id'),sb.from('services').select('id')]).then(a=>a.map(ok));
 const a=p.filter(x=>x.available).length;m.innerHTML=`<h2>الإحصائيات</h2><div class="stats">${[['إجمالي المنتجات',p.length],['التصنيفات',c.length],['الخدمات',s.length],['المتوفرة',a],['غير المتوفرة',p.length-a]].map(([k,v])=>`<div class="stat"><b>${v}</b>${k}</div>`).join('')}</div>`}
function list(m,title,rows,cols,onEdit,onDel,onNew){m.innerHTML=`<h2>${title}</h2><button class="btn p" id="nw">+ إضافة</button><div style="overflow:auto"><table><tr>${cols.map(c=>`<th>${c[0]}</th>`).join('')}<th></th></tr>${rows.map(r=>`<tr>${cols.map(c=>`<td>${esc(c[1](r))}</td>`).join('')}<td style="white-space:nowrap"><button class="btn" data-e="${r.id}">تعديل</button> <button class="btn d" data-d="${r.id}">حذف</button></td></tr>`).join('')}</table></div>`;
 $('#nw').onclick=onNew;m.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>onEdit(rows.find(r=>r.id==b.dataset.e)));
 m.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(!confirm('تأكيد الحذف؟'))return;try{await onDel(rows.find(r=>r.id==b.dataset.d));toast('تم الحذف');render()}catch(e){toast(e.message,1)}})}
async function products(m){const cats=ok(await sb.from('categories').select('*').order('sort')),rows=ok(await sb.from('products').select('*').order('created_at',{ascending:false}));
 const edit=(p={})=>{m.innerHTML=`<h2>${p.id?'تعديل':'إضافة'} منتج</h2><form id="f"><label>الاسم</label><input name="name" required value="${esc(p.name)}"><div class="row"><div><label>التصنيف</label><select name="category_id">${cats.map(c=>`<option value="${c.id}" ${c.id==p.category_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div><label>العلامة التجارية</label><input name="brand" value="${esc(p.brand)}"></div></div>
 <label>وصف مختصر</label><input name="short_desc" value="${esc(p.short_desc)}"><label>التفاصيل الكاملة</label><textarea name="details" rows="4">${esc(p.details)}</textarea><label>المواصفات (سطر لكل مواصفة)</label><textarea name="specs" rows="4">${esc(p.specs)}</textarea>
 <div class="row"><div><label>السعر (اختياري)</label><input name="price" type="number" step="any" value="${p.price??''}"></div><div><label>الصور (يمكن اختيار عدة صور)</label><input id="up" type="file" accept="image/*" multiple></div></div>
 <div id="imgs">${(p.images||[]).map(u=>`<span class="chk"><img src="${esc(u)}" width="60" alt=""> <button type="button" class="btn d" data-r="${esc(u)}">✕</button></span>`).join('')}</div><br>
 ${[['available','متوفر'],['featured','مميز'],['is_new','جديد'],['show_price','إظهار السعر']].map(([k,v])=>`<label class="chk"><input type="checkbox" name="${k}" ${(p.id?p[k]:k=='available')?'checked':''}> ${v}</label>`).join('')}<br><br><button class="btn p">حفظ</button> <button type="button" class="btn" id="cn">إلغاء</button></form>`;
 let imgs=[...(p.images||[])];$('#cn').onclick=render;m.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{imgs=imgs.filter(u=>u!=b.dataset.r);b.parentElement.remove()});
 $('#f').onsubmit=async e=>{e.preventDefault();const f=e.target,btn=f.querySelector('.p');btn.disabled=true;try{
  for(const file of $('#up').files){if(file.size>5e6)throw Error('الصورة أكبر من 5MB');const path=`${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
   const u=await sb.storage.from('product-images').upload(path,file);if(u.error)throw u.error;imgs.push(sb.storage.from('product-images').getPublicUrl(path).data.publicUrl)}
  const d={name:f.name.value.trim(),category_id:f.category_id.value||null,brand:f.brand.value.trim()||null,short_desc:f.short_desc.value,details:f.details.value,specs:f.specs.value,price:f.price.value===''?null:+f.price.value,images:imgs,available:f.available.checked,featured:f.featured.checked,is_new:f.is_new.checked,show_price:f.show_price.checked};
  ok(await (p.id?sb.from('products').update(d).eq('id',p.id):sb.from('products').insert(d)));toast('تم الحفظ');render()}catch(er){toast(er.message,1);btn.disabled=false}}};
 list(m,'المنتجات',rows,[['الاسم',r=>r.name],['العلامة',r=>r.brand||'-'],['التوفر',r=>r.available?'متوفر':'غير متوفر']],edit,async r=>ok(await sb.from('products').delete().eq('id',r.id)),()=>edit())}
function simple(table,title,fields,cols){return async m=>{const rows=ok(await sb.from(table).select('*').order('sort'));
 const edit=(o={})=>{m.innerHTML=`<h2>${o.id?'تعديل':'إضافة'} ${title}</h2><form id="f">${fields.map(([k,l,t])=>`<label>${l}</label>${t=='area'?`<textarea name="${k}" rows="3">${esc(o[k])}</textarea>`:`<input name="${k}" type="${t||'text'}" value="${esc(o[k]??(k=='icon'?'📡':t=='number'?0:''))}" required>`}`).join('')}<br><br><button class="btn p">حفظ</button> <button type="button" class="btn" id="cn">إلغاء</button></form>`;$('#cn').onclick=render;
  $('#f').onsubmit=async e=>{e.preventDefault();const d={};fields.forEach(([k,,t])=>d[k]=t=='number'?+e.target[k].value:e.target[k].value);
   try{ok(await (o.id?sb.from(table).update(d).eq('id',o.id):sb.from(table).insert(d)));toast('تم الحفظ');render()}catch(er){toast(er.message,1)}}};
 list(m,title,rows,cols,edit,async r=>ok(await sb.from(table).delete().eq('id',r.id)),()=>edit())}}
const services=simple('services','الخدمات',[['title','العنوان'],['icon','أيقونة (إيموجي)'],['description','الوصف','area'],['sort','الترتيب','number']],[['العنوان',r=>r.title],['الترتيب',r=>r.sort]]);
const categories=simple('categories','التصنيفات',[['name','الاسم'],['sort','الترتيب','number']],[['الاسم',r=>r.name]]);
const social=simple('social_links','رابط',[['platform','المنصة (instagram / tiktok / facebook)'],['url','الرابط','url'],['sort','الترتيب','number']],[['المنصة',r=>r.platform],['الرابط',r=>r.url]]);
async function settings(m){const S={};ok(await sb.from('site_settings').select('*')).forEach(r=>S[r.key]=r.value);
 m.innerHTML=`<h2>إعدادات الموقع</h2><form id="f">${Object.entries(KEYS).map(([k,l])=>`<label>${l}</label><textarea name="${k}" rows="${['about','why'].includes(k)?3:1}">${esc(S[k])}</textarea>`).join('')}<br><button class="btn p">حفظ</button></form>`;
 $('#f').onsubmit=async e=>{e.preventDefault();try{ok(await sb.from('site_settings').upsert(Object.keys(KEYS).map(k=>({key:k,value:e.target[k].value.trim()}))));toast('تم الحفظ')}catch(er){toast(er.message,1)}}}
async function pass(m){m.innerHTML=`<h2>تغيير كلمة المرور</h2><form id="f"><label>كلمة المرور الجديدة (8 أحرف على الأقل)</label><input type="password" minlength="8" required id="np" autocomplete="new-password"><br><br><button class="btn p">تغيير</button></form>`;
 $('#f').onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.updateUser({password:$('#np').value});error?toast(error.message,1):(toast('تم التغيير'),e.target.reset())}}
start();
