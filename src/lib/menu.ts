import fs from "fs";
import path from "path";
import { MenuData } from "./menu-types";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "menu.json");
const PUBLIC_DATA_FILE_PATH = path.join(process.cwd(), "public", "data", "menu.json");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KV_KEY = "chicken_kifah_menu_data";

export const DEFAULT_MENU: MenuData = {
  restaurantName: "Chicken Kifah",
  slogan: "طعم لا يُقاوم · Saveur irrésistible",
  description: "مطعم شيكن كيفاه - أشهى الوجبات السريعة",
  phone: "0600000000",
  whatsapp: "212600000000",
  address: "المغرب",
  openHours: "09:00 - 23:00",
  logoImage: "/logo.png",
  heroImage: "",
  currency: "درهم",
  currencyCode: "MAD",
  adminPin: "1234",
  socialLinks: { instagram: "", facebook: "", tiktok: "" },
  categories: [],
};

export function getStorageCapabilities() {
  return {
    hasKv: Boolean(KV_URL && KV_TOKEN),
    hasBlob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasGithub: Boolean(process.env.GITHUB_TOKEN),
    isCloudReady: Boolean(
      (KV_URL && KV_TOKEN) ||
        process.env.BLOB_READ_WRITE_TOKEN ||
        process.env.GITHUB_TOKEN
    ),
  };
}

async function getLocalFallback(): Promise<MenuData> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
      return { ...DEFAULT_MENU, ...JSON.parse(raw) };
    }
    if (fs.existsSync(PUBLIC_DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(PUBLIC_DATA_FILE_PATH, "utf-8");
      return { ...DEFAULT_MENU, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_MENU;
}

export async function getMenu(): Promise<MenuData> {
  // 1. Vercel KV / Upstash Redis
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.result) {
          const parsed =
            typeof data.result === "string"
              ? JSON.parse(data.result)
              : data.result;
          if (parsed?.restaurantName) return { ...DEFAULT_MENU, ...parsed };
        }
      }
    } catch {
      // continue
    }
  }

  // 2. Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list();
      const menuBlob = blobs.find(
        (b) =>
          b.pathname === "menu-data.json" ||
          b.pathname.endsWith("/menu-data.json")
      );
      if (menuBlob) {
        const res = await fetch(`${menuBlob.url}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const parsed = await res.json();
          if (parsed?.restaurantName) return { ...DEFAULT_MENU, ...parsed };
        }
      }
    } catch {
      // continue
    }
  }

  // 3. Local file
  return getLocalFallback();
}

export async function saveMenu(
  data: MenuData,
  options?: { githubToken?: string }
): Promise<{ success: boolean; isReadOnly?: boolean; storageType?: string; error?: string }> {
  let savedToCloud = false;
  let storageType = "local";
  let lastError = "";

  // 1. Vercel KV
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/set/${KV_KEY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(JSON.stringify(data)),
      });
      savedToCloud = true;
      storageType = "vercel-kv";
    } catch {
      // continue
    }
  }

  // 2. Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put("menu-data.json", JSON.stringify(data, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      savedToCloud = true;
      storageType = storageType === "vercel-kv" ? "kv+blob" : "vercel-blob";
    } catch (e: unknown) {
      const err = e as Error;
      lastError = err?.message || String(e);
      console.error("[saveMenu] Vercel Blob put error:", err);
    }
  }

  // 3. GitHub
  const gitToken = options?.githubToken || process.env.GITHUB_TOKEN;
  if (gitToken) {
    try {
      const repo = process.env.GITHUB_REPO || "irhirzakarya-hub/Ferdaous-TAZI";
      const filePath = "data/menu.json";
      let sha = "";
      const getRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `Bearer ${gitToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          cache: "no-store",
        }
      );
      if (getRes.ok) {
        const info = await getRes.json();
        sha = info.sha;
      }
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
      const putRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${gitToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "chore: update menu from admin dashboard",
            content,
            sha: sha || undefined,
          }),
        }
      );
      if (putRes.ok) {
        savedToCloud = true;
        storageType = "github";
      }
    } catch {
      // continue
    }
  }

  // 4. Local FS
  let savedToFile = false;
  try {
    const json = JSON.stringify(data, null, 2);
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    await fs.promises.writeFile(DATA_FILE_PATH, json, "utf-8");
    const pubDir = path.dirname(PUBLIC_DATA_FILE_PATH);
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
    await fs.promises.writeFile(PUBLIC_DATA_FILE_PATH, json, "utf-8");
    savedToFile = true;
  } catch {
    // read-only on Vercel
  }

  return {
    success: savedToCloud || savedToFile,
    isReadOnly: !savedToCloud && !savedToFile,
    storageType,
    error: lastError || undefined,
  };
}

export async function deleteMenuImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  if (
    imageUrl.includes("public.blob.vercel-storage.com") &&
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    try {
      const { del } = await import("@vercel/blob");
      await del(imageUrl);
      return true;
    } catch {
      // continue
    }
  }
  if (imageUrl.startsWith("/uploads/")) {
    try {
      const filename = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch {
      // continue
    }
  }
  return false;
}
