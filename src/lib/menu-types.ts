export interface MenuItemData {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn?: string;
  descAr?: string;
  descFr?: string;
  descEn?: string;
  price: number;
  priceLarge?: number;
  sizeLabel?: string;
  image: string;
  badge?: string;
  badgeFr?: string;
  badgeEn?: string;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn?: string;
  icon: string;
  color: string;
  items: MenuItemData[];
}

export interface SocialLinksData {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export interface MenuData {
  restaurantName: string;
  restaurantNameFr?: string;
  restaurantNameEn?: string;
  // Slogan - 3 languages
  slogan: string;
  sloganFr?: string;
  sloganEn?: string;
  // Description - 3 languages
  description: string;
  descriptionFr?: string;
  descriptionEn?: string;
  // Address - 3 languages
  address: string;
  addressFr?: string;
  addressEn?: string;
  // Open Hours - 3 languages
  openHours: string;
  openHoursFr?: string;
  openHoursEn?: string;
  phone: string;
  whatsapp: string;
  logoImage: string;
  heroImage: string;
  currency: string;
  currencyCode: string;
  adminPin: string;
  socialLinks: SocialLinksData;
  categories: MenuCategory[];
}
