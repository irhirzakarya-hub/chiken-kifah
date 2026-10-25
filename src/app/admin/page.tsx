"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuData, MenuCategory, MenuItemData } from "@/lib/menu-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevronUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, show }: { msg: string; type: "success" | "error"; show: boolean }) {
  return (
    <div className={`ck-toast ${type} ${show ? "show" : ""}`}>
      {type === "success" ? "✓" : "✗"} {msg}
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({
  label, currentUrl, prefix, onUploaded
}: {
  label: string;
  currentUrl: string;
  prefix: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", prefix);
    fd.append("oldImage", currentUrl || "");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) onUploaded(data.url || data.dataUrl);
    } catch {
      // error uploading
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="ck-label">{label}</label>
      <div
        className={`ck-upload-zone${uploading ? " uploading" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {currentUrl ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image src={currentUrl} alt="preview" fill style={{ objectFit: "contain" }} />
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s",
            }}
              className="upload-hover-overlay"
            >
              <UploadIcon />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24, color: "#525252" }}>
            <UploadIcon />
            <span style={{ fontSize: 13 }}>{uploading ? "جاري الرفع..." : "انقر أو اسحب صورة هنا"}</span>
          </div>
        )}
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700 }}>جاري الرفع...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Item Editor ──────────────────────────────────────────────────────────────
function ItemEditor({
  item, catIcon, currency,
  onChange, onDelete
}: {
  item: MenuItemData;
  catIcon: string;
  currency: string;
  onChange: (updated: MenuItemData) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const set = (key: keyof MenuItemData, val: string | number | boolean) => {
    onChange({ ...item, [key]: val });
  };

  return (
    <div className="ck-item-card">
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Thumb */}
        <div style={{
          width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0,
          background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          border: "1px solid rgba(245,158,11,0.15)"
        }}>
          {item.image ? (
            <Image src={item.image} alt="" width={52} height={52} style={{ objectFit: "cover" }} />
          ) : catIcon}
        </div>

        {/* Name & price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fafafa", marginBottom: 2 }}>{item.nameAr || "صنف بدون اسم"}</div>
          <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>{item.price} {currency}</div>
        </div>

        {/* Toggle available */}
        <label className="ck-toggle" title="متوفر / غير متوفر">
          <input type="checkbox" checked={item.available} onChange={(e) => set("available", e.target.checked)} />
          <span className="ck-toggle-slider" />
        </label>

        {/* Expand */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="ck-btn-secondary"
          style={{ padding: "6px 10px" }}
        >
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>

        {/* Delete */}
        <button className="ck-btn-danger" style={{ padding: "6px 10px" }} onClick={onDelete}>
          <TrashIcon />
        </button>
      </div>

      {/* Expanded editor */}
      {open && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          {/* Name in 3 languages */}
          <div className="ck-lang-grid">
            <div>
              <label className="ck-label">🇲🇦 الاسم بالعربية *</label>
              <input className="ck-input" value={item.nameAr} onChange={(e) => set("nameAr", e.target.value)} placeholder="اسم الصنف" />
            </div>
            <div>
              <label className="ck-label">🇫🇷 Français</label>
              <input className="ck-input" value={item.nameFr} onChange={(e) => set("nameFr", e.target.value)} placeholder="Nom du plat" style={{ direction: "ltr" }} />
            </div>
            <div>
              <label className="ck-label">🇬🇧 English</label>
              <input className="ck-input" value={item.nameEn || ""} onChange={(e) => set("nameEn", e.target.value)} placeholder="Dish name" style={{ direction: "ltr" }} />
            </div>
          </div>

          <div>
            <label className="ck-label">السعر الأساسي ({currency})</label>
            <input className="ck-input" type="number" value={item.price} min={0}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)} placeholder="0" style={{ direction: "ltr" }} />
          </div>

          {/* Badge in 3 languages */}
          <div className="ck-lang-grid">
            <div>
              <label className="ck-label">🇲🇦 الشارة بالعربية (اختياري)</label>
              <input className="ck-input" value={item.badge || ""} onChange={(e) => set("badge", e.target.value)} placeholder="مثال: الأكثر طلبًا" />
            </div>
            <div>
              <label className="ck-label">🇫🇷 Badge en français</label>
              <input className="ck-input" value={item.badgeFr || ""} onChange={(e) => set("badgeFr", e.target.value)} placeholder="Ex: Populaire" style={{ direction: "ltr" }} />
            </div>
            <div>
              <label className="ck-label">🇬🇧 Badge in English</label>
              <input className="ck-input" value={item.badgeEn || ""} onChange={(e) => set("badgeEn", e.target.value)} placeholder="Ex: Best Seller" style={{ direction: "ltr" }} />
            </div>
          </div>

          <div>
            <label className="ck-label">نص الأحجام والأسعار المتعددة (اختياري)</label>
            <input className="ck-input" value={item.sizeLabel || ""} onChange={(e) => set("sizeLabel", e.target.value)} placeholder="مثال: M: 22 DH | XL: 30 DH" style={{ direction: "ltr" }} />
          </div>

          {/* Description in 3 languages */}
          <div className="ck-lang-grid">
            <div>
              <label className="ck-label">🇲🇦 الوصف بالعربية</label>
              <textarea className="ck-input ck-textarea" value={item.descAr || ""} onChange={(e) => set("descAr", e.target.value)} placeholder="وصف الصنف" rows={2} />
            </div>
            <div>
              <label className="ck-label">🇫🇷 Français</label>
              <textarea className="ck-input ck-textarea" value={item.descFr || ""} onChange={(e) => set("descFr", e.target.value)} placeholder="Description" rows={2} style={{ direction: "ltr" }} />
            </div>
            <div>
              <label className="ck-label">🇬🇧 English</label>
              <textarea className="ck-input ck-textarea" value={item.descEn || ""} onChange={(e) => set("descEn", e.target.value)} placeholder="Description" rows={2} style={{ direction: "ltr" }} />
            </div>
          </div>

          <ImageUpload
            label="صورة الصنف"
            currentUrl={item.image}
            prefix={`item-${item.id}`}
            onUploaded={(url) => set("image", url)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Category Editor ──────────────────────────────────────────────────────────
function CategoryEditor({
  cat, currency,
  onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast
}: {
  cat: MenuCategory;
  currency: string;
  onChange: (c: MenuCategory) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  const set = (key: keyof MenuCategory, val: string) => {
    onChange({ ...cat, [key]: val });
  };

  const setItem = (idx: number, item: MenuItemData) => {
    const items = [...cat.items];
    items[idx] = item;
    onChange({ ...cat, items });
  };

  const addItem = () => {
    onChange({
      ...cat,
      items: [
        ...cat.items,
        { id: uid(), nameAr: "", nameFr: "", nameEn: "", descAr: "", descFr: "", descEn: "", price: 0, image: "", badge: "", badgeFr: "", badgeEn: "", available: true },
      ],
    });
  };

  const deleteItem = (idx: number) => {
    const items = cat.items.filter((_, i) => i !== idx);
    onChange({ ...cat, items });
  };

  return (
    <div className="ck-admin-card">
      {/* Category header */}
      <button className="ck-accordion-trigger" onClick={() => setOpen((o) => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{cat.icon}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fafafa" }}>{cat.nameAr || "قسم بدون اسم"}</div>
            <div style={{ fontSize: 12, color: "#737373" }}>{cat.items.length} صنف · {cat.nameFr} {cat.nameEn ? `· ${cat.nameEn}` : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Move up/down */}
          <button
            className="ck-btn-secondary" style={{ padding: "5px 8px" }}
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            title="تحريك لأعلى"
          >▲</button>
          <button
            className="ck-btn-secondary" style={{ padding: "5px 8px" }}
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            title="تحريك لأسفل"
          >▼</button>
          <button
            className="ck-btn-danger" style={{ padding: "6px 10px" }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <TrashIcon />
          </button>
          <span style={{ color: "#525252" }}>{open ? <ChevronUp /> : <ChevronDown />}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          {/* Category meta */}
          <div className="ck-cat-grid" style={{ marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 20 }}>
            <div>
              <label className="ck-label">🇲🇦 بالعربية *</label>
              <input className="ck-input" value={cat.nameAr} onChange={(e) => set("nameAr", e.target.value)} placeholder="مثال: البرغر" />
            </div>
            <div>
              <label className="ck-label">🇫🇷 Français</label>
              <input className="ck-input" value={cat.nameFr} onChange={(e) => set("nameFr", e.target.value)} placeholder="Ex: Burgers" style={{ direction: "ltr" }} />
            </div>
            <div>
              <label className="ck-label">🇬🇧 English</label>
              <input className="ck-input" value={cat.nameEn || ""} onChange={(e) => set("nameEn", e.target.value)} placeholder="Ex: Burgers" style={{ direction: "ltr" }} />
            </div>
            <div>
              <label className="ck-label">الأيقونة</label>
              <input className="ck-input" value={cat.icon} onChange={(e) => set("icon", e.target.value)} placeholder="🍔" style={{ textAlign: "center", fontSize: 20 }} />
            </div>
          </div>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.items.map((item, idx) => (
              <ItemEditor
                key={item.id}
                item={item}
                catIcon={cat.icon}
                currency={currency}
                onChange={(upd) => setItem(idx, upd)}
                onDelete={() => deleteItem(idx)}
              />
            ))}
          </div>

          <button className="ck-btn-secondary" onClick={addItem} style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
            <PlusIcon /> إضافة صنف جديد
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────
function PinScreen({ correctPin, onSuccess }: { correctPin: string; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === correctPin.length) {
      if (next === correctPin) {
        setTimeout(onSuccess, 300);
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 700);
      }
    }
  };

  const del = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="ck-modal-overlay">
      <div className="ck-modal">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ color: "#f59e0b", marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <LockIcon />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fafafa", marginBottom: 4 }}>لوحة الإدارة</h2>
          <p style={{ fontSize: 13, color: "#737373" }}>أدخل رمز PIN للدخول</p>
        </div>

        {/* PIN dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 28 }}>
          {Array.from({ length: correctPin.length }).map((_, i) => (
            <div
              key={i}
              className={`ck-pin-dot${i < pin.length ? " filled" : ""}${error ? " filled" : ""}`}
              style={error ? { background: "#ef4444", borderColor: "#ef4444", boxShadow: "0 0 10px rgba(239,68,68,0.5)" } : {}}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="ck-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="ck-numpad-btn" onClick={() => press(String(n))}>{n}</button>
          ))}
          <button className="ck-numpad-btn delete" onClick={del}>⌫</button>
          <button className="ck-numpad-btn" onClick={() => press("0")}>0</button>
          <button className="ck-numpad-btn" onClick={() => press("0")} style={{ opacity: 0, pointerEvents: "none" }} />
        </div>

        <Link href="/" style={{ display: "block", textAlign: "center", marginTop: 20, fontSize: 13, color: "#525252", textDecoration: "none" }}>
          ← العودة للمنيو
        </Link>
      </div>
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [capabilities, setCapabilities] = useState<{ hasKv?: boolean; hasBlob?: boolean; isCloudReady?: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [activeSection, setActiveSection] = useState<"info" | "menu" | "settings">("info");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error"; show: boolean }>({ msg: "", type: "success", show: false });

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  }, []);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setMenu(data);
        if (data._storageCapabilities) setCapabilities(data._storageCapabilities);
      })
      .catch(() => showToast("فشل تحميل البيانات", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const save = async () => {
    if (!menu) return;
    setSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      const data = await res.json();
      if (data.capabilities) setCapabilities(data.capabilities);
      if (data.success) showToast(data.message || "✓ تم الحفظ بنجاح", "success");
      else showToast(data.message || "فشل الحفظ", "error");
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof MenuData, val: string) => {
    if (!menu) return;
    setMenu({ ...menu, [key]: val });
  };

  const setCat = (idx: number, cat: MenuCategory) => {
    if (!menu) return;
    const cats = [...menu.categories];
    cats[idx] = cat;
    setMenu({ ...menu, categories: cats });
  };

  const addCat = () => {
    if (!menu) return;
    setMenu({
      ...menu,
      categories: [
        ...menu.categories,
        { id: uid(), nameAr: "", nameFr: "", nameEn: "", icon: "🍽️", color: "#f59e0b", items: [] },
      ],
    });
  };

  const deleteCat = (idx: number) => {
    if (!menu) return;
    setMenu({ ...menu, categories: menu.categories.filter((_, i) => i !== idx) });
  };

  const moveCat = (idx: number, dir: -1 | 1) => {
    if (!menu) return;
    const cats = [...menu.categories];
    const target = idx + dir;
    if (target < 0 || target >= cats.length) return;
    [cats[idx], cats[target]] = [cats[target], cats[idx]];
    setMenu({ ...menu, categories: cats });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
          <div style={{ color: "#f59e0b", fontWeight: 700 }}>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!authed && menu) {
    return <PinScreen correctPin={menu.adminPin || "1234"} onSuccess={() => setAuthed(true)} />;
  }

  if (!menu) return null;

  const sections = [
    { id: "info", label: "معلومات المطعم", icon: "🏪" },
    { id: "menu", label: "إدارة المنيو", icon: "🍽️" },
    { id: "settings", label: "الإعدادات", icon: "⚙️" },
  ] as const;

  return (
    <div className="ck-admin-page">
      <Toast {...toast} />

      {/* ── ADMIN HEADER ── */}
      <div className="ck-admin-header">
        <div className="ck-admin-container">
          <div className="ck-admin-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 26, flexShrink: 0 }}>⚙️</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fafafa" }}>لوحة الإدارة</div>
                  {capabilities.hasBlob ? (
                    <span style={{ fontSize: 11, background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "2px 8px", borderRadius: 20, fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)" }}>
                      🟢 Vercel Blob متصل
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: 20, fontWeight: 700, border: "1px solid rgba(245,158,11,0.3)" }}>
                      ⚠️ Storage يحتاج Redeploy
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#a3a3a3" }}>Chicken Kifah Admin</div>
              </div>
            </div>
            <div className="ck-admin-header-actions">
              <Link href="/" className="ck-btn-secondary" style={{ textDecoration: "none" }}>
                <EyeIcon /> عرض المنيو
              </Link>
              <button
                className="ck-btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "⏳ جاري..." : <><SaveIcon /> حفظ التغييرات</>}
              </button>
              <button
                className="ck-btn-danger"
                onClick={() => setAuthed(false)}
                title="تسجيل الخروج"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>

          {/* Section tabs */}
          <div className="ck-admin-tabs-row">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeSection === s.id ? "rgba(245,158,11,0.1)" : "none",
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  fontFamily: "var(--font-cairo), sans-serif",
                  color: activeSection === s.id ? "#f59e0b" : "#a3a3a3",
                  borderBottom: `2.5px solid ${activeSection === s.id ? "#f59e0b" : "transparent"}`,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="ck-admin-container" style={{ padding: "24px 20px 100px" }}>

        {/* ── SECTION: INFO ── */}
        {activeSection === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Restaurant Info */}
            <div className="ck-admin-card">
              <div className="ck-admin-section-hd">🏪 معلومات المطعم</div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Name in 3 languages */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>🏷️ اسم المطعم</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="ck-label">🇲🇦 العربية *</label>
                      <input className="ck-input" value={menu.restaurantName} onChange={(e) => set("restaurantName", e.target.value)} />
                    </div>
                    <div>
                      <label className="ck-label">🇫🇷 Français</label>
                      <input className="ck-input" value={menu.restaurantNameFr || ""} onChange={(e) => set("restaurantNameFr", e.target.value)} placeholder="Nom du restaurant" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇬🇧 English</label>
                      <input className="ck-input" value={menu.restaurantNameEn || ""} onChange={(e) => set("restaurantNameEn", e.target.value)} placeholder="Restaurant name" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                </div>

                {/* Slogan */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>💬 شعار المطعم (Slogan)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="ck-label">🇲🇦 العربية</label>
                      <input className="ck-input" value={menu.slogan} onChange={(e) => set("slogan", e.target.value)} placeholder="شعار بالعربية" />
                    </div>
                    <div>
                      <label className="ck-label">🇫🇷 Français</label>
                      <input className="ck-input" value={menu.sloganFr || ""} onChange={(e) => set("sloganFr", e.target.value)} placeholder="Slogan en français" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇬🇧 English</label>
                      <input className="ck-input" value={menu.sloganEn || ""} onChange={(e) => set("sloganEn", e.target.value)} placeholder="Slogan in English" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>📝 وصف المطعم</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="ck-label">🇲🇦 العربية</label>
                      <textarea className="ck-input ck-textarea" value={menu.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="وصف بالعربية" />
                    </div>
                    <div>
                      <label className="ck-label">🇫🇷 Français</label>
                      <textarea className="ck-input ck-textarea" value={menu.descriptionFr || ""} onChange={(e) => set("descriptionFr", e.target.value)} rows={2} placeholder="Description en français" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇬🇧 English</label>
                      <textarea className="ck-input ck-textarea" value={menu.descriptionEn || ""} onChange={(e) => set("descriptionEn", e.target.value)} rows={2} placeholder="Description in English" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>📍 العنوان</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="ck-label">🇲🇦 العربية</label>
                      <input className="ck-input" value={menu.address} onChange={(e) => set("address", e.target.value)} placeholder="العنوان بالعربية" />
                    </div>
                    <div>
                      <label className="ck-label">🇫🇷 Français</label>
                      <input className="ck-input" value={menu.addressFr || ""} onChange={(e) => set("addressFr", e.target.value)} placeholder="Adresse en français" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇬🇧 English</label>
                      <input className="ck-input" value={menu.addressEn || ""} onChange={(e) => set("addressEn", e.target.value)} placeholder="Address in English" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                </div>

                {/* Open Hours */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>🕐 ساعات العمل</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="ck-label">🇲🇦 العربية</label>
                      <input className="ck-input" value={menu.openHours} onChange={(e) => set("openHours", e.target.value)} placeholder="09:00 - 23:00" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇫🇷 Français</label>
                      <input className="ck-input" value={menu.openHoursFr || ""} onChange={(e) => set("openHoursFr", e.target.value)} placeholder="09:00 - 23:00" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="ck-label">🇬🇧 English</label>
                      <input className="ck-input" value={menu.openHoursEn || ""} onChange={(e) => set("openHoursEn", e.target.value)} placeholder="09:00 AM - 11:00 PM" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                </div>

                {/* Currency */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="ck-label">اسم العملة</label>
                    <input className="ck-input" value={menu.currency} onChange={(e) => set("currency", e.target.value)} placeholder="درهم" />
                  </div>
                  <div>
                    <label className="ck-label">رمز العملة</label>
                    <input className="ck-input" value={menu.currencyCode} onChange={(e) => set("currencyCode", e.target.value)} placeholder="MAD" style={{ direction: "ltr" }} />
                  </div>
                </div>

              </div>
            </div>


            {/* Social Links */}
            <div className="ck-admin-card">
              <div className="ck-admin-section-hd">📲 وسائل التواصل الاجتماعي</div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="ck-label">Instagram</label>
                  <input className="ck-input" value={menu.socialLinks?.instagram || ""} onChange={(e) => setMenu({ ...menu, socialLinks: { ...menu.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/..." style={{ direction: "ltr" }} />
                </div>
                <div>
                  <label className="ck-label">Facebook</label>
                  <input className="ck-input" value={menu.socialLinks?.facebook || ""} onChange={(e) => setMenu({ ...menu, socialLinks: { ...menu.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/..." style={{ direction: "ltr" }} />
                </div>
                <div>
                  <label className="ck-label">TikTok</label>
                  <input className="ck-input" value={menu.socialLinks?.tiktok || ""} onChange={(e) => setMenu({ ...menu, socialLinks: { ...menu.socialLinks, tiktok: e.target.value } })} placeholder="https://tiktok.com/@..." style={{ direction: "ltr" }} />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="ck-admin-card">
              <div className="ck-admin-section-hd">🖼️ شعار وصورة المطعم</div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <ImageUpload
                  label="شعار المطعم (Logo)"
                  currentUrl={menu.logoImage}
                  prefix="logo"
                  onUploaded={(url) => set("logoImage", url)}
                />
                <ImageUpload
                  label="صورة البانر الرئيسي (Hero)"
                  currentUrl={menu.heroImage}
                  prefix="hero"
                  onUploaded={(url) => set("heroImage", url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: MENU ── */}
        {activeSection === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fafafa" }}>
                الأقسام ({menu.categories.length})
              </div>
              <button className="ck-btn-primary" onClick={addCat} style={{ padding: "9px 16px", fontSize: 13 }}>
                <PlusIcon /> إضافة قسم جديد
              </button>
            </div>

            {menu.categories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#525252", border: "2px dashed rgba(245,158,11,0.2)", borderRadius: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <p style={{ fontWeight: 600 }}>لا توجد أقسام بعد</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>اضغط على "إضافة قسم جديد" للبدء</p>
              </div>
            ) : (
              menu.categories.map((cat, idx) => (
                <CategoryEditor
                  key={cat.id}
                  cat={cat}
                  currency={menu.currency}
                  onChange={(c) => setCat(idx, c)}
                  onDelete={() => deleteCat(idx)}
                  onMoveUp={() => moveCat(idx, -1)}
                  onMoveDown={() => moveCat(idx, 1)}
                  isFirst={idx === 0}
                  isLast={idx === menu.categories.length - 1}
                />
              ))
            )}
          </div>
        )}

        {/* ── SECTION: SETTINGS ── */}
        {activeSection === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Security */}
            <div className="ck-admin-card">
              <div className="ck-admin-section-hd">🔐 الأمان</div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="ck-label">رمز PIN للإدارة</label>
                  <input
                    className="ck-input"
                    type="password"
                    value={menu.adminPin}
                    onChange={(e) => set("adminPin", e.target.value)}
                    placeholder="رمز PIN جديد"
                    maxLength={8}
                    style={{ direction: "ltr", maxWidth: 200 }}
                  />
                  <p style={{ fontSize: 11, color: "#525252", marginTop: 6 }}>
                    الرمز الحالي مكون من {menu.adminPin.length} أرقام. لا تنسَ حفظ التغييرات بعد التعديل.
                  </p>
                </div>
              </div>
            </div>

            {/* Storage info */}
            <div className="ck-admin-card">
              <div className="ck-admin-section-hd">☁️ التخزين السحابي</div>
              <div style={{ padding: "20px" }}>
                <p style={{ fontSize: 13, color: "#737373", lineHeight: 1.8 }}>
                  البيانات محفوظة تلقائياً عبر أفضل وسيلة متاحة:
                </p>
                <ul style={{ listStyle: "none", marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Vercel KV (Redis)", desc: "أسرع وسيلة - أضف KV_REST_API_URL في Vercel Environment Variables" },
                    { label: "Vercel Blob", desc: "تخزين ملفات - أضف BLOB_READ_WRITE_TOKEN في Vercel" },
                    { label: "GitHub API", desc: "يحفظ في الريبو - أضف GITHUB_TOKEN في Vercel" },
                    { label: "Local File", desc: "يعمل محلياً تلقائياً بدون إعداد" },
                  ].map((item) => (
                    <li key={item.label} style={{ display: "flex", gap: 10, fontSize: 13, alignItems: "flex-start" }}>
                      <span style={{ color: "#f59e0b", marginTop: 1, flexShrink: 0 }}>✓</span>
                      <div>
                        <span style={{ fontWeight: 700, color: "#fafafa" }}>{item.label}</span>
                        <span style={{ color: "#525252" }}> — {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Danger zone */}
            <div className="ck-admin-card" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="ck-admin-section-hd" style={{ color: "#ef4444", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                ⚠️ منطقة الخطر
              </div>
              <div style={{ padding: "20px" }}>
                <button
                  className="ck-btn-danger"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) setAuthed(false);
                  }}
                  style={{ padding: "10px 20px" }}
                >
                  <LogoutIcon /> تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed save bar on mobile */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px max(14px,env(safe-area-inset-bottom))",
        background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(245,158,11,0.15)", display: "flex", gap: 10, zIndex: 50
      }}>
        <Link href="/" className="ck-btn-secondary" style={{ textDecoration: "none", flex: 1, justifyContent: "center" }}>
          ← المنيو
        </Link>
        <button className="ck-btn-primary" onClick={save} disabled={saving} style={{ flex: 2, justifyContent: "center" }}>
          {saving ? "⏳ جاري الحفظ..." : <><SaveIcon /> حفظ جميع التغييرات</>}
        </button>
      </div>
    </div>
  );
}
