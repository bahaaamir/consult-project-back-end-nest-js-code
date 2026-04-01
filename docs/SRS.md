# Software Requirements Specification (SRS)
## Consulting OS — منصة إدارة مكاتب الاستشارات

**Version:** 1.0
**Date:** 2026-03-13
**Status:** Draft
**Team:** 3 Developers
**Duration:** 3 Months

---

## 1. مقدمة

### 1.1 الغرض
تحدد هذه الوثيقة المتطلبات البرمجية الكاملة لمنصة Consulting OS بمستوى تفصيل كافٍ لبدء التطوير مباشرة، وتشمل المتطلبات الوظيفية وغير الوظيفية ومعايير القبول لكل Feature.

### 1.2 التعريفات والمصطلحات

| المصطلح | التعريف |
|---|---|
| Tenant | مكتب استشارات مستقل مشترك في المنصة |
| office_id | المعرف الفريد لكل Tenant يُرفق بكل Request |
| JWT | JSON Web Token لتأمين الجلسات |
| TOTP | Time-based One-Time Password للـ MFA |
| RLS | Row-Level Security لعزل بيانات كل Tenant |
| RBAC | Role-Based Access Control لإدارة الصلاحيات |
| Webhook | HTTP Callback من Paymob عند اكتمال الدفع |
| Soft Delete | حذف منطقي بـ deleted_at بدل الحذف الفعلي |

### 1.3 المراجع
- BRS v1.0 — Business Requirements Specification
- BAD v1.0 — Business Architecture Document
- SAD v1.0 — System Analysis Document

---

## 2. وصف النظام العام

### 2.1 منظور المنتج
منصة ويب SaaS متعددة المستأجرين تعمل على المتصفح وتتكون من:
- **Admin Portal** — واجهة المكتب وموظفيه
- **Client Portal** — واجهة العملاء وموظفيهم
- **Super Admin Panel** — واجهة إدارة المنصة

### 2.2 وظائف المنتج الرئيسية
1. إدارة المشاريع والمهام بنظام Kanban
2. بوابة شفافة للعملاء لمتابعة مشاريعهم
3. إصدار الفواتير والدفع الإلكتروني
4. إدارة الفريق والصلاحيات
5. إشعارات فورية وسجل أنشطة
6. لوحة تحكم مركزية للـ Super Admin

### 2.3 المستخدمون وخصائصهم

| المستخدم | المهارة التقنية | الاستخدام اليومي |
|---|---|---|
| Super Admin | عالية | إدارة المنصة والمكاتب |
| Owner | متوسطة | إدارة المكتب والمالية |
| Manager | متوسطة | إدارة المشاريع والفريق |
| Employee | منخفضة-متوسطة | تنفيذ المهام |
| Client Owner | منخفضة | متابعة المشاريع والدفع |
| Client Employee | منخفضة | متابعة المشاريع فقط |

---

## 3. المتطلبات الوظيفية التفصيلية

---

### 3.1 وحدة المصادقة والأمان (Auth Module)

#### SRS-AUTH-01: تسجيل الدخول
**الوصف:** يتمكن المستخدم من تسجيل الدخول بالإيميل وكلمة المرور.

**المتطلبات:**
- يقبل النظام الإيميل وكلمة المرور فقط في الـ Request Body
- يتحقق من الإيميل بصيغة RFC 5322
- يقارن كلمة المرور بـ bcrypt (cost factor = 12)
- عند نجاح التحقق يصدر JWT (مدة صلاحية 15 دقيقة) وRefresh Token (7 أيام) في HttpOnly Cookie
- يُسجِّل تاريخ آخر تسجيل دخول

**معايير القبول:**
- ✅ بيانات صحيحة → 200 مع JWT
- ✅ إيميل غير موجود → 401 برسالة "بيانات غير صحيحة"
- ✅ كلمة مرور خاطئة → 401 برسالة موحدة (لا تُفصح عن السبب)
- ✅ بعد 5 محاولات فاشلة → 429 وقفل الحساب 15 دقيقة (مُخزَّن في Redis)
- ✅ حساب موقوف → 403 برسالة "الحساب موقوف"

---

#### SRS-AUTH-02: المصادقة الثنائية (MFA)
**الوصف:** بعد نجاح تسجيل الدخول، إذا كان MFA مفعلاً يطلب النظام TOTP Code.

**المتطلبات:**
- استخدام مكتبة otplib لتوليد والتحقق من TOTP
- الـ Secret يُخزَّن مشفراً في قاعدة البيانات (AES-256)
- يقبل النظام الكود الحالي والكود السابق (30 ثانية tolerance)
- الكود يُستخدَم مرة واحدة فقط (يُخزَّن في Redis لمدة دقيقة)
- QR Code يُنشأ عند التفعيل الأول باستخدام otpauth URI

**معايير القبول:**
- ✅ كود صحيح → JWT كامل الصلاحيات
- ✅ كود خاطئ → 401
- ✅ كود منتهي الصلاحية → 401
- ✅ إعادة استخدام كود → 401

---

#### SRS-AUTH-03: تجديد الـ Token
**الوصف:** تجديد JWT منتهي الصلاحية باستخدام Refresh Token.

**المتطلبات:**
- Refresh Token يُرسَل تلقائياً من HttpOnly Cookie
- عند كل تجديد يُصدَر Refresh Token جديد ويُلغى القديم (Rotation)
- الـ Refresh Token المُلغى يُحفَظ في Redis Blacklist

**معايير القبول:**
- ✅ Refresh Token صالح → JWT جديد + Refresh Token جديد
- ✅ Refresh Token منتهي → 401
- ✅ Refresh Token مُلغى → 401

---

#### SRS-AUTH-04: Tenant Isolation
**الوصف:** كل Request يحمل office_id المستخدم ويُطبَّق على كل قاعدة البيانات.

**المتطلبات:**
- TenantGuard يستخرج office_id من JWT ويضعه في Request Context
- يُضبَط current_setting('app.current_office_id') في PostgreSQL لكل connection
- RLS Policy تفلتر تلقائياً على office_id
- أي محاولة للوصول لـ office_id مختلف → 403

**معايير القبول:**
- ✅ مستخدم مكتب A لا يرى بيانات مكتب B في أي حال
- ✅ تسريب office_id في الـ URL لا يخترق العزل

---

### 3.2 وحدة المشاريع (Projects Module)

#### SRS-PROJ-01: إنشاء مشروع
**الوصف:** Owner أو Manager ينشئ مشروعاً جديداً.

**المتطلبات:**
- الحقول المطلوبة: name (max 255)، client_id، start_date
- الحقول الاختيارية: description، end_date، budget
- يتحقق من أن client_id ينتمي لنفس المكتب
- يتحقق من حد الباقة (عدد المشاريع)
- يُنشئ Activity Log تلقائياً "تم إنشاء المشروع"
- يُرسَل إشعار للعميل عند الإنشاء

**معايير القبول:**
- ✅ بيانات صحيحة → 201 مع بيانات المشروع
- ✅ client_id لمكتب آخر → 403
- ✅ تجاوز حد الباقة → 402 مع رسالة "يرجى ترقية الباقة"
- ✅ name فارغ → 400 مع تفاصيل الخطأ

---

#### SRS-PROJ-02: عرض قائمة المشاريع
**الوصف:** عرض مشاريع المكتب مع إمكانية الفلترة والترتيب.

**المتطلبات:**
- Pagination: page و limit (افتراضي 20)
- فلترة بـ: status، client_id، date range
- ترتيب بـ: created_at، name، end_date
- البحث النصي في name و description
- Employee يرى فقط المشاريع المعين عليها

**Response يشمل:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

#### SRS-PROJ-03: تحديث تقدم المشروع
**الوصف:** نسبة التقدم تُحسَب تلقائياً من المهام المكتملة.

**المتطلبات:**
- عند تغيير حالة أي مهمة يُعاد حساب progress للمشروع
- المعادلة: (عدد المهام بحالة 'done' / إجمالي المهام) × 100
- إذا لا توجد مهام → progress = 0
- يُحدَّث progress في جدول projects تلقائياً (Database Trigger أو Service Event)

---

### 3.3 وحدة المهام (Tasks Module)

#### SRS-TASK-01: إنشاء مهمة
**الوصف:** Manager أو Owner ينشئ مهمة داخل مرحلة.

**المتطلبات:**
- الحقول المطلوبة: title، milestone_id
- الحقول الاختيارية: description، assigned_to، due_date، priority، estimated_hours
- يتحقق من أن milestone_id ينتمي لمشروع في نفس المكتب
- يتحقق من أن assigned_to موظف في نفس المكتب
- يُرسَل إشعار للموظف المعين

**معايير القبول:**
- ✅ بيانات صحيحة → 201
- ✅ assigned_to من مكتب آخر → 403
- ✅ milestone_id غير موجود → 404

---

#### SRS-TASK-02: تحديث حالة المهمة (Kanban)
**الوصف:** تغيير حالة المهمة بين الأعمدة الأربعة.

**المتطلبات:**
- الحالات المسموحة: todo → in_progress → review → done
- مسموح بالرجوع لأي حالة سابقة
- عند التحديث يُسجَّل في activity_logs: من/إلى/الوقت/المستخدم
- يُحدَّث project.progress تلقائياً
- يُرسَل إشعار Real-time لـ Manager والعميل عند الوصول لـ done

**معايير القبول:**
- ✅ Employee يُحدِّث مهمة معينة له → 200
- ✅ Employee يُحدِّث مهمة ليست معينة له → 403
- ✅ حالة غير موجودة → 400

---

#### SRS-TASK-03: ترتيب المهام في Kanban
**الوصف:** إمكانية إعادة ترتيب المهام داخل العمود بـ Drag & Drop.

**المتطلبات:**
- كل مهمة عندها order_index
- Endpoint مخصص لتحديث ترتيب مجموعة مهام دفعة واحدة
- يقبل مصفوفة من {id, order_index}
- يُطبَّق في Transaction واحدة

---

### 3.4 وحدة الفواتير (Invoices Module)

#### SRS-INV-01: إنشاء فاتورة
**الوصف:** Owner ينشئ فاتورة مرتبطة بعميل ومشروع.

**المتطلبات:**
- رقم الفاتورة يُنشأ تلقائياً بالصيغة: INV-{YEAR}-{SEQ} (مثال: INV-2026-0042)
- الحقول المطلوبة: client_id، items (array)
- كل item: description، quantity، unit_price
- يُحسَب subtotal = مجموع (quantity × unit_price) لكل item
- يُحسَب total = subtotal + (subtotal × tax/100) - discount
- تُحفَظ بحالة draft أولاً

**معايير القبول:**
- ✅ items فارغة → 400
- ✅ unit_price سالب → 400
- ✅ client_id من مكتب آخر → 403
- ✅ إنشاء ناجح → 201 مع invoice_number

---

#### SRS-INV-02: توليد PDF للفاتورة
**الوصف:** توليد PDF احترافي للفاتورة قابل للتحميل.

**المتطلبات:**
- استخدام Puppeteer لتحويل HTML Template إلى PDF
- يشمل الـ PDF: شعار المكتب، بيانات العميل، جدول البنود، الإجمالي
- يُخزَّن الـ PDF في Cloudinary مع signed URL
- الـ URL صالح لمدة 24 ساعة فقط

**معايير القبول:**
- ✅ استدعاء /invoices/:id/pdf → Redirect لـ Signed URL
- ✅ URL منتهي → 403

---

#### SRS-INV-03: إرسال الفاتورة للعميل
**الوصف:** إرسال الفاتورة للعميل عبر الإيميل مع رابط الدفع.

**المتطلبات:**
- تتغير الحالة من draft إلى sent
- يُرسَل إيميل يحتوي على: ملخص الفاتورة + رابط الدفع
- يُسجَّل في activity_logs
- لا يمكن تعديل الفاتورة بعد الإرسال

**معايير القبول:**
- ✅ فاتورة بحالة draft → تُرسَل وتتحول لـ sent
- ✅ فاتورة بحالة sent/paid → 409 "الفاتورة مُرسَلة مسبقاً"

---

#### SRS-INV-04: تكامل Paymob
**الوصف:** معالجة الدفع الإلكتروني عبر Paymob.

**المتطلبات:**
- عند ضغط العميل "ادفع الآن" يُنشأ Payment Intent في Paymob API
- يُحوَّل العميل لـ Paymob Checkout Page
- Paymob يُرسِل Webhook POST إلى /webhooks/paymob عند الدفع
- يتحقق النظام من HMAC Signature للـ Webhook (أمان)
- عند نجاح الدفع: تتحول حالة الفاتورة لـ paid وتُحفَظ payment_ref
- يُرسَل إشعار للمكتب والعميل

**معايير القبول:**
- ✅ HMAC صحيح + دفع ناجح → فاتورة paid + إشعارات
- ✅ HMAC خاطئ → 401 (رفض الـ Webhook)
- ✅ invoice_id غير موجود → 404

---

### 3.5 وحدة بوابة العميل (Client Portal Module)

#### SRS-CLIENT-01: تسجيل دخول العميل
**الوصف:** Client Users يسجلون الدخول عبر نظام Auth منفصل.

**المتطلبات:**
- endpoint منفصل: POST /auth/client/login
- يُصدَر JWT يحتوي على: client_user_id، client_id، role، permissions
- لا يتداخل مع JWT الخاص بموظفي المكتب
- يُوجَّه لـ Client Portal وليس Admin Portal

---

#### SRS-CLIENT-02: عرض مشاريع العميل
**الوصف:** العميل يرى مشاريع شركته فقط.

**المتطلبات:**
- يُفلَتر بـ client_id المستخرج من JWT
- يعرض: اسم المشروع، الحالة، نسبة التقدم، آخر تحديث
- Client Employee يرى ما يسمح له Client Owner برؤيته

---

#### SRS-CLIENT-03: إدارة موظفي العميل
**الوصف:** Client Owner يضيف موظفين من شركته ويحدد صلاحياتهم.

**المتطلبات:**
- يُرسَل invite بالإيميل للموظف
- Client Owner يحدد permissions: can_comment، can_upload
- يمكن تعديل أو إلغاء الصلاحيات في أي وقت
- Client Employee لا يرى الفواتير أبداً

**معايير القبول:**
- ✅ Client Owner يضيف موظف → إيميل دعوة يُرسَل
- ✅ Client Employee يحاول رؤية فاتورة → 403

---

### 3.6 وحدة الملفات (Files Module)

#### SRS-FILE-01: رفع ملف
**الوصف:** رفع ملفات مرتبطة بمشروع.

**المتطلبات:**
- الأنواع المسموحة: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, zip
- الحجم الأقصى: 25 MB لكل ملف
- يُرفَع مباشرة لـ Cloudinary وتُخزَّن الـ URL في قاعدة البيانات
- يُسجَّل: اسم الملف، الحجم، النوع، رافعه (user أو client_user)

**معايير القبول:**
- ✅ ملف بامتداد مسموح → 201 مع file URL
- ✅ ملف أكبر من 25MB → 413
- ✅ امتداد غير مسموح → 400
- ✅ مستخدم بدون صلاحية upload → 403

---

### 3.7 وحدة الإشعارات (Notifications Module)

#### SRS-NOTIF-01: إشعارات Real-time
**الوصف:** إشعارات فورية داخل التطبيق عبر WebSocket.

**المتطلبات:**
- Socket.io مع Redis Adapter للـ horizontal scaling
- المستخدم يشترك في Room خاص بـ user_id عند الاتصال
- الأحداث المُرسَلة:
  - task.updated: عند تغيير حالة مهمة
  - comment.added: عند إضافة تعليق
  - invoice.sent: عند إرسال فاتورة
  - invoice.paid: عند اكتمال الدفع
  - project.updated: عند تغيير حالة مشروع

**معايير القبول:**
- ✅ تغيير حالة مهمة → إشعار يصل خلال < 1 ثانية
- ✅ مستخدم غير متصل → يرى الإشعار عند عودته

---

#### SRS-NOTIF-02: إشعارات الإيميل
**الوصف:** إيميلات تلقائية للأحداث المهمة.

**المتطلبات:**
- يُرسَل إيميل في الحالات التالية:
  - دعوة موظف جديد (رابط تفعيل 24 ساعة)
  - إرسال فاتورة للعميل (رابط الدفع)
  - فاتورة Overdue (يوم التأخير + 3 أيام + 7 أيام)
  - تأكيد الدفع للعميل والمكتب
- HTML Template احترافي لكل نوع
- استخدام Queue (Bull + Redis) لإرسال الإيميلات بشكل async

---

### 3.8 وحدة Super Admin

#### SRS-ADMIN-01: إدارة المكاتب
**الوصف:** Super Admin يدير كل المكاتب المشتركة.

**المتطلبات:**
- عرض قائمة المكاتب مع: الاسم، الباقة، عدد المستخدمين، تاريخ الاشتراك، الحالة
- تغيير باقة مكتب
- إيقاف مكتب (يمنع تسجيل دخول كل مستخدميه)
- حذف مكتب (Soft Delete + تحذير)
- Super Admin لا يصل لـ Endpoints الخاصة بالمكاتب

**معايير القبول:**
- ✅ إيقاف مكتب → كل موظفيه يحصلون على 403 فور المحاولة
- ✅ Super Admin يحاول قراءة مشاريع مكتب → 403

---

#### SRS-ADMIN-02: تقارير المنصة
**الوصف:** إحصائيات عامة عن المنصة.

**المتطلبات:**
- عدد المكاتب (إجمالي / نشط / موقوف)
- توزيع المكاتب على الباقات
- عدد المستخدمين الكلي
- نمو المكاتب الجديدة (آخر 12 شهر)
- البيانات تُخزَّن في Redis Cache لمدة 1 ساعة

---

## 4. المتطلبات غير الوظيفية

### 4.1 الأداء

| المتطلب | القيمة المستهدفة |
|---|---|
| وقت استجابة API (P95) | < 500ms |
| وقت استجابة API (P99) | < 1000ms |
| وقت توليد PDF | < 3 ثواني |
| وقت تسليم إشعار Real-time | < 1 ثانية |
| Max Concurrent Users | 500 مستخدم |

### 4.2 الأمان

| المتطلب | التفاصيل |
|---|---|
| كلمات المرور | bcrypt cost=12، لا تُخزَّن نصاً |
| JWT | HS256، مدة 15 دقيقة، يُلغى عند Logout |
| HTTPS | إلزامي في Production |
| Rate Limiting | 100 req/min لكل IP، 5 محاولات Login |
| CORS | Whitelist محدد لـ Frontend Origins فقط |
| SQL Injection | Parameterized Queries فقط (TypeORM) |
| XSS | Sanitize كل المدخلات، Content-Security-Policy Header |
| Helmet.js | كل Security Headers مُفعَّلة |
| Secrets | في Environment Variables فقط، لا في الكود |
| Audit Log | كل العمليات المالية تُسجَّل ولا تُحذَف |

### 4.3 التوافر والاستمرارية

| المتطلب | القيمة |
|---|---|
| Uptime المستهدف | 99.5% |
| نسخ احتياطي لقاعدة البيانات | يومياً تلقائياً |
| Recovery Time Objective | < 4 ساعات |
| Graceful Shutdown | NestJS يُكمِل الـ Requests الحالية قبل الإيقاف |

### 4.4 قابلية الصيانة

- TypeScript إلزامي في Frontend وBackend
- ESLint + Prettier مع Pre-commit Hooks
- كل Module عنده Unit Tests (Coverage > 60%)
- كل API Endpoint عنده Integration Test
- Swagger/OpenAPI Documentation تلقائية من NestJS Decorators
- Conventional Commits في Git

### 4.5 قابلية الاستخدام

- دعم اللغة العربية (RTL) والإنجليزية
- متوافق مع: Chrome، Firefox، Safari، Edge (آخر نسختين)
- Responsive على: Mobile (360px+)، Tablet (768px+)، Desktop (1280px+)
- Loading Skeletons بدل Spinners في الجداول
- Empty States تحتوي CTA واضح

---

## 5. واجهات النظام الخارجية

### 5.1 Cloudinary API

```
Base URL: https://api.cloudinary.com/v1_1/{cloud_name}
Auth: API Key + API Secret
Upload: POST /image/upload (multipart/form-data)
Delete: POST /image/destroy
Response يشمل: secure_url, public_id, bytes, format
```

### 5.2 Paymob API

```
Base URL: https://accept.paymob.com/api
Flow:
  1. POST /auth/tokens → authentication_token
  2. POST /ecommerce/orders → order_id
  3. POST /acceptance/payment_keys → payment_key
  4. Redirect: https://accept.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_key}
  5. Webhook: POST /webhooks/paymob (HMAC Verification)
```

### 5.3 Email (SMTP)

```
Provider: Gmail SMTP (Development) / SendGrid (Production)
Port: 587 (STARTTLS)
Auth: OAuth2 / API Key
Templates: HTML + Plain Text fallback
Queue: Bull + Redis (async processing)
```

### 5.4 Socket.io (Real-time)

```
Events من Server للـ Client:
  notification.new   → { id, type, title, body, metadata }
  task.updated       → { taskId, status, updatedBy }
  comment.added      → { commentId, projectId, author, content }
  invoice.paid       → { invoiceId, amount, paidAt }

Events من Client للـ Server:
  join.room          → { room: "user:{userId}" }
  leave.room         → { room: "user:{userId}" }
```

---

## 6. قيود التصميم

| القيد | السبب |
|---|---|
| NestJS للـ Backend | Architecture منظمة + TypeScript + Decorators للـ RBAC |
| PostgreSQL فقط لقاعدة البيانات | RLS + ACID + JSON support |
| Redis للـ Cache والـ Sessions | سرعة + pub/sub للـ WebSocket |
| Cloudinary للملفات | Free Tier + CDN مدمج + لا يحتاج Server إضافي |
| Docker Compose للتطوير | بيئة موحدة للفريق الثلاثة |
| Monorepo (Nx أو Turborepo) | مشاركة Types بين Frontend وBackend |

---

## 7. معايير القبول الشاملة للنظام

### 7.1 الأمان
- [ ] مستخدم مكتب A لا يستطيع الوصول لبيانات مكتب B تحت أي ظرف
- [ ] Employee لا يرى بيانات مالية (فواتير، إيرادات)
- [ ] Client لا يرى مشاريع عملاء آخرين في نفس المكتب
- [ ] Super Admin لا يرى بيانات المشاريع أو العملاء

### 7.2 الوظائف الأساسية
- [ ] دورة حياة مشروع كاملة من الإنشاء للإغلاق تعمل بدون أخطاء
- [ ] دورة حياة فاتورة كاملة من الإنشاء للدفع تعمل بدون أخطاء
- [ ] العميل يرى تحديثات مشروعه فور حدوثها (< 1 ثانية)
- [ ] Webhook من Paymob يُحدِّث حالة الفاتورة بشكل صحيح

### 7.3 الجودة
- [ ] لا توجد Console Errors في بيئة Production
- [ ] جميع الـ Forms تعرض رسائل خطأ واضحة عند الإدخال الخاطئ
- [ ] جميع الإجراءات التدميرية (حذف، إلغاء) تطلب تأكيداً
- [ ] التطبيق يعمل على Mobile بدون أخطاء Layout

---

## 8. ملحق — Error Codes الموحدة

```json
{
  "400": "BAD_REQUEST — بيانات الطلب غير صحيحة أو ناقصة",
  "401": "UNAUTHORIZED — يجب تسجيل الدخول",
  "403": "FORBIDDEN — ليس لديك صلاحية لهذا الإجراء",
  "404": "NOT_FOUND — العنصر المطلوب غير موجود",
  "409": "CONFLICT — العنصر موجود مسبقاً أو الحالة لا تسمح بالإجراء",
  "413": "PAYLOAD_TOO_LARGE — حجم الملف يتجاوز الحد المسموح",
  "422": "UNPROCESSABLE_ENTITY — البيانات صحيحة الصيغة لكن غير منطقية",
  "429": "TOO_MANY_REQUESTS — تجاوزت الحد المسموح من الطلبات",
  "402": "PAYMENT_REQUIRED — يجب ترقية الباقة"
}
```

**Response Format الموحد:**
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "رسالة واضحة للمستخدم",
  "details": [
    { "field": "email", "message": "صيغة الإيميل غير صحيحة" }
  ],
  "timestamp": "2026-03-13T10:00:00Z",
  "path": "/api/auth/login"
}
```
