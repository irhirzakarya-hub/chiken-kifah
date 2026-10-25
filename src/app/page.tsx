"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuData, MenuCategory, MenuItemData } from "@/lib/menu-types";

type Language = "ar" | "fr" | "en";

// ─── Icons ──────────────────────────────────────────────────────────────────
function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Badge Translation Helper ───────────────────────────────────────────────
function getBadgeText(item: MenuItemData, lang: Language): string {
  if (lang === "fr") {
    if (item.badgeFr && item.badgeFr.trim()) return item.badgeFr;
  } else if (lang === "en") {
    if (item.badgeEn && item.badgeEn.trim()) return item.badgeEn;
  } else {
    return item.badge || "";
  }

  const raw = item.badge?.trim();
  if (!raw) return "";

  const dict: Record<string, { fr: string; en: string }> = {
    "الأكثر طلباً": { fr: "Populaire", en: "Best Seller" },
    "الأكثر طلبا": { fr: "Populaire", en: "Best Seller" },
    "الاكثر طلبا": { fr: "Populaire", en: "Best Seller" },
    "مميز": { fr: "Spécial", en: "Special" },
    "كلاسيك": { fr: "Classique", en: "Classic" },
    "فاخر": { fr: "Deluxe", en: "Deluxe" },
    "جديد": { fr: "Nouveau", en: "New" },
    "حار": { fr: "Piquant", en: "Spicy" },
    "طازج": { fr: "Frais", en: "Fresh" },
    "إضافة": { fr: "Supplément", en: "Add-on" },
    "اضافة": { fr: "Supplément", en: "Add-on" },
  };

  if (dict[raw]) {
    return lang === "fr" ? dict[raw].fr : dict[raw].en;
  }
  return item.badge || "";
}

// ─── Item Card ───────────────────────────────────────────────────────────────
function ItemCard({
  item,
  currency,
  catIcon,
  lang,
}: {
  item: MenuItemData;
  currency: string;
  catIcon: string;
  lang: Language;
}) {
  const isHot =
    item.badge?.includes("حار") ||
    item.badge?.toLowerCase().includes("spicy") ||
    item.badge?.toLowerCase().includes("hot");

  const primaryName =
    lang === "fr"
      ? item.nameFr || item.nameAr
      : lang === "en"
      ? item.nameEn || item.nameAr
      : item.nameAr;

  // In Arabic mode only, show French name as secondary subtitle if available.
  // In English and French modes, never show Arabic subtitle to keep view 100% translated.
  const secondaryName = lang === "ar" ? item.nameFr : undefined;

  const badgeText = getBadgeText(item, lang);

  const description =
    lang === "fr"
      ? item.descFr || item.descAr
      : lang === "en"
      ? item.descEn || item.descAr
      : item.descAr;

  const unavailableLabel =
    lang === "fr" ? "Indisponible" : lang === "en" ? "Unavailable" : "غير متوفر";

  return (
    <div className={`ck-card${!item.available ? " ck-card-unavailable" : ""}`}>
      {/* Image */}
      <div className="ck-card-img">
        {item.image ? (
          <Image
            src={item.image}
            alt={primaryName}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width:640px) 100vw, 300px"
          />
        ) : (
          <div className="ck-card-img-placeholder">{catIcon}</div>
        )}
        {badgeText && (
          <div className={`ck-card-badge${isHot ? " hot" : ""}`}>{badgeText}</div>
        )}
        {!item.available && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#ef4444",
                background: "rgba(0,0,0,0.8)",
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid rgba(239,68,68,0.4)",
              }}
            >
              {unavailableLabel}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="ck-card-body">
        <div className="ck-card-name">{primaryName}</div>
        <div className="ck-card-name-fr">
          {secondaryName && secondaryName !== primaryName ? secondaryName : "\u00A0"}
        </div>
        <div className="ck-card-desc">
          {description || "\u00A0"}
        </div>
        <div className="ck-card-footer">
          {item.sizeLabel ? (
            <div className="ck-size-badge" title={item.sizeLabel}>
              {item.sizeLabel}
            </div>
          ) : (
            <div className="ck-price" style={{ opacity: item.available ? 1 : 0.6 }}>
              {item.price} <span>{currency}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────
function CategorySection({
  category,
  currency,
  lang,
}: {
  category: MenuCategory;
  currency: string;
  lang: Language;
}) {
  const availableItems = category.items.filter((i) => i.available);
  const unavailableItems = category.items.filter((i) => !i.available);
  const sorted = [...availableItems, ...unavailableItems];

  const catName =
    lang === "fr"
      ? category.nameFr || category.nameAr
      : lang === "en"
      ? category.nameEn || category.nameAr
      : category.nameAr;

  const catSubName =
    lang === "ar"
      ? category.nameFr
      : lang === "fr"
      ? category.nameAr
      : category.nameFr || category.nameAr;

  const countLabel =
    lang === "fr"
      ? `${availableItems.length} article${availableItems.length > 1 ? "s" : ""}`
      : lang === "en"
      ? `${availableItems.length} item${availableItems.length > 1 ? "s" : ""}`
      : `${availableItems.length} صنف`;

  return (
    <section>
      <div className="ck-section-header">
        <div className="ck-section-header-main">
          <div className="ck-section-icon">{category.icon}</div>
          <div className="ck-section-titles">
            <h2 className="ck-section-title-text">{catName}</h2>
            {catSubName && catSubName !== catName && (
              <span className="ck-section-sub-text">{catSubName}</span>
            )}
          </div>
        </div>
        <div className="ck-section-count">
          <span className="ck-count-badge">{countLabel}</span>
        </div>
      </div>
      <div className="ck-grid">
        {sorted.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            currency={currency}
            catIcon={category.icon}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("ar");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setMenu(data);
        if (data.categories?.length > 0) setActiveTab(data.categories[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const switchCategory = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const btn = document.getElementById(`tab-${id}`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const t = (ar?: string, fr?: string, en?: string) => {
    if (lang === "fr" && fr && fr.trim()) return fr;
    if (lang === "en" && en && en.trim()) return en;
    return ar || fr || en || "";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "logo-float 2s ease-in-out infinite" }}>🍔</div>
          <div style={{ color: "#f59e0b", fontSize: 16, fontWeight: 700 }}>
            {lang === "fr" ? "Chargement..." : lang === "en" ? "Loading..." : "جاري التحميل..."}
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center", color: "#ef4444" }}>
          {lang === "fr" ? "Erreur de chargement" : lang === "en" ? "Error loading menu" : "خطأ في تحميل المنيو"}
        </div>
      </div>
    );
  }

  const restaurantName = t(menu.restaurantName, menu.restaurantNameFr, menu.restaurantNameEn);
  const slogan = t(menu.slogan, menu.sloganFr, menu.sloganEn);
  const address = t(menu.address, menu.addressFr, menu.addressEn);
  const openHours = t(menu.openHours, menu.openHoursFr, menu.openHoursEn);
  const currency = lang === "ar" ? menu.currency || "درهم" : menu.currencyCode || "DH";
  const qualityText = lang === "fr" ? "Qualité Premium" : lang === "en" ? "Premium Quality" : "جودة ممتازة";

  return (
    <div className="ck-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ── HEADER ── */}
      <header className="ck-header">
        <div className="ck-container" style={{ padding: "24px 16px 20px", textAlign: "center" }}>

          {/* Language Switcher */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div className="ck-lang-switcher">
              <button
                type="button"
                className={`ck-lang-btn ${lang === "ar" ? "active" : ""}`}
                onClick={() => setLang("ar")}
              >
                <span>🇲🇦</span> العربية
              </button>
              <button
                type="button"
                className={`ck-lang-btn ${lang === "fr" ? "active" : ""}`}
                onClick={() => setLang("fr")}
              >
                <span>🇫🇷</span> Français
              </button>
              <button
                type="button"
                className={`ck-lang-btn ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
              >
                <span>🇬🇧</span> English
              </button>
            </div>
          </div>

          {/* Logo */}
          <div style={{ marginBottom: 14 }}>
            {menu.logoImage ? (
              <div style={{ display: "inline-block" }} className="ck-logo-glow">
                <Image
                  src={menu.logoImage}
                  alt={restaurantName}
                  width={180}
                  height={100}
                  style={{ objectFit: "contain", maxHeight: 100 }}
                  priority
                />
              </div>
            ) : (
              <div className="ck-logo-glow" style={{ fontSize: 80, display: "inline-block", lineHeight: 1 }}>🍔</div>
            )}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>
            <span className="text-gold-gradient">{restaurantName}</span>
          </h1>

          {/* Slogan */}
          {slogan && (
            <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 14, fontWeight: 500 }}>
              {slogan}
            </p>
          )}

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} />
            ))}
            <span style={{ fontSize: 12, color: "#737373", marginInlineStart: 6 }}>
              {qualityText}
            </span>
          </div>
        </div>

        {/* Info chips */}
        <div className="ck-info-bar">
          {address && (
            <span className="ck-info-chip">
              <LocationIcon />
              {address}
            </span>
          )}
          {openHours && (
            <span className="ck-info-chip">
              <ClockIcon />
              {openHours}
            </span>
          )}
        </div>
      </header>

      {/* ── CATEGORY TABS ── */}
      {menu.categories.length > 0 && (
        <div className="ck-tabs-wrapper">
          <div className="ck-tabs-scroll" ref={tabsRef}>
            {menu.categories.map((cat) => {
              const tabName =
                lang === "fr"
                  ? cat.nameFr || cat.nameAr
                  : lang === "en"
                  ? cat.nameEn || cat.nameAr
                  : cat.nameAr;

              return (
                <button
                  key={cat.id}
                  className={`ck-tab${activeTab === cat.id ? " active" : ""}`}
                  onClick={() => switchCategory(cat.id)}
                  id={`tab-${cat.id}`}
                >
                  <span>{cat.icon}</span>
                  <span>{tabName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MENU SECTIONS ── */}
      <main className="ck-menu-section">
        {menu.categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#525252" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {lang === "fr"
                ? "Le menu est en cours de mise à jour"
                : lang === "en"
                ? "Menu is being updated"
                : "المنيو قيد التحديث"}
            </p>
          </div>
        ) : (() => {
          const activeCat = menu.categories.find((c) => c.id === activeTab);
          return activeCat ? (
            <CategorySection
              key={activeCat.id}
              category={activeCat}
              currency={currency}
              lang={lang}
            />
          ) : null;
        })()}
      </main>

    </div>
  );
}
