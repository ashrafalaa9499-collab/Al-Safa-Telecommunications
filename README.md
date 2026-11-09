# موقع الصفا للإتصالات

موقع ثابت (HTML/CSS/JS) + Supabase (قاعدة بيانات PostgreSQL، مصادقة، تخزين صور). لا يحتاج خادماً، ويُنشر مجاناً.

## 1) إنشاء قاعدة البيانات
1. أنشئ حساباً مجانياً على supabase.com ثم New project.
2. من SQL Editor الصق محتوى `supabase/schema.sql` وشغّله (ينشئ الجداول وسياسات RLS ومخزن الصور وبيانات أولية للتصنيفات والخدمات والإعدادات).
3. من Project Settings > API انسخ **Project URL** و**anon public key**.

## 2) حساب المسؤول
1. Authentication > Users > Add user: أدخل بريدك وكلمة مرور قوية (فعّل Auto Confirm).
2. في SQL Editor شغّل (بعد وضع بريدك):
   `insert into admin_users(user_id) select id from auth.users where email='بريدك';`
3. ادخل على `/admin`. أي حساب غير مضاف في admin_users لا يستطيع التعديل حتى لو سجّل دخولاً.
4. غيّر كلمة المرور لاحقاً من تبويب «كلمة المرور». وفي Authentication > Providers عطّل التسجيل الذاتي (Allow new users to sign up).

## 3) الربط والتشغيل المحلي
عدّل `js/config.js` بالرابط والمفتاح العام فقط (لا تضع service_role أبداً)، ثم شغّل `python3 -m http.server 8000` وافتح http://localhost:8000

## 4) النشر المجاني (Netlify مثالاً)
1. ارفع المجلد إلى مستودع GitHub، ثم Netlify > Add new site > Import from Git.
2. Site settings > Environment variables: أضف `SUPABASE_URL` و`SUPABASE_ANON_KEY` (انظر `.env.example`). يولّد `build.sh` ملف config.js تلقائياً.
3. أو اسحب المجلد مباشرة إلى Netlify Drop بعد ضبط config.js.
4. ستحصل على رابط مثل `اسم-موقعك.netlify.app`، ويمكنك تغيير الاسم من Site settings > Change site name. النطاق المخصص (مثل .com) مدفوع عادةً من المسجّل؛ الرابط الفرعي المجاني يكفي. بدائل: Vercel أو Cloudflare Pages (مجلد النشر: الجذر، بدون framework، أمر البناء `sh build.sh`).
5. في Supabase > Authentication > URL Configuration أضف رابط موقعك.

## 5) رفع صور المنتجات
من `/admin` > المنتجات > إضافة: اختر صوراً (حتى 5MB لكل صورة)، وتُخزَّن في bucket اسمه product-images.

## ملاحظات
- كل ما في الموقع من نصوص وأرقام وروابط تتعدل من «إعدادات الموقع» و«روابط التواصل». رقم الهاتف محفوظ كما أُدخل (+0985522947) فتحقق من صيغته الدولية.
- للخريطة الدقيقة: ضع خط العرض والطول من إعدادات الموقع (من Google Maps: كليك يمين على المحل ثم انسخ الإحداثيات)، وإلا يظهر زر يفتح البحث في Google Maps.
- الأمان: القراءة عامة للزوار، والكتابة محصورة بـ is_admin() عبر RLS. الحماية من التخمين: حدّ في الواجهة (5 محاولات/دقيقة) بالإضافة إلى حدود Supabase Auth الافتراضية.
