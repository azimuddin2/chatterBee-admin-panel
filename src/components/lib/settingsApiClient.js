import { API_ENDPOINTS } from "./api";

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Session expired. Please login again.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  if (res.status === 204) return { success: true };

  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const message =
      data?.message || data?.detail || `Request failed [${res.status}]`;
    throw new Error(message);
  }

  return data;
};


const TAB_ENDPOINT_MAP = {
  "privacy-security": API_ENDPOINTS.SETTINGS.PRIVACY_POLICY,
  "terms-conditions": API_ENDPOINTS.SETTINGS.TERMS_AND_CONDITIONS,
  "about-us": API_ENDPOINTS.SETTINGS.ABOUT_US,
};

const getEndpoint = (tabId) => {
  const url = TAB_ENDPOINT_MAP[tabId];
  if (!url) throw new Error(`Unknown tab key: "${tabId}"`);
  return url;
};

const LANG = "en";

const extractSetting = (data) => {
  const item = Array.isArray(data) ? data[0] : data;
  const tr = item?.translations?.[LANG];
  return {
    ...item,
    title: tr?.title ?? item?.title ?? "",
    content: tr?.content ?? item?.content ?? "",
  };
};

/**
 * GET /api/settings/{privacy-policy|terms-and-conditions|about-us}/
 * Returns { title, content, ... }
 * @param {"privacy-security" | "terms-conditions" | "about-us"} tabId
 */
export const fetchSettingByTab = async (tabId) => {
  const res = await fetch(getEndpoint(tabId), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  return extractSetting(data?.data ?? data);
};

/**
 * PUT /api/settings/{privacy-policy|terms-and-conditions|about-us}/
 * Body: { title, content, translations: { en: { title, content } } }
 * @param {"privacy-security" | "terms-conditions" | "about-us"} tabId
 * @param {string} htmlContent  Rich-text HTML from the editor
 */
export const saveSettingByTab = async (tabId, htmlContent) => {
  const res = await fetch(getEndpoint(tabId), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: "",
      content: htmlContent,
      translations: { [LANG]: { title: "", content: htmlContent } },
    }),
  });
  const data = await handleResponse(res);
  return extractSetting(data?.data ?? data);
};

const extractFaqList = (data) => {
  const d = data?.data ?? data;
  if (Array.isArray(d)) return d;
  const candidates = [d?.results, d?.faqs, d?.faq, d?.items, d?.data, d?.settings];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
};

const FAQ_TITLE_KEYS = ["title", "question", "name", "heading", "subject", "q"];
const FAQ_CONTENT_KEYS = ["content", "answer", "description", "body", "text", "html", "a"];

const pickString = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return "";
};

const normalizeFaq = (f) => {
  if (!f || typeof f !== "object") return f;

  let tr = f.translations;
  if (Array.isArray(tr)) {
    tr = tr.find((t) => t?.language === LANG || t?.lang === LANG) ?? tr[0];
  } else if (tr && typeof tr === "object") {
    tr = tr[LANG] ?? Object.values(tr)[0];
  } else {
    tr = undefined;
  }

  return {
    ...f,
    title: pickString(tr, FAQ_TITLE_KEYS) || pickString(f, FAQ_TITLE_KEYS),
    content: pickString(tr, FAQ_CONTENT_KEYS) || pickString(f, FAQ_CONTENT_KEYS),
  };
};

const buildFaqBody = (payload = {}) => {
  const title = payload.title ?? "";
  const content = payload.content ?? "";
  return {
    title,
    content,
    translations: { [LANG]: { title, content } },
  };
};

export const getAllFaqs = async () => {
  const res = await fetch(API_ENDPOINTS.FAQ.GET_ALL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  const list = extractFaqList(data);
  console.log("FAQ GET raw response:", data);
  console.log("FAQ first item:", JSON.stringify(list[0], null, 2));
  return list.map(normalizeFaq);
};

export const createFaq = async (payload) => {
  const res = await fetch(API_ENDPOINTS.FAQ.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(buildFaqBody(payload)),
  });
  const data = await handleResponse(res);
  return normalizeFaq(data?.data ?? data);
};

export const updateFaq = async (id, payload) => {
  const res = await fetch(API_ENDPOINTS.FAQ.UPDATE(id), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(buildFaqBody(payload)),
  });
  const data = await handleResponse(res);
  return normalizeFaq(data?.data ?? data);
};

export const deleteFaq = async (id) => {
  const res = await fetch(API_ENDPOINTS.FAQ.DELETE(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
