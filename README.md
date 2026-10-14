<div dir="rtl">

# 🏢 5B Mall — نظام إدارة المجمعات التجارية

نظام ERP متكامل لإدارة المجمعات التجارية والعقارية، مبني بتقنيات الويب الحديثة دون الحاجة لأي خادم خلفي.

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/z.7.2011/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/zayed-almnaseer-460a50434/)
[![Portfolio](https://img.shields.io/badge/Portfolio-%23000000.svg?style=for-the-badge&logo=firefox&logoColor=white)](https://zayed-almnaseer.wasmer.app)

---

## ✨ المميزات الرئيسية

### 📋 إدارة العقود
- إضافة وتعديل وحذف عقود الإيجار بخطوات واضحة (4 خطوات)
- جدول عقود متكامل مع فلترة وترتيب وبحث لحظي
- عرض تفاصيل كاملة لكل عقد في نافذة منفصلة
- دعم رفع المرفقات (صور + PDF) لكل عقد

### 💰 الإدارة المالية
- حساب الإيجار والرسوم تلقائياً
- جدول دفعات تفصيلي لكل مستأجر
- نظام شيكات وكمبيالات متكامل
- تقارير مالية شاملة قابلة للتصدير

### 📊 التقارير والإحصائيات
- لوحة تحكم بمؤشرات الأداء الرئيسية (KPIs)
- رسوم بيانية تفاعلية
- تقارير العقود والخدمات والمالية
- تصدير التقارير بصيغتي PDF و Excel

### 🔧 إدارة الخدمات والصيانة
- قراءات عدادات الماء والكهرباء
- سجل صيانة كامل لجميع الوحدات
- إدارة الخدمات وأسعار الوحدات والتصنيفات

### 👥 نظام المستخدمين والصلاحيات
- أدوار متعددة (مدير، محاسب، موظف...)
- صلاحيات دقيقة لكل وظيفة
- إدارة المستخدمين من لوحة تحكم مخصصة

### 🏗️ إدارة الموقع والمباني
- هيكل هرمي: مجمع → مبنى → طابق → وحدة
- بيانات كاملة للموقع والمساحات
- كتاب تبليغ قابل للطباعة

### ⚙️ تجربة المستخدم
- واجهة عربية بالكامل (RTL)
- دعم الوضع الليلي والنهاري
- تنبيهات صوتية وبصرية (Toast)
- تطبيق PWA قابل للتثبيت على الجوال والحاسوب

---

## ⚠️ ملاحظة مهمة — Firebase غير مضمّن

> **هذا المستودع لا يحتوي على إعدادات Firebase.**
>
> ملف `js/firebase.js` الموجود هنا يحتوي على الهيكل فقط بدون بيانات الاتصال الحقيقية.
> البيانات الحساسة مثل `apiKey` و `projectId` و `authDomain` تم حذفها عمداً لأسباب أمنية.
>
> لتشغيل النظام كاملاً مع المزامنة، يجب عليك:
> 1. إنشاء مشروع Firebase خاص بك من [console.firebase.google.com](https://console.firebase.google.com)
> 2. استبدال بيانات الإعداد في `js/firebase.js` ببيانات مشروعك
> 3. تفعيل Firestore Database و Authentication من لوحة Firebase

---

## 🚀 التثبيت والتشغيل

### التشغيل المحلي (بدون Firebase)

```bash
# 1. حمّل أو انسخ المشروع
git clone https://github.com/YOUR_USERNAME/5bmall.git
cd 5bmall

# 2. افتح الملف الرئيسي مباشرة
# على Windows
start index.html

# على Mac
open index.html

# على Linux
xdg-open index.html
```

> **ملاحظة:** بعض المتصفحات تمنع تحميل الملفات المحلية. إذا واجهت مشكلة، استخدم Live Server.

### التشغيل عبر Live Server (موصى به)

```bash
# تأكد من تثبيت VS Code مع إضافة Live Server
# ثم افتح المجلد في VS Code وانقر على "Go Live"
```

أو استخدم Python:

```bash
# Python 3
python -m http.server 8080
# ثم افتح المتصفح على http://localhost:8080
```

### النشر على الإنترنت

يمكن رفع المشروع على أي استضافة تدعم الملفات الثابتة:

| المنصة | الخطوات |
|--------|---------|
| **GitHub Pages** | Settings → Pages → Deploy from branch `main` |
| **Netlify** | اسحب المجلد وأفلته على [netlify.com](https://netlify.com) |
| **Vercel** | `vercel deploy` بعد تثبيت Vercel CLI |
| **Wasmer** | رفع مباشر عبر لوحة التحكم |

---

## 📁 بنية الملفات

```
5bmall/
│
├── index.html                        ← نقطة الدخول الرئيسية
│
├── css/
│   ├── style.css                     ← نظام التصميم الرئيسي
│   └── extra.css                     ← تعديلات العلامة التجارية
│
├── js/
│   ├── firebase.js                   ← إعداد Firebase (يحتاج تعبئة)
│   ├── users.js                      ← نظام المستخدمين والصلاحيات
│   ├── login.js                      ← تسجيل الدخول وإدارة الجلسة
│   ├── contracts-data.js             ← تخزين العقود
│   ├── attachments.js                ← رفع الصور والـ PDF
│   ├── services.js                   ← الخدمات والأسعار
│   ├── meter-readings.js             ← قراءات العدادات
│   ├── fees-payments.js              ← الرسوم وجداول الدفع
│   ├── contract-modal.js             ← نموذج العقود
│   ├── detail-modal.js               ← نافذة تفاصيل العقد
│   ├── table.js                      ← الجداول والفلترة
│   ├── charts-dashboard.js           ← الرسوم البيانية ولوحة التحكم
│   ├── reports.js                    ← التقارير الشاملة
│   ├── export.js                     ← تصدير PDF و Excel
│   ├── admin-users.js                ← إدارة المستخدمين
│   ├── settings-toast.js             ← الإعدادات والتنبيهات
│   ├── init-locations.js             ← بيانات الموقع والطوابق
│   ├── filters.js                    ← الفلاتر والبحث
│   ├── navigation.js                 ← التنقل بين الصفحات
│   ├── maintenance.js                ← سجل الصيانة
│   ├── kambiyala.js                  ← نظام الكمبيالات
│   ├── tabligh.js                    ← كتاب التبليغ
│   └── erp-cheques.js               ← نظام ERP والشيكات
│
└── pages/
    ├── login-screen.html             ← شاشة الدخول
    ├── page-overview.html            ← لوحة التحكم
    ├── page-contracts.html           ← العقود
    ├── page-procedures.html          ← بيانات الموقع
    ├── page-reports.html             ← التقارير
    ├── page-services.html            ← الخدمات
    ├── page-settings.html            ← الإعدادات
    ├── page-admin.html               ← إدارة المستخدمين
    ├── page-maintenance-kambiyala.html ← الصيانة والكمبيالات
    ├── modal-contract-form.html      ← نموذج العقد (4 خطوات)
    └── modals-other.html             ← النوافذ المنبثقة
```

---

## 📊 إحصائيات المشروع

| المحتوى | الحجم |
|---------|-------|
| ملفات HTML | 11 ملف — ~2,400 سطر |
| ملفات JavaScript | 23 ملف — ~8,400 سطر |
| ملفات CSS | 2 ملف — ~1,500 سطر |
| **المجموع** | **42 ملف — ~12,300 سطر** |

---

## 📬 التواصل مع المطور

| القناة | الرابط |
|--------|--------|
| 📸 Instagram | [@z.7.2011](https://www.instagram.com/z.7.2011/) |
| 💼 LinkedIn | [Zayed Almnaseer](https://www.linkedin.com/in/zayed-almnaseer-460a50434/) |
| 🌐 Portfolio | [zayed-almnaseer.wasmer.app](https://zayed-almnaseer.wasmer.app) |

---

<div align="center">
صُنع بـ ❤️ بواسطة <a href="https://www.instagram.com/z.7.2011/">زايد المناصير</a>
</div>

</div>
