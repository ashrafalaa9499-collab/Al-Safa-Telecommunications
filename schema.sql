-- الصفا للإتصالات — شغّل هذا الملف كاملاً في Supabase > SQL Editor
create table if not exists categories(id uuid primary key default gen_random_uuid(), name text not null, sort int default 0);
create table if not exists products(
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null, brand text, short_desc text, details text, specs text,
  images text[] default '{}', price numeric, show_price boolean default false,
  available boolean default true, featured boolean default false, is_new boolean default false,
  created_at timestamptz default now());
create table if not exists services(id uuid primary key default gen_random_uuid(), title text not null, description text, icon text default '📡', sort int default 0);
create table if not exists site_settings(key text primary key, value text);
create table if not exists social_links(id uuid primary key default gen_random_uuid(), platform text not null, url text not null, sort int default 0);
create table if not exists branches(id uuid primary key default gen_random_uuid(), name text, address text, lat numeric, lng numeric);
create table if not exists admin_users(user_id uuid primary key references auth.users(id) on delete cascade);

create or replace function is_admin() returns boolean language sql security definer set search_path=public stable
as $$ select exists(select 1 from admin_users where user_id=auth.uid()) $$;

do $$ declare t text; begin
  foreach t in array array['categories','products','services','site_settings','social_links','branches'] loop
    execute format('alter table %I enable row level security',t);
    execute format('drop policy if exists "read_%1$s" on %1$I',t);
    execute format('drop policy if exists "write_%1$s" on %1$I',t);
    execute format('create policy "read_%1$s" on %1$I for select using (true)',t);
    execute format('create policy "write_%1$s" on %1$I for all using (is_admin()) with check (is_admin())',t);
  end loop; end $$;
alter table admin_users enable row level security;
drop policy if exists "own_admin_row" on admin_users;
create policy "own_admin_row" on admin_users for select using (user_id=auth.uid());

insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict do nothing;
drop policy if exists "img_read" on storage.objects; drop policy if exists "img_write" on storage.objects;
create policy "img_read" on storage.objects for select using (bucket_id='product-images');
create policy "img_write" on storage.objects for all using (bucket_id='product-images' and is_admin()) with check (bucket_id='product-images' and is_admin());

-- بيانات أولية (قابلة للتعديل من لوحة التحكم)
insert into categories(name,sort) select * from (values ('الهواتف المحمولة',1),('إكسسوارات الموبايل',2),('شرائح الاتصال',3),('مستلزمات الاتصالات',4)) v where not exists(select 1 from categories);
insert into site_settings(key,value) values
('company_name','الصفا للإتصالات'),
('tagline','نقرّب المسافات، ونربطك بعالم لا حدود له.'),
('phone','+0985522947'),('whatsapp','963985522947'),
('address','أعزاز — شارع الهواتف — مقابل حاويات العيسى'),
('about','الصفا للإتصالات في مدينة أعزاز، نبيع الهواتف المحمولة والإكسسوارات ونقدّم خدمات الاتصالات وصيانة الهواتف.'),
('why','أسعار مناسبة|منتجات متنوعة من علامات تجارية مختلفة|صيانة موثوقة|تواصل سريع عبر واتساب'),
('map_lat',''),('map_lng',''),('map_query','أعزاز شارع الهواتف مقابل حاويات العيسى'),
('footer','© الصفا للإتصالات — جميع الحقوق محفوظة')
on conflict do nothing;
insert into services(title,description,icon,sort) select * from (values
('بيع الهواتف المحمولة','أحدث الهواتف بمختلف الفئات والعلامات التجارية.','📱',1),
('إكسسوارات الموبايل','سماعات وشواحن وكفرات وواقيات شاشة وغيرها.','🎧',2),
('شرائح الاتصال وخدمات الاتصالات','شرائح الاتصال وخدمات الاتصالات المتاحة لدينا.','📶',3),
('صيانة الهواتف','صيانة الهواتف المحمولة — تواصل معنا للاستفسار.','🛠️',4)) v where not exists(select 1 from services);
insert into social_links(platform,url,sort) select * from (values
('instagram','https://www.instagram.com/center_alsafaa_communications?rpxt=a292MHExejF3NHY3',1),
('tiktok','https://www.tiktok.com/@center_alsafaa?_r=1&_t=ZP-9BGBjuYLQpa',2)) v where not exists(select 1 from social_links);
-- بعد إنشاء مستخدم المسؤول من Authentication > Users شغّل:
-- insert into admin_users(user_id) select id from auth.users where email='EMAIL_HERE';
