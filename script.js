const $ = (id) => document.getElementById(id);

const loginPage = $("loginPage");
const photoPage = $("photoPage");
const homePage = $("homePage");

const loginForm = $("loginForm");
const userNameInput = $("userName");
const mobileInput = $("mobile");
const loginError = $("loginError");

const openCameraBtn = $("openCameraBtn");
const closeCameraBtn = $("closeCameraBtn");
const captureSelfieBtn = $("captureSelfieBtn");
const cameraBox = $("cameraBox");
const cameraVideo = $("cameraVideo");
const cameraCanvas = $("cameraCanvas");

const uploadInput = $("uploadInput");
const previewArea = $("previewArea");
const previewImage = $("previewImage");
const analyzeBtn = $("analyzeBtn");
const removePhotoBtn = $("removePhotoBtn");
const analysisResult = $("analysisResult");

const profileBtn = $("profileBtn");
const profileModal = $("profileModal");
const closeProfileBtn = $("closeProfileBtn");
const logoutBtn = $("logoutBtn");

const topProfileImg = $("topProfileImg");
const homeUserPhoto = $("homeUserPhoto");
const homeUserName = $("homeUserName");
const homeToneName = $("homeToneName");
const skinTonePreview = $("skinTonePreview");
const skinHexText = $("skinHexText");
const themeLine = $("themeLine");

const profileModalImg = $("profileModalImg");
const profileModalName = $("profileModalName");
const profileModalTone = $("profileModalTone");
const profileModalTheme = $("profileModalTheme");

const shirtInput = $("shirtInput");
const tshirtInput = $("tshirtInput");
const pantInput = $("pantInput");
const nightPantInput = $("nightPantInput");
const shortsInput = $("shortsInput");

const shirtGallery = $("shirtGallery");
const tshirtGallery = $("tshirtGallery");
const pantGallery = $("pantGallery");
const nightPantGallery = $("nightPantGallery");
const shortsGallery = $("shortsGallery");

const clearShirtsBtn = $("clearShirtsBtn");
const clearTshirtsBtn = $("clearTshirtsBtn");
const clearPantsBtn = $("clearPantsBtn");
const clearNightPantsBtn = $("clearNightPantsBtn");
const clearShortsBtn = $("clearShortsBtn");

const suggestionGrid = $("suggestionGrid");
const suggestionEmptyState = $("suggestionEmptyState");
const clothSearchInput = $("clothSearchInput");

const toastBox = $("toastBox");
const loadingOverlay = $("loadingOverlay");
const loadingText = $("loadingText");

const imageCanvas = $("imageCanvas");
const imageCtx = imageCanvas ? imageCanvas.getContext("2d", { willReadFrequently: true }) : null;

let currentUserKey = "";
let uploadedFaceImage = null;
let cameraStream = null;

let appUser = {
  name: "",
  mobile: "",
  photo: "",
  toneName: "",
  themeName: "",
  toneHex: "",
  undertone: "warm",
  toneProfile: null
};

let clothes = {
  shirt: [],
  tshirt: [],
  pant: [],
  nightPant: [],
  shorts: []
};

const SKIN_SWATCHES = [
  { group: "Fair", name: "Pale Ivory", hex: "#F1D7C2", undertones: ["cool", "neutral"] },
  { group: "Fair", name: "Warm Ivory", hex: "#EFCF97", undertones: ["warm", "neutral"] },
  { group: "Fair", name: "Rose Beige", hex: "#EBC4A6", undertones: ["cool", "neutral"] },
  { group: "Fair", name: "Almond Beige", hex: "#DDB189", undertones: ["warm", "neutral"] },

  { group: "Light", name: "Yellow Beige", hex: "#E2BE86", undertones: ["warm"] },
  { group: "Light", name: "Sand Beige", hex: "#E3BF92", undertones: ["neutral", "warm"] },
  { group: "Light", name: "True Beige", hex: "#D8B08E", undertones: ["neutral"] },
  { group: "Light", name: "Natural Beige", hex: "#D1A26E", undertones: ["warm", "neutral"] },

  { group: "Medium", name: "Warm Beige", hex: "#D6A37C", undertones: ["warm"] },
  { group: "Medium", name: "Golden Beige", hex: "#C99663", undertones: ["warm", "olive"] },
  { group: "Medium", name: "Honey Tan", hex: "#C38752", undertones: ["warm", "olive"] },
  { group: "Medium", name: "Neutral Sand", hex: "#BC8A6A", undertones: ["neutral"] },

  { group: "Tan", name: "Caramel Tan", hex: "#A96F45", undertones: ["warm"] },
  { group: "Tan", name: "Olive Tan", hex: "#9A744F", undertones: ["olive"] },
  { group: "Tan", name: "Sun Bronze", hex: "#A56B4A", undertones: ["warm", "neutral"] },
  { group: "Tan", name: "Muted Bronze", hex: "#8E644B", undertones: ["neutral", "olive"] },

  { group: "Deep", name: "Mocha", hex: "#7A4E2E", undertones: ["warm"] },
  { group: "Deep", name: "Rich Espresso", hex: "#5B3A29", undertones: ["warm", "neutral"] },
  { group: "Deep", name: "Cool Cocoa", hex: "#5B4037", undertones: ["cool", "neutral"] },
  { group: "Deep", name: "Deep Bronze", hex: "#6A4634", undertones: ["olive", "warm"] }
];

const GARMENT_RULES = {
  upper: {
    shirt: {
      structure: "tailored",
      occasions: ["formal", "smart-casual", "daily"],
      bestWith: ["pant"],
      okayWith: ["shorts"],
      avoidWith: ["nightPant"]
    },
    tshirt: {
      structure: "soft",
      occasions: ["casual", "daily", "smart-casual", "home"],
      bestWith: ["pant", "shorts", "nightPant"],
      okayWith: [],
      avoidWith: []
    }
  },
  lower: {
    pant: {
      structure: "clean",
      occasions: ["formal", "smart-casual", "daily"],
      bestWith: ["shirt", "tshirt"],
      okayWith: [],
      avoidWith: []
    },
    shorts: {
      structure: "relaxed",
      occasions: ["casual", "daily", "summer"],
      bestWith: ["tshirt"],
      okayWith: ["shirt"],
      avoidWith: []
    },
    nightPant: {
      structure: "relaxed",
      occasions: ["home", "comfort", "sleep"],
      bestWith: ["tshirt"],
      okayWith: [],
      avoidWith: ["shirt"]
    }
  }
};

function showToast(message) {
  if (!toastBox) return;
  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.textContent = message;
  toastBox.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function showLoading(message = "Processing...") {
  if (loadingText) loadingText.textContent = message;
  if (loadingOverlay) loadingOverlay.classList.add("active");
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.classList.remove("active");
}

function showScreen(target) {
  [loginPage, photoPage, homePage].forEach((screen) => {
    if (screen) screen.classList.remove("active");
  });
  if (target) target.classList.add("active");
}

function cryptoRandomId() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getUserStorageKey(name, mobile) {
  return `outfitMatchUser_${String(name || "").trim().toLowerCase()}_${String(mobile || "").trim()}`;
}

function prettyCategoryLabel(category) {
  const map = {
    shirt: "Shirt",
    tshirt: "T-Shirt",
    pant: "Pant",
    nightPant: "Night Pant",
    shorts: "Shorts"
  };
  return map[category] || "Cloth";
}

function normalizeClothItem(item, category) {
  return {
    id: item?.id || cryptoRandomId(),
    label: item?.label || prettyCategoryLabel(category),
    src: item?.src || "",
    category: item?.category || category,
    analysis: item?.analysis || {
      hex: "#808080",
      family: "neutral",
      undertone: "neutral",
      rgb: { r: 128, g: 128, b: 128 }
    }
  };
}

function normalizeClothes(savedClothes = {}) {
  return {
    shirt: Array.isArray(savedClothes.shirt) ? savedClothes.shirt.map((i) => normalizeClothItem(i, "shirt")) : [],
    tshirt: Array.isArray(savedClothes.tshirt) ? savedClothes.tshirt.map((i) => normalizeClothItem(i, "tshirt")) : [],
    pant: Array.isArray(savedClothes.pant) ? savedClothes.pant.map((i) => normalizeClothItem(i, "pant")) : [],
    nightPant: Array.isArray(savedClothes.nightPant) ? savedClothes.nightPant.map((i) => normalizeClothItem(i, "nightPant")) : [],
    shorts: Array.isArray(savedClothes.shorts) ? savedClothes.shorts.map((i) => normalizeClothItem(i, "shorts")) : []
  };
}

function saveUserData() {
  if (!currentUserKey && appUser.name && appUser.mobile) {
    currentUserKey = getUserStorageKey(appUser.name, appUser.mobile);
  }
  if (!currentUserKey) return;

  localStorage.setItem(currentUserKey, JSON.stringify({
    user: appUser,
    clothes
  }));
}

function loadUserData(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resetAppForNewUser(name, mobile) {
  appUser = {
    name,
    mobile,
    photo: "",
    toneName: "",
    themeName: "",
    toneHex: "",
    undertone: "warm",
    toneProfile: null
  };

  clothes = {
    shirt: [],
    tshirt: [],
    pant: [],
    nightPant: [],
    shorts: []
  };

  uploadedFaceImage = null;
  if (previewImage) previewImage.src = "";
  if (previewArea) previewArea.style.display = "none";
  if (analyzeBtn) analyzeBtn.disabled = true;
  if (analysisResult) analysisResult.innerHTML = "No photo selected yet.";
  if (uploadInput) uploadInput.value = "";

  closeCamera();
  restoreAllGalleries();
  renderSuggestions([]);

  if (topProfileImg) topProfileImg.src = "";
  if (homeUserPhoto) homeUserPhoto.src = "";
  if (profileModalImg) profileModalImg.src = "";
  if (homeUserName) homeUserName.textContent = name || "User";
  if (homeToneName) homeToneName.textContent = "Face Tone";
  if (profileModalName) profileModalName.textContent = name || "User";
  if (profileModalTone) profileModalTone.textContent = "Face Tone: --";
  if (profileModalTheme) profileModalTheme.textContent = "Theme: --";
  if (themeLine) themeLine.textContent = "Your personal tone theme is active";
  if (skinTonePreview) skinTonePreview.style.background = "#000000";
  if (skinHexText) skinHexText.textContent = "#000000";
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 0,
    b: parseInt(clean.slice(4, 6), 16) || 0
  };
}

function brightnessOf(r, g, b) {
  return (r * 0.299) + (g * 0.587) + (b * 0.114);
}

function getBetterUndertone(r, g, b) {
  const rg = r - g;
  const rb = r - b;
  if (rb > 24 && rg > 6) return "warm";
  if (b > r + 8) return "cool";
  if (g > b + 10 && r > b + 6) return "olive";
  if (Math.abs(r - b) < 12) return "neutral";
  return "warm";
}

function guessToneGroup(brightness) {
  if (brightness >= 205) return "Fair";
  if (brightness >= 180) return "Light";
  if (brightness >= 150) return "Medium";
  if (brightness >= 120) return "Tan";
  return "Deep";
}

function nearestSkinSwatch(r, g, b, brightness, undertone) {
  const guessedGroup = guessToneGroup(brightness);
  const groupIndex = { Fair: 0, Light: 1, Medium: 2, Tan: 3, Deep: 4 };

  let best = SKIN_SWATCHES[0];
  let bestScore = Infinity;

  for (const swatch of SKIN_SWATCHES) {
    const rgb = hexToRgb(swatch.hex);
    const dr = r - rgb.r;
    const dg = g - rgb.g;
    const db = b - rgb.b;
    const distance = Math.sqrt((dr * dr * 1.12) + (dg * dg) + (db * db * 1.05));
    const groupPenalty = Math.abs(groupIndex[guessedGroup] - groupIndex[swatch.group]) * 16;
    const undertonePenalty = swatch.undertones.includes(undertone) ? 0 : 14;
    const brightnessPenalty = Math.abs(brightness - brightnessOf(rgb.r, rgb.g, rgb.b)) * 0.32;
    const score = distance + groupPenalty + undertonePenalty + brightnessPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = swatch;
    }
  }

  return best;
}

function buildPalette(group, undertone) {
  const base = {
    warm: {
      preferredFamilies: ["brown", "green", "yellow-gold", "light-neutral", "white", "dark-neutral"],
      okayFamilies: ["blue", "red", "neutral", "black"],
      avoidFamilies: ["pink-purple"]
    },
    cool: {
      preferredFamilies: ["blue", "white", "dark-neutral", "light-neutral", "red", "pink-purple"],
      okayFamilies: ["green", "neutral", "black"],
      avoidFamilies: ["orange-red", "yellow-gold"]
    },
    olive: {
      preferredFamilies: ["green", "brown", "light-neutral", "white", "dark-neutral", "neutral"],
      okayFamilies: ["blue", "red", "black"],
      avoidFamilies: ["orange-red", "yellow-gold"]
    },
    neutral: {
      preferredFamilies: ["light-neutral", "dark-neutral", "white", "blue", "green", "brown"],
      okayFamilies: ["red", "neutral", "black"],
      avoidFamilies: ["orange-red"]
    }
  }[undertone] || {
    preferredFamilies: ["light-neutral", "dark-neutral", "white", "blue", "green", "brown"],
    okayFamilies: ["red", "neutral", "black"],
    avoidFamilies: ["orange-red"]
  };

  const premiumPairs = [];

  if (undertone === "warm") {
    premiumPairs.push(["white", "brown"], ["white", "dark-neutral"], ["green", "light-neutral"], ["brown", "light-neutral"], ["yellow-gold", "dark-neutral"]);
  } else if (undertone === "cool") {
    premiumPairs.push(["blue", "white"], ["blue", "dark-neutral"], ["red", "white"], ["pink-purple", "dark-neutral"], ["white", "black"]);
  } else if (undertone === "olive") {
    premiumPairs.push(["green", "white"], ["green", "brown"], ["brown", "light-neutral"], ["blue", "light-neutral"]);
  } else {
    premiumPairs.push(["white", "dark-neutral"], ["blue", "light-neutral"], ["green", "white"], ["brown", "white"]);
  }

  if (group === "Fair" || group === "Light") {
    premiumPairs.push(["white", "blue"], ["light-neutral", "dark-neutral"]);
  }
  if (group === "Deep") {
    premiumPairs.push(["white", "black"], ["white", "brown"], ["red", "dark-neutral"]);
  }

  return {
    preferredFamilies: [...new Set(base.preferredFamilies)],
    okayFamilies: [...new Set(base.okayFamilies)],
    avoidFamilies: [...new Set(base.avoidFamilies)],
    premiumPairs
  };
}

function themeNameFor(group, undertone) {
  const map = {
    Fair: { warm: "Soft Champagne", cool: "Frost Ivory", olive: "Muted Olive Glow", neutral: "Clean Beige Luxe" },
    Light: { warm: "Warm Beige Gold", cool: "Ivory Blue", olive: "Muted Olive Luxe", neutral: "Soft Neutral Glow" },
    Medium: { warm: "Classic Bronze", cool: "Muted Slate", olive: "Olive Bronze", neutral: "Balanced Bronze" },
    Tan: { warm: "Rich Cocoa Gold", cool: "Royal Midnight", olive: "Deep Olive Gold", neutral: "Bronzed Neutral" },
    Deep: { warm: "Espresso Gold", cool: "Midnight Sapphire", olive: "Forest Bronze", neutral: "Balanced Espresso" }
  };
  return (map[group] && map[group][undertone]) || "Custom Tone Theme";
}

function buildSkinToneProfile(r, g, b, brightness, undertone) {
  const resolvedUndertone = undertone || getBetterUndertone(r, g, b);
  const swatch = nearestSkinSwatch(r, g, b, brightness, resolvedUndertone);
  const palette = buildPalette(swatch.group, resolvedUndertone);

  return {
    label: `${swatch.group} - ${swatch.name}`,
    group: swatch.group,
    swatchName: swatch.name,
    swatchHex: swatch.hex,
    undertone: resolvedUndertone,
    themeName: themeNameFor(swatch.group, resolvedUndertone),
    preferredFamilies: palette.preferredFamilies,
    okayFamilies: palette.okayFamilies,
    avoidFamilies: palette.avoidFamilies,
    premiumPairs: palette.premiumPairs,
    averageRgb: { r, g, b },
    brightness: Math.round(brightness)
  };
}

function getThemeFromToneProfile(profile) {
  const group = profile?.group || guessToneGroup(profile?.brightness || 150);
  const undertone = profile?.undertone || "warm";

  if (group === "Fair" || group === "Light") {
    if (undertone === "cool") {
      return {
        bgMain: "#EDF4FC",
        bgSecondary: "#DCE7F6",
        cardBg: "rgba(255,255,255,0.78)",
        cardBorder: "rgba(104,128,170,0.18)",
        textMain: "#182235",
        textSoft: "#5A6D8A",
        accent: "#86A3D9",
        accentDark: "#5F7DB8",
        buttonText: "#FFFFFF"
      };
    }
    return {
      bgMain: "#FAF1E6",
      bgSecondary: "#EED9BA",
      cardBg: "rgba(255,255,255,0.78)",
      cardBorder: "rgba(164,123,72,0.16)",
      textMain: "#2E2318",
      textSoft: "#775F46",
      accent: "#D6A15B",
      accentDark: "#A97834",
      buttonText: "#151515"
    };
  }

  if (group === "Medium" || group === "Tan") {
    if (undertone === "cool") {
      return {
        bgMain: "#243247",
        bgSecondary: "#314664",
        cardBg: "rgba(255,255,255,0.10)",
        cardBorder: "rgba(255,255,255,0.14)",
        textMain: "#FFFFFF",
        textSoft: "#CFD8E7",
        accent: "#8AA6D7",
        accentDark: "#5D79A9",
        buttonText: "#FFFFFF"
      };
    }
    return {
      bgMain: "#2F241D",
      bgSecondary: "#4D3728",
      cardBg: "rgba(255,255,255,0.10)",
      cardBorder: "rgba(255,255,255,0.14)",
      textMain: "#FFFFFF",
      textSoft: "#DDD2C8",
      accent: "#C68B53",
      accentDark: "#8C5A2E",
      buttonText: "#FFFFFF"
    };
  }

  if (undertone === "cool") {
    return {
      bgMain: "#111826",
      bgSecondary: "#1F2B40",
      cardBg: "rgba(255,255,255,0.08)",
      cardBorder: "rgba(255,255,255,0.12)",
      textMain: "#FFFFFF",
      textSoft: "#C6D0E0",
      accent: "#6F8EC7",
      accentDark: "#45639E",
      buttonText: "#FFFFFF"
    };
  }

  return {
    bgMain: "#1B120F",
    bgSecondary: "#31201A",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.12)",
    textMain: "#FFFFFF",
    textSoft: "#D9CBC0",
    accent: "#B97B43",
    accentDark: "#7B4E28",
    buttonText: "#FFFFFF"
  };
}

function applyTheme(result) {
  const vars = result?.vars || getThemeFromToneProfile(result?.toneProfile || appUser.toneProfile);
  if (!vars) return;
  const root = document.documentElement;
  root.style.setProperty("--bg-main", vars.bgMain);
  root.style.setProperty("--bg-secondary", vars.bgSecondary);
  root.style.setProperty("--card-bg", vars.cardBg);
  root.style.setProperty("--card-border", vars.cardBorder);
  root.style.setProperty("--text-main", vars.textMain);
  root.style.setProperty("--text-soft", vars.textSoft);
  root.style.setProperty("--accent", vars.accent);
  root.style.setProperty("--accent-dark", vars.accentDark);
  root.style.setProperty("--button-text", vars.buttonText);
  root.style.setProperty("--tone-preview", result?.hex || appUser.toneHex || "#000000");
}

function fillUserData() {
  if (appUser.photo) {
    if (topProfileImg) topProfileImg.src = appUser.photo;
    if (homeUserPhoto) homeUserPhoto.src = appUser.photo;
    if (profileModalImg) profileModalImg.src = appUser.photo;
  }

  if (homeUserName) homeUserName.textContent = appUser.name || "User";
  if (homeToneName) homeToneName.textContent = appUser.toneName ? `${appUser.toneName} • ${appUser.themeName}` : "Face Tone";
  if (themeLine) themeLine.textContent = appUser.themeName ? `Theme style: ${appUser.themeName}` : "Your personal tone theme is active";
  if (profileModalName) profileModalName.textContent = appUser.name || "User";
  if (profileModalTone) profileModalTone.textContent = `Face Tone: ${appUser.toneName || "--"}`;
  if (profileModalTheme) profileModalTheme.textContent = `Theme: ${appUser.themeName || "--"}`;
  if (skinTonePreview) skinTonePreview.style.background = appUser.toneHex || "#000000";
  if (skinHexText) skinHexText.textContent = appUser.toneHex || "#000000";

  if (analysisResult) {
    const preferred = appUser.toneProfile?.preferredFamilies?.join(", ") || "Not available";
    analysisResult.innerHTML = appUser.toneName ? `
      Face tone detected successfully.<br>
      Tone: <strong>${appUser.toneName}</strong><br>
      Undertone: <strong>${appUser.undertone}</strong><br>
      Theme: <strong>${appUser.themeName}</strong><br>
      Color: <strong>${appUser.toneHex}</strong><br>
      Best colors for you: <strong>${preferred}</strong>
    ` : "No photo selected yet.";
  }
}

function prepareCanvas(img, maxWidth = 480) {
  if (!imageCanvas || !imageCtx) return null;
  const scale = Math.min(1, maxWidth / img.width);
  imageCanvas.width = Math.max(1, Math.floor(img.width * scale));
  imageCanvas.height = Math.max(1, Math.floor(img.height * scale));
  imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
  return { width: imageCanvas.width, height: imageCanvas.height, scale };
}

function analyzeSkinPixels(data) {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  const values = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 210) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    const isSkinLike = (
      r > 42 && g > 24 && b > 16 &&
      r > g && r > b &&
      diff > 10 &&
      Math.abs(r - g) > 3 &&
      !(r > 245 && g > 245 && b > 245)
    );

    if (!isSkinLike) continue;

    totalR += r;
    totalG += g;
    totalB += b;
    count += 1;
    values.push((r + g + b) / 3);
  }

  if (!count) {
    return { avgR: 0, avgG: 0, avgB: 0, validCount: 0, skinRatio: 0, variance: 0 };
  }

  const avgR = Math.round(totalR / count);
  const avgG = Math.round(totalG / count);
  const avgB = Math.round(totalB / count);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;

  return {
    avgR,
    avgG,
    avgB,
    validCount: count,
    skinRatio: count / (data.length / 4),
    variance: Math.sqrt(variance)
  };
}

function faceBoxLooksValid(face, width, height) {
  if (!face) return false;
  const areaRatio = (face.width * face.height) / (width * height);
  const centerX = face.x + (face.width / 2);
  const centerY = face.y + (face.height / 2);

  if (face.width < 60 || face.height < 60) return false;
  if (areaRatio < 0.05 || areaRatio > 0.72) return false;
  if (centerX < width * 0.18 || centerX > width * 0.82) return false;
  if (centerY < height * 0.18 || centerY > height * 0.75) return false;
  return true;
}

function toneFromFaceRegion(x, y, w, h) {
  if (!imageCtx || !imageCanvas) return { isValidFace: false };
  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const sw = Math.max(1, Math.min(imageCanvas.width - sx, Math.floor(w)));
  const sh = Math.max(1, Math.min(imageCanvas.height - sy, Math.floor(h)));
  const data = imageCtx.getImageData(sx, sy, sw, sh).data;
  const metrics = analyzeSkinPixels(data);

  if (metrics.skinRatio < 0.10 || metrics.validCount < 260 || metrics.variance < 5.5) {
    return { isValidFace: false };
  }

  const brightness = brightnessOf(metrics.avgR, metrics.avgG, metrics.avgB);
  const undertone = getBetterUndertone(metrics.avgR, metrics.avgG, metrics.avgB);
  const toneProfile = buildSkinToneProfile(metrics.avgR, metrics.avgG, metrics.avgB, brightness, undertone);

  return {
    isValidFace: true,
    toneName: toneProfile.label,
    themeName: toneProfile.themeName,
    hex: rgbToHex(metrics.avgR, metrics.avgG, metrics.avgB),
    undertone,
    toneProfile,
    vars: getThemeFromToneProfile(toneProfile)
  };
}

async function tryBrowserFaceDetection(img) {
  if (!("FaceDetector" in window)) return { isValidFace: false };

  try {
    const detector = new FaceDetector({ fastMode: false, maxDetectedFaces: 2 });
    const faces = await detector.detect(img);
    if (!faces || faces.length !== 1) return { isValidFace: false };

    const prepared = prepareCanvas(img, 560);
    if (!prepared) return { isValidFace: false };

    const raw = faces[0].boundingBox;
    const face = {
      x: raw.x * prepared.scale,
      y: raw.y * prepared.scale,
      width: raw.width * prepared.scale,
      height: raw.height * prepared.scale
    };

    if (!faceBoxLooksValid(face, prepared.width, prepared.height)) return { isValidFace: false };

    return toneFromFaceRegion(
      face.x + (face.width * 0.18),
      face.y + (face.height * 0.14),
      face.width * 0.64,
      face.height * 0.62
    );
  } catch {
    return { isValidFace: false };
  }
}

function detectApproxFaceToneStrict(img) {
  const prepared = prepareCanvas(img, 440);
  if (!prepared) return { isValidFace: false };

  const { width, height } = prepared;
  const regions = [
    { x: 0.34, y: 0.10, w: 0.14, h: 0.16 },
    { x: 0.43, y: 0.10, w: 0.14, h: 0.16 },
    { x: 0.34, y: 0.24, w: 0.14, h: 0.16 },
    { x: 0.43, y: 0.24, w: 0.14, h: 0.16 },
    { x: 0.38, y: 0.15, w: 0.16, h: 0.18 }
  ];

  let validRegions = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalCount = 0;

  for (const region of regions) {
    const data = imageCtx.getImageData(
      Math.floor(width * region.x),
      Math.floor(height * region.y),
      Math.floor(width * region.w),
      Math.floor(height * region.h)
    ).data;

    const metrics = analyzeSkinPixels(data);
    if (metrics.skinRatio > 0.18 && metrics.validCount > 120 && metrics.variance > 6.5) {
      validRegions += 1;
      totalR += metrics.avgR * metrics.validCount;
      totalG += metrics.avgG * metrics.validCount;
      totalB += metrics.avgB * metrics.validCount;
      totalCount += metrics.validCount;
    }
  }

  if (validRegions < 3 || totalCount < 420) {
    return { isValidFace: false };
  }

  const avgR = Math.round(totalR / totalCount);
  const avgG = Math.round(totalG / totalCount);
  const avgB = Math.round(totalB / totalCount);
  const brightness = brightnessOf(avgR, avgG, avgB);
  const undertone = getBetterUndertone(avgR, avgG, avgB);
  const toneProfile = buildSkinToneProfile(avgR, avgG, avgB, brightness, undertone);

  return {
    isValidFace: true,
    toneName: toneProfile.label,
    themeName: toneProfile.themeName,
    hex: rgbToHex(avgR, avgG, avgB),
    undertone,
    toneProfile,
    vars: getThemeFromToneProfile(toneProfile)
  };
}

async function detectFaceAndTone(img) {
  if (!img || !img.width || !img.height) return { isValidFace: false };
  if (Math.min(img.width, img.height) < 120) return { isValidFace: false };

  const browserResult = await tryBrowserFaceDetection(img);
  if (browserResult.isValidFace) return browserResult;

  return detectApproxFaceToneStrict(img);
}

function getColorFamily(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const brightness = brightnessOf(r, g, b);

  if (brightness < 42) return "black";
  if (brightness > 232 && diff < 16) return "white";
  if (diff < 15) return brightness > 150 ? "light-neutral" : "dark-neutral";

  if (r > 165 && g > 135 && b < 110) return "yellow-gold";
  if (r > 130 && g > 100 && b > 65 && Math.abs(r - g) < 42) return "brown";
  if (r > g + 24 && r > b + 24) return g > 95 ? "orange-red" : "red";
  if (g > r + 14 && g > b + 12) return "green";
  if (b > r + 14 && b > g + 10) return "blue";
  if (r > 145 && b > 125 && g < 140) return "pink-purple";
  return "neutral";
}

function detectAverageClothColor(img) {
  const prepared = prepareCanvas(img, 320);
  if (!prepared) {
    return { hex: "#808080", family: "neutral", undertone: "neutral", rgb: { r: 128, g: 128, b: 128 } };
  }

  const { width, height } = prepared;
  const data = imageCtx.getImageData(0, 0, width, height).data;
  const x1 = Math.floor(width * 0.18);
  const x2 = Math.floor(width * 0.82);
  const y1 = Math.floor(height * 0.12);
  const y2 = Math.floor(height * 0.88);

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let y = y1; y < y2; y += 1) {
    for (let x = x1; x < x2; x += 1) {
      const i = ((y * width) + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 210) continue;
      if (r > 245 && g > 245 && b > 245) continue;
      if (r < 6 && g < 6 && b < 6) continue;
      totalR += r;
      totalG += g;
      totalB += b;
      count += 1;
    }
  }

  if (count < 100) {
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count += 1;
    }
  }

  const avgR = Math.round(totalR / Math.max(1, count));
  const avgG = Math.round(totalG / Math.max(1, count));
  const avgB = Math.round(totalB / Math.max(1, count));

  return {
    hex: rgbToHex(avgR, avgG, avgB),
    family: getColorFamily(avgR, avgG, avgB),
    undertone: getBetterUndertone(avgR, avgG, avgB),
    rgb: { r: avgR, g: avgG, b: avgB }
  };
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function handleMultiClothUpload(files, keyName, galleryEl, label, loadingMessage) {
  if (!files || !files.length) return;

  showLoading(loadingMessage);
  try {
    for (const file of files) {
      const src = await fileToDataURL(file);
      const img = await loadImage(src);
      const analysis = detectAverageClothColor(img);
      clothes[keyName].push({
        id: cryptoRandomId(),
        label,
        category: keyName,
        src,
        analysis
      });
    }
    saveUserData();
    renderGallery(keyName, galleryEl);
    generateSuggestions();
    showToast(`${label} uploaded`);
  } catch {
    showToast(`Could not upload ${label.toLowerCase()}`);
  } finally {
    hideLoading();
  }
}

function setupMultiClothUpload(inputEl, keyName, galleryEl, label, loadingMessage) {
  if (!inputEl) return;
  inputEl.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    await handleMultiClothUpload(files, keyName, galleryEl, label, loadingMessage);
    inputEl.value = "";
  });
}

function renderGallery(category, galleryEl) {
  if (!galleryEl) return;
  galleryEl.innerHTML = "";

  clothes[category].forEach((item) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb-item";
    thumb.innerHTML = `
      <img src="${item.src}" alt="${item.label}">
      <button class="thumb-remove" type="button">×</button>
    `;

    const btn = thumb.querySelector(".thumb-remove");
    if (btn) {
      btn.addEventListener("click", () => {
        clothes[category] = clothes[category].filter((cloth) => cloth.id !== item.id);
        saveUserData();
        renderGallery(category, galleryEl);
        generateSuggestions();
        showToast(`${item.label} removed`);
      });
    }

    galleryEl.appendChild(thumb);
  });
}

function restoreAllGalleries() {
  renderGallery("shirt", shirtGallery);
  renderGallery("tshirt", tshirtGallery);
  renderGallery("pant", pantGallery);
  renderGallery("nightPant", nightPantGallery);
  renderGallery("shorts", shortsGallery);
}

function getToneLevel(colorFamily, toneProfile) {
  if (!toneProfile) return "okay";
  if (toneProfile.preferredFamilies.includes(colorFamily)) return "best";
  if (toneProfile.okayFamilies.includes(colorFamily)) return "okay";
  if (toneProfile.avoidFamilies.includes(colorFamily)) return "avoid";
  return "avoid";
}

function getGarmentKnowledge(item) {
  if (!item || !item.category) return null;
  return GARMENT_RULES.upper[item.category] || GARMENT_RULES.lower[item.category] || null;
}

function getGarmentPairStrength(upper, lower) {
  const upperInfo = getGarmentKnowledge(upper);
  const lowerInfo = getGarmentKnowledge(lower);
  if (!upperInfo || !lowerInfo) return -10;
  if (upperInfo.avoidWith?.includes(lower.category)) return -80;
  if (lowerInfo.avoidWith?.includes(upper.category)) return -80;
  if (upperInfo.bestWith?.includes(lower.category)) return 30;
  if (lowerInfo.bestWith?.includes(upper.category)) return 30;
  if (upperInfo.okayWith?.includes(lower.category)) return 10;
  if (lowerInfo.okayWith?.includes(upper.category)) return 10;
  return -10;
}

function getOccasionOverlapScore(upper, lower) {
  const upperOcc = getGarmentKnowledge(upper)?.occasions || [];
  const lowerOcc = getGarmentKnowledge(lower)?.occasions || [];
  const overlap = upperOcc.filter((v) => lowerOcc.includes(v));
  if (overlap.length >= 2) return 18;
  if (overlap.length === 1) return 10;
  return -8;
}

function getColorDistance(hex1, hex2) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt((dr * dr) + (dg * dg) + (db * db));
}

function matchesPairList(a, b, list) {
  return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function isNeutralFamily(family) {
  return ["black", "white", "light-neutral", "dark-neutral", "neutral", "brown"].includes(family);
}

function getContrastScore(upper, lower) {
  const distance = getColorDistance(upper.analysis.hex, lower.analysis.hex);
  if (distance >= 45 && distance <= 120) return 18;
  if (distance > 120 && distance <= 170) return 12;
  if (distance >= 25 && distance < 45) return 10;
  if (distance > 170 && distance <= 210) return 4;
  return 2;
}

function getStylePolishScore(upper, lower) {
  let score = 0;
  if (upper.category === "shirt" && lower.category === "pant") score += 18;
  if (upper.category === "tshirt" && lower.category === "pant") score += 12;
  if (upper.category === "tshirt" && lower.category === "shorts") score += 12;
  if (upper.category === "tshirt" && lower.category === "nightPant") score += 6;
  if (upper.category === "shirt" && lower.category === "shorts") score -= 8;
  if (upper.category === "shirt" && lower.category === "nightPant") score -= 90;
  return score;
}

function getToneBeautyScore(upper, lower, toneProfile) {
  const upperLevel = getToneLevel(upper.analysis.family, toneProfile);
  const lowerLevel = getToneLevel(lower.analysis.family, toneProfile);
  if (upperLevel === "avoid" || lowerLevel === "avoid") return -100;

  let score = 0;
  if (upperLevel === "best") score += 28;
  else if (upperLevel === "okay") score += 10;

  if (lowerLevel === "best") score += 20;
  else if (lowerLevel === "okay") score += 8;

  if (upperLevel === "best" && lowerLevel === "best") score += 14;
  if (toneProfile?.undertone === upper.analysis.undertone) score += 8;
  if (toneProfile?.undertone === lower.analysis.undertone) score += 6;
  return score;
}

function getPremiumTrendBoost(upper, lower, toneProfile) {
  let score = 0;
  const pair = [upper.analysis.family, lower.analysis.family];

  const globalPairs = [
    ["white", "black"],
    ["white", "blue"],
    ["blue", "dark-neutral"],
    ["blue", "white"],
    ["brown", "light-neutral"],
    ["green", "white"],
    ["green", "brown"],
    ["red", "white"],
    ["pink-purple", "dark-neutral"],
    ["yellow-gold", "dark-neutral"]
  ];

  if (matchesPairList(pair[0], pair[1], globalPairs)) score += 14;
  if (toneProfile?.premiumPairs && matchesPairList(pair[0], pair[1], toneProfile.premiumPairs)) score += 16;
  if (isNeutralFamily(lower.analysis.family) && !isNeutralFamily(upper.analysis.family)) score += 8;
  if (upper.analysis.family === lower.analysis.family && !isNeutralFamily(upper.analysis.family)) score += 2;
  return score;
}

function getImprovedMasterScore(upper, lower, toneProfile) {
  const toneScore = getToneBeautyScore(upper, lower, toneProfile);
  if (toneScore < 0) return 0;

  const garmentScore = getGarmentPairStrength(upper, lower);
  if (garmentScore <= -80) return 0;

  let score = 0;
  score += toneScore;
  score += garmentScore;
  score += getOccasionOverlapScore(upper, lower);
  score += getContrastScore(upper, lower);
  score += getStylePolishScore(upper, lower);
  score += getPremiumTrendBoost(upper, lower, toneProfile);

  if (isNeutralFamily(upper.analysis.family) && isNeutralFamily(lower.analysis.family)) score += 8;
  if (upper.analysis.undertone === lower.analysis.undertone) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getBetterOutfitMode(upper, lower) {
  const pairStrength = getGarmentPairStrength(upper, lower);
  if (pairStrength >= 28 && upper.category === "shirt" && lower.category === "pant") return "smart";
  if (pairStrength >= 28 && upper.category === "tshirt" && lower.category === "pant") return "smart-casual";
  if (pairStrength >= 28 && upper.category === "tshirt" && lower.category === "shorts") return "casual";
  if (pairStrength >= 10 && upper.category === "tshirt" && lower.category === "nightPant") return "home";
  return "mixed";
}

function getImprovedReason(upper, lower, score, toneProfile) {
  const reasons = [];
  const upperLevel = getToneLevel(upper.analysis.family, toneProfile);
  const lowerLevel = getToneLevel(lower.analysis.family, toneProfile);
  const mode = getBetterOutfitMode(upper, lower);

  if (score >= 92) reasons.push("Outstanding match for your face tone and outfit balance");
  else if (score >= 84) reasons.push("Very strong skin-tone-friendly outfit");
  else reasons.push("Good attractive outfit suggestion");

  if (upperLevel === "best") reasons.push(`the ${upper.label.toLowerCase()} color suits your complexion very well`);
  if (lowerLevel === "best") reasons.push(`the ${lower.label.toLowerCase()} color also fits your tone`);
  if (mode === "smart") reasons.push("this has a polished smart outfit structure");
  if (mode === "smart-casual") reasons.push("this gives a balanced smart-casual look");
  if (mode === "casual") reasons.push("this works as a clean casual outfit");
  if (mode === "home") reasons.push("this works better as a comfort outfit");
  if (toneProfile?.premiumPairs && matchesPairList(upper.analysis.family, lower.analysis.family, toneProfile.premiumPairs)) {
    reasons.push("this is one of your premium trending color pairings");
  }

  return `${reasons.join(". ")}.`;
}

function renderSuggestions(combos) {
  if (!suggestionGrid || !suggestionEmptyState) return;
  suggestionGrid.innerHTML = "";

  if (!combos.length) {
    suggestionEmptyState.style.display = "block";
    suggestionEmptyState.textContent = "Upload at least one upper wear and one lower wear to get matching suggestions.";
    return;
  }

  suggestionEmptyState.style.display = "none";
  const frag = document.createDocumentFragment();

  combos.forEach((combo, index) => {
    const badgeText = index === 0 ? "Best Match" : index < 5 ? `Top Match ${index + 1}` : `Match ${index + 1}`;
    const mode = getBetterOutfitMode(combo.upper, combo.lower);
    const card = document.createElement("div");
    card.className = "suggestion-card";
    card.innerHTML = `
      <div class="suggestion-top">
        <div>
          <h4>${badgeText}</h4>
          <p>${combo.upper.label} + ${combo.lower.label}</p>
        </div>
        <div class="suggestion-score">${combo.score}/100</div>
      </div>
      <div class="combo-row">
        <div class="combo-piece">
          <img src="${combo.upper.src}" alt="${combo.upper.label}">
          <h5>${combo.upper.label}</h5>
          <p>${combo.upper.analysis.family}<br>${combo.upper.analysis.hex}</p>
        </div>
        <div class="combo-piece">
          <img src="${combo.lower.src}" alt="${combo.lower.label}">
          <h5>${combo.lower.label}</h5>
          <p>${combo.lower.analysis.family}<br>${combo.lower.analysis.hex}</p>
        </div>
      </div>
      <div class="reason-box"><strong>Style:</strong> ${mode}<br>${combo.reason}</div>
    `;
    frag.appendChild(card);
  });

  suggestionGrid.appendChild(frag);
}

function generateSuggestions() {
  const uppers = [...clothes.shirt, ...clothes.tshirt];
  const lowers = [...clothes.pant, ...clothes.nightPant, ...clothes.shorts];
  const toneProfile = appUser.toneProfile;

  if (!uppers.length || !lowers.length) {
    renderSuggestions([]);
    return;
  }

  const combos = [];
  const seen = new Set();

  for (const upper of uppers) {
    for (const lower of lowers) {
      const score = getImprovedMasterScore(upper, lower, toneProfile);
      if (score < 45) continue;

      const key = [
        upper.category,
        upper.analysis.family,
        upper.analysis.hex,
        lower.category,
        lower.analysis.family,
        lower.analysis.hex
      ].join("|");

      if (seen.has(key)) continue;
      seen.add(key);

      combos.push({
        upper,
        lower,
        score,
        reason: getImprovedReason(upper, lower, score, toneProfile)
      });
    }
  }

  combos.sort((a, b) => b.score - a.score);
  renderSuggestions(combos);
}

function clearCategory(category, galleryEl, label) {
  clothes[category] = [];
  saveUserData();
  renderGallery(category, galleryEl);
  generateSuggestions();
  showToast(`${label} cleared`);
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    if (analysisResult) analysisResult.innerHTML = "Camera is not supported on this device.";
    return;
  }

  try {
    stopCameraTracks();
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    if (cameraVideo) cameraVideo.srcObject = cameraStream;
    if (cameraBox) cameraBox.classList.add("active");
    if (analysisResult) analysisResult.innerHTML = "Camera opened. Keep only one clear face in the frame.";
  } catch {
    if (analysisResult) analysisResult.innerHTML = "Unable to open camera. Please allow camera access or use Upload Photo.";
  }
}

function stopCameraTracks() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function closeCamera() {
  stopCameraTracks();
  if (cameraBox) cameraBox.classList.remove("active");
}

function captureSelfie() {
  if (!cameraVideo || !cameraCanvas || !cameraVideo.videoWidth || !cameraVideo.videoHeight) {
    if (analysisResult) analysisResult.innerHTML = "Camera is not ready yet.";
    return;
  }

  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;
  const ctx = cameraCanvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

  uploadedFaceImage = cameraCanvas.toDataURL("image/jpeg", 0.92);
  if (previewImage) previewImage.src = uploadedFaceImage;
  if (previewArea) previewArea.style.display = "block";
  if (analyzeBtn) analyzeBtn.disabled = false;
  if (analysisResult) analysisResult.innerHTML = "Selfie captured. Now click Detect Face Tone.";
  closeCamera();
}

function removeSelectedPhoto() {
  if (uploadInput) uploadInput.value = "";
  uploadedFaceImage = null;
  if (previewImage) previewImage.src = "";
  if (previewArea) previewArea.style.display = "none";
  if (analyzeBtn) analyzeBtn.disabled = true;
  if (analysisResult) analysisResult.innerHTML = "No photo selected yet.";
  closeCamera();
}

async function analyzeUploadedFace() {
  if (!uploadedFaceImage) return;
  showLoading("Detecting face tone...");

  try {
    const img = await loadImage(uploadedFaceImage);
    const result = await detectFaceAndTone(img);
    if (!result.isValidFace) {
      if (analysisResult) {
        analysisResult.innerHTML = "Face not detected clearly.<br>Please upload only one clear front-face selfie or portrait photo.";
      }
      showToast("Face photo not accepted");
      return;
    }

    appUser.photo = uploadedFaceImage;
    appUser.toneName = result.toneName;
    appUser.themeName = result.themeName;
    appUser.toneHex = result.hex;
    appUser.undertone = result.undertone;
    appUser.toneProfile = result.toneProfile;

    applyTheme(result);
    fillUserData();
    saveUserData();
    generateSuggestions();
    showToast("Face tone detected");
    showScreen(homePage);
  } catch {
    if (analysisResult) analysisResult.textContent = "Could not analyze the photo.";
  } finally {
    hideLoading();
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = String(userNameInput?.value || "").trim();
    const mobile = String(mobileInput?.value || "").trim();

    if (name.length < 2) {
      if (loginError) loginError.textContent = "Please enter your name.";
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      if (loginError) loginError.textContent = "Please enter a valid 10 digit mobile number.";
      return;
    }

    if (loginError) loginError.textContent = "";
    currentUserKey = getUserStorageKey(name, mobile);
    const savedData = loadUserData(currentUserKey);

    if (savedData?.user) {
      appUser = savedData.user;
      clothes = normalizeClothes(savedData.clothes || {});

      if (!appUser.toneProfile && appUser.toneHex) {
        const rgb = hexToRgb(appUser.toneHex);
        const brightness = brightnessOf(rgb.r, rgb.g, rgb.b);
        appUser.toneProfile = buildSkinToneProfile(rgb.r, rgb.g, rgb.b, brightness, appUser.undertone || "warm");
      }

      if (appUser.toneProfile) {
        applyTheme({ hex: appUser.toneHex, toneProfile: appUser.toneProfile });
      }

      fillUserData();
      restoreAllGalleries();
      generateSuggestions();
      showToast("Welcome back");
      showScreen(homePage);
      return;
    }

    resetAppForNewUser(name, mobile);
    saveUserData();
    showScreen(photoPage);
  });
}

if (openCameraBtn) openCameraBtn.addEventListener("click", openCamera);
if (closeCameraBtn) closeCameraBtn.addEventListener("click", closeCamera);
if (captureSelfieBtn) captureSelfieBtn.addEventListener("click", captureSelfie);
if (removePhotoBtn) removePhotoBtn.addEventListener("click", removeSelectedPhoto);
if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeUploadedFace);

if (uploadInput) {
  uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadedFaceImage = await fileToDataURL(file);
    if (previewImage) previewImage.src = uploadedFaceImage;
    if (previewArea) previewArea.style.display = "block";
    if (analyzeBtn) analyzeBtn.disabled = false;
    if (analysisResult) analysisResult.innerHTML = "Photo selected. Now click Detect Face Tone.";
  });
}

setupMultiClothUpload(shirtInput, "shirt", shirtGallery, "Shirt", "Analyzing shirts...");
setupMultiClothUpload(tshirtInput, "tshirt", tshirtGallery, "T-Shirt", "Analyzing t-shirts...");
setupMultiClothUpload(pantInput, "pant", pantGallery, "Pant", "Analyzing pants...");
setupMultiClothUpload(nightPantInput, "nightPant", nightPantGallery, "Night Pant", "Analyzing night pants...");
setupMultiClothUpload(shortsInput, "shorts", shortsGallery, "Shorts", "Analyzing shorts...");

if (clearShirtsBtn) clearShirtsBtn.addEventListener("click", () => clearCategory("shirt", shirtGallery, "Shirts"));
if (clearTshirtsBtn) clearTshirtsBtn.addEventListener("click", () => clearCategory("tshirt", tshirtGallery, "T-Shirts"));
if (clearPantsBtn) clearPantsBtn.addEventListener("click", () => clearCategory("pant", pantGallery, "Pants"));
if (clearNightPantsBtn) clearNightPantsBtn.addEventListener("click", () => clearCategory("nightPant", nightPantGallery, "Night pants"));
if (clearShortsBtn) clearShortsBtn.addEventListener("click", () => clearCategory("shorts", shortsGallery, "Shorts"));

if (clothSearchInput) {
  clothSearchInput.value = "";
  clothSearchInput.style.display = "none";
  const wrap = clothSearchInput.closest(".search-box, .search-wrap, .search-container, .field, .input-group") || clothSearchInput.parentElement;
  if (wrap) wrap.style.display = "none";
}

if (profileBtn) profileBtn.addEventListener("click", () => profileModal?.classList.add("active"));
if (closeProfileBtn) closeProfileBtn.addEventListener("click", () => profileModal?.classList.remove("active"));
if (profileModal) {
  profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) profileModal.classList.remove("active");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    profileModal?.classList.remove("active");
    closeCamera();
    if (userNameInput) userNameInput.value = "";
    if (mobileInput) mobileInput.value = "";
    if (loginError) loginError.textContent = "";
    removeSelectedPhoto();
    showScreen(loginPage);
    showToast("Logged out");
  });
}

window.addEventListener("beforeunload", stopCameraTracks);
showScreen(loginPage);
/* ========= OUTFIT MATCH FAVORITES - CLEAN FAVORITES VIEW PATCH ========= */
(function () {
  if (window.__OM_CLEAN_FAV_PATCH__) return;
  window.__OM_CLEAN_FAV_PATCH__ = true;

  function byId(id) {
    return document.getElementById(id);
  }

  const homePage = byId("homePage");
  const loginPage = byId("loginPage");
  const photoPage = byId("photoPage");
  const profileBtn = byId("profileBtn");
  const suggestionGrid = byId("suggestionGrid");

  if (!homePage || !profileBtn || !suggestionGrid) return;

  const HANGER_ICON = `
    <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true">
      <path d="M32 14c0-5 4-8 8-8 4 0 7 3 7 7 0 3-1 5-4 7l-4 3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M35 23 12 39c-3 2-2 7 2 7h36c4 0 5-5 2-7L29 23" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  function getUserStorageKey() {
    const homeName = byId("homeUserName") ? (byId("homeUserName").textContent || "").trim() : "";
    const loginName = byId("userName") ? (byId("userName").value || "").trim() : "";
    const mobile = byId("mobile") ? (byId("mobile").value || "").trim() : "";
    const finalName = (homeName || loginName || "user").toLowerCase().replace(/\s+/g, "_");
    const finalMobile = mobile || "default";
    return "om_favorites_clean_" + finalName + "_" + finalMobile;
  }

  function readFavorites() {
    try {
      return JSON.parse(localStorage.getItem(getUserStorageKey()) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(getUserStorageKey(), JSON.stringify(list));
    } catch (e) {}
  }

  function toast(msg) {
    if (typeof window.showToast === "function") {
      window.showToast(msg);
      return;
    }
    const box = byId("toastBox");
    if (!box) return;
    box.textContent = msg;
    box.classList.add("show");
    clearTimeout(window.__omCleanFavToastTimer);
    window.__omCleanFavToastTimer = setTimeout(function () {
      box.classList.remove("show");
    }, 1400);
  }

  function isHomeActive() {
    return homePage.classList.contains("active");
  }

  function isLoginActive() {
    return loginPage ? loginPage.classList.contains("active") : false;
  }

  function isPhotoActive() {
    return photoPage ? photoPage.classList.contains("active") : false;
  }

  function canShowLauncher() {
    return isHomeActive() && !isLoginActive() && !isPhotoActive();
  }

  function ensureLauncher() {
    let launcher = byId("favoritesLauncher");
    if (launcher) return launcher;

    launcher = document.createElement("button");
    launcher.id = "favoritesLauncher";
    launcher.type = "button";
    launcher.innerHTML = HANGER_ICON;
    launcher.setAttribute("aria-label", "Open favorites");

    launcher.style.width = "44px";
    launcher.style.height = "44px";
    launcher.style.border = "none";
    launcher.style.borderRadius = "12px";
    launcher.style.cursor = "pointer";
    launcher.style.marginRight = "10px";
    launcher.style.background = "rgba(255,255,255,0.18)";
    launcher.style.color = "#ffffff";
    launcher.style.boxShadow = "0 8px 18px rgba(0,0,0,0.14)";
    launcher.style.display = "none";
    launcher.style.alignItems = "center";
    launcher.style.justifyContent = "center";
    launcher.style.verticalAlign = "middle";

    profileBtn.parentNode.insertBefore(launcher, profileBtn);
    return launcher;
  }

  function ensureFavoritesPage() {
    let page = byId("favoritesPage");
    if (page) return page;

    page = document.createElement("section");
    page.id = "favoritesPage";
    page.className = "screen";
    page.innerHTML =
      '<header class="topbar">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<button id="favoritesBackBtn" type="button" style="border:none;border-radius:12px;padding:10px 14px;cursor:pointer;background:rgba(255,255,255,0.18);box-shadow:0 8px 20px rgba(0,0,0,0.14);">← Back</button>' +
          '<div>' +
            '<h2>Favorite Outfits</h2>' +
            '<p>Your saved selected looks</p>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<main class="home-main">' +
        '<section class="glass-card suggestion-section">' +
          '<div class="section-title-row">' +
            '<h3>Saved Favorites</h3>' +
            '<p>Only the outfits you selected</p>' +
          '</div>' +
          '<div id="favoritesEmptyState" class="suggestion-empty">No favorite outfits yet. Tap the hanger icon on any suggestion card.</div>' +
          '<div id="favoritesGrid" class="suggestion-grid"></div>' +
        '</section>' +
      '</main>';

    homePage.parentNode.insertBefore(page, homePage.nextSibling);
    return page;
  }

  const launcher = ensureLauncher();
  const favoritesPage = ensureFavoritesPage();

  function setLauncherVisibility() {
    launcher.style.display = canShowLauncher() ? "inline-flex" : "none";
  }

  function getCardUniqueId(card, index) {
    if (card.dataset.omFavUid) return card.dataset.omFavUid;

    const imgs = Array.from(card.querySelectorAll("img")).map(function (img) {
      return img.src || "";
    }).join("|");

    const txt = (card.textContent || "").replace(/\s+/g, " ").trim().slice(0, 500);
    const uid = "om_card_" + index + "_" + imgs.length + "_" + txt.length + "_" + Math.random().toString(36).slice(2, 10);
    card.dataset.omFavUid = uid;
    return uid;
  }

  function favoriteExists(id) {
    const list = readFavorites();
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return true;
    }
    return false;
  }

  function removeScoreAndSaveUI(root) {
    if (!root) return;

    const removableSelectors = [
      ".om-hanger-btn",
      ".favorite-btn",
      ".save-btn",
      ".fav-btn",
      ".like-btn",
      "[data-favorite]",
      "[data-score]",
      ".score",
      ".score-badge",
      ".score-chip",
      ".score-tag",
      ".match-score",
      ".outfit-score",
      ".suggestion-score"
    ];

    removableSelectors.forEach(function (selector) {
      root.querySelectorAll(selector).forEach(function (el) {
        el.remove();
      });
    });

    root.querySelectorAll("*").forEach(function (el) {
      const text = (el.textContent || "").trim().toLowerCase();

      if (!text) return;

      const looksLikeScore =
        text === "score" ||
        text.indexOf("score:") !== -1 ||
        text.indexOf("match score") !== -1 ||
        text.indexOf("outfit score") !== -1 ||
        /^score\s*\d+/i.test(text) ||
        /^\d+\s*\/\s*100$/.test(text) ||
        /^\d+\s*%$/.test(text);

      const looksLikeSavedIconText =
        text === "save" ||
        text === "saved" ||
        text === "favorite" ||
        text === "favourite";

      if (looksLikeScore || looksLikeSavedIconText) {
        if (!el.querySelector("img")) {
          el.remove();
        }
      }
    });
  }

  function addFavorite(card) {
    const id = card.dataset.omFavUid;
    if (!id || favoriteExists(id)) return;

    const list = readFavorites();
    const clone = card.cloneNode(true);

    removeScoreAndSaveUI(clone);

    list.unshift({
      id: id,
      html: clone.innerHTML
    });

    saveFavorites(list);
  }

  function removeFavorite(id) {
    const list = readFavorites().filter(function (item) {
      return item.id !== id;
    });
    saveFavorites(list);
  }

  function styleHangerButton(btn, active) {
    btn.style.position = "absolute";
    btn.style.top = "10px";
    btn.style.left = "50%";
    btn.style.transform = "translateX(-50%)";
    btn.style.width = "44px";
    btn.style.height = "44px";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "6";
    btn.style.background = "rgba(255,255,255,0.97)";
    btn.style.boxShadow = "0 8px 18px rgba(0,0,0,0.16)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "0";
    btn.style.color = active ? "#22c55e" : "#6b7280";
  }

  function styleRemoveButton(btn) {
    btn.style.position = "absolute";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.minWidth = "74px";
    btn.style.height = "34px";
    btn.style.border = "none";
    btn.style.borderRadius = "999px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "7";
    btn.style.background = "#ef4444";
    btn.style.color = "#ffffff";
    btn.style.boxShadow = "0 8px 18px rgba(0,0,0,0.16)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "0 12px";
    btn.style.fontSize = "13px";
    btn.style.fontWeight = "700";
  }

  function makeSuggestionButton(card, index) {
    if (!card || card.nodeType !== 1) return null;

    let btn = card.querySelector(".om-hanger-btn");
    if (btn) return btn;

    getCardUniqueId(card, index);
    card.style.position = "relative";

    btn = document.createElement("button");
    btn.className = "om-hanger-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Toggle favorite");
    btn.innerHTML = HANGER_ICON;

    styleHangerButton(btn, false);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const clickedId = card.dataset.omFavUid;
      if (!clickedId) return;

      if (favoriteExists(clickedId)) {
        removeFavorite(clickedId);
        toast("Removed from favorites");
      } else {
        addFavorite(card);
        toast("Added to favorites");
      }

      refreshSuggestionButtons();
      renderFavorites();
    });

    card.appendChild(btn);
    return btn;
  }

  function paintSuggestionButton(card, index) {
    const btn = makeSuggestionButton(card, index);
    if (!btn) return;

    const id = card.dataset.omFavUid;
    btn.innerHTML = HANGER_ICON;
    styleHangerButton(btn, favoriteExists(id));
  }

  function refreshSuggestionButtons() {
    const cards = Array.from(suggestionGrid.children);
    cards.forEach(function (card, index) {
      if (card && card.nodeType === 1) {
        paintSuggestionButton(card, index);
      }
    });
  }

  function renderFavorites() {
    const grid = byId("favoritesGrid");
    const empty = byId("favoritesEmptyState");
    if (!grid || !empty) return;

    const list = readFavorites();
    grid.innerHTML = "";

    if (!list.length) {
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";

    list.forEach(function (item) {
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.innerHTML = item.html;

      removeScoreAndSaveUI(wrap);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", "Remove favorite");
      styleRemoveButton(removeBtn);

      removeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeFavorite(item.id);
        renderFavorites();
        refreshSuggestionButtons();
        toast("Removed from favorites");
      });

      wrap.appendChild(removeBtn);
      grid.appendChild(wrap);
    });
  }

  function openFavorites() {
    if (!canShowLauncher()) return;
    homePage.classList.remove("active");
    favoritesPage.classList.add("active");
    renderFavorites();
    window.scrollTo(0, 0);
  }

  function closeFavorites() {
    favoritesPage.classList.remove("active");
    homePage.classList.add("active");
    setLauncherVisibility();
    window.scrollTo(0, 0);
  }

  launcher.addEventListener("click", openFavorites);

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "favoritesBackBtn") {
      closeFavorites();
    }
  });

  const gridObserver = new MutationObserver(function () {
    refreshSuggestionButtons();
  });

  gridObserver.observe(suggestionGrid, {
    childList: true
  });

  setInterval(function () {
    setLauncherVisibility();
  }, 700);

  window.addEventListener("load", function () {
    refreshSuggestionButtons();
    renderFavorites();
    setLauncherVisibility();
  });

  refreshSuggestionButtons();
  renderFavorites();
  setLauncherVisibility();
})();
/* ========= OUTFITMATCH APK SELFIE CAMERA PATCH ========= */
(function () {
  if (window.__OM_APK_SELFIE_PATCH__) return;
  window.__OM_APK_SELFIE_PATCH__ = true;

  function byId(id) {
    return document.getElementById(id);
  }

  function setResult(message) {
    if (analysisResult) analysisResult.innerHTML = message;
  }

  function stopTracksSafe() {
    try {
      if (typeof stopCameraTracks === "function") stopCameraTracks();
    } catch (e) {}

    try {
      if (cameraVideo) cameraVideo.srcObject = null;
    } catch (e) {}
  }

  function setPreviewImage(dataUrl, message) {
    uploadedFaceImage = dataUrl;
    if (previewImage) previewImage.src = dataUrl;
    if (previewArea) previewArea.style.display = "block";
    if (analyzeBtn) analyzeBtn.disabled = false;
    setResult(message || "Selfie selected. Now click Detect Face Tone.");
    stopTracksSafe();
    if (cameraBox) cameraBox.classList.remove("active");
  }

  function isLikelyWebViewOrApk() {
    const ua = String(navigator.userAgent || "");
    const isAndroid = /Android/i.test(ua);
    const hasWvToken = /;\s*wv\)|\bwv\b/i.test(ua);
    const hasAndroidAppRef = /^android-app:\/\//i.test(document.referrer || "");
    const isStandalone = !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    const isAppProtocol = ["file:", "content:", "app:", "ionic:", "capacitor:"]
      .includes(String(location.protocol || "").toLowerCase());

    return isAppProtocol || hasAndroidAppRef || (isAndroid && (hasWvToken || isStandalone));
  }

  function requestUserCamera(constraints) {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      return navigator.mediaDevices.getUserMedia(constraints);
    }

    const legacyGetUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (!legacyGetUserMedia) {
      return Promise.reject(new Error("getUserMedia not available"));
    }

    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  function openNativeSelfieInput() {
    return new Promise((resolve, reject) => {
      const picker = document.createElement("input");
      let settled = false;

      picker.type = "file";
      picker.accept = "image/*";
      picker.setAttribute("capture", "user");
      picker.setAttribute("aria-hidden", "true");
      picker.style.position = "fixed";
      picker.style.left = "-9999px";
      picker.style.top = "-9999px";
      picker.style.opacity = "0";
      document.body.appendChild(picker);

      function cleanup() {
        setTimeout(() => {
          try {
            picker.remove();
          } catch (e) {}
        }, 150);
      }

      function finish(type, value) {
        if (settled) return;
        settled = true;
        cleanup();
        if (type === "resolve") resolve(value);
        else reject(value);
      }

      picker.addEventListener("change", () => {
        const file = picker.files && picker.files[0];
        if (file) finish("resolve", file);
        else finish("reject", new Error("No image selected"));
      }, { once: true });

      window.addEventListener("focus", () => {
        setTimeout(() => {
          if (!settled && !(picker.files && picker.files[0])) {
            finish("reject", new Error("Picker closed"));
          }
        }, 500);
      }, { once: true });

      picker.click();
    });
  }

  async function applySelfieFile(file) {
    if (!file) throw new Error("No file received");
    if (!/^image\//i.test(String(file.type || "image/jpeg"))) {
      throw new Error("Selected file is not an image");
    }

    const dataUrl = await fileToDataURL(file);
    setPreviewImage(dataUrl, "Selfie selected. Now click Detect Face Tone.");
  }

  async function openLiveCamera() {
    stopTracksSafe();

    cameraStream = await requestUserCamera({
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 1280 },
        height: { ideal: 1280 }
      },
      audio: false
    });

    if (cameraVideo) {
      cameraVideo.setAttribute("playsinline", "true");
      cameraVideo.muted = true;
      cameraVideo.srcObject = cameraStream;
      if (typeof cameraVideo.play === "function") {
        try {
          await cameraVideo.play();
        } catch (e) {}
      }
    }

    if (cameraBox) cameraBox.classList.add("active");
    setResult("Camera opened. Keep only one clear face in the frame.");
  }

  async function patchedSelfieOpen(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    setResult("Opening selfie camera...");

    const preferNativeCapture = isLikelyWebViewOrApk();

    if (preferNativeCapture) {
      try {
        const file = await openNativeSelfieInput();
        await applySelfieFile(file);
        return;
      } catch (e) {}
    }

    try {
      await openLiveCamera();
      return;
    } catch (e) {}

    if (!preferNativeCapture) {
      try {
        const file = await openNativeSelfieInput();
        await applySelfieFile(file);
        return;
      } catch (e) {}
    }

    setResult("Camera open nahi ho pa raha. APK builder me camera/file permission allow karo ya Upload Photo use karo.");
  }

  function replaceSelfieButton() {
    const oldBtn = byId("openCameraBtn");
    if (!oldBtn || oldBtn.dataset.apkSelfiePatch === "1" || !oldBtn.parentNode) return;

    const newBtn = oldBtn.cloneNode(true);
    newBtn.dataset.apkSelfiePatch = "1";
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener("click", patchedSelfieOpen, false);
  }

  replaceSelfieButton();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTracksSafe();
  });

  window.addEventListener("pagehide", stopTracksSafe);
})();
/* ========= OUTFITMATCH STRICT SKIN-TONE SCORING PATCH ========= */
(function () {
  if (window.__OM_STRICT_SCORE_PATCH__) return;
  window.__OM_STRICT_SCORE_PATCH__ = true;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function pairHasPremiumTone(upper, lower, toneProfile) {
    return !!(
      toneProfile?.premiumPairs &&
      matchesPairList(upper.analysis.family, lower.analysis.family, toneProfile.premiumPairs)
    );
  }

  function getStrictContrastScore(upper, lower) {
    const distance = getColorDistance(upper.analysis.hex, lower.analysis.hex);

    if (distance >= 55 && distance <= 145) return 14;
    if (distance >= 40 && distance < 55) return 10;
    if (distance > 145 && distance <= 190) return 8;
    if (distance >= 28 && distance < 40) return 5;
    if (distance > 190 && distance <= 225) return 2;
    return -10;
  }

  function getStrictToneScore(upper, lower, toneProfile) {
    const upperLevel = getToneLevel(upper.analysis.family, toneProfile);
    const lowerLevel = getToneLevel(lower.analysis.family, toneProfile);

    if (upperLevel === "avoid" || lowerLevel === "avoid") {
      return { blocked: true, score: 0, upperLevel, lowerLevel };
    }

    let score = 0;

    if (upperLevel === "best") score += 34;
    else if (upperLevel === "okay") score += 12;

    if (lowerLevel === "best") score += 24;
    else if (lowerLevel === "okay") score += 10;

    if (upperLevel === "best" && lowerLevel === "best") score += 10;
    else if (upperLevel === "best" || lowerLevel === "best") score += 4;

    if (toneProfile?.undertone === upper.analysis.undertone) score += 6;
    if (toneProfile?.undertone === lower.analysis.undertone) score += 4;

    return { blocked: false, score, upperLevel, lowerLevel };
  }

  function getStrictScoreMeta(upper, lower, toneProfile) {
    const tone = getStrictToneScore(upper, lower, toneProfile);
    if (tone.blocked) {
      return { blocked: true, score: 0, upperLevel: tone.upperLevel, lowerLevel: tone.lowerLevel };
    }

    const garmentScore = getGarmentPairStrength(upper, lower);
    if (garmentScore <= -80) {
      return { blocked: true, score: 0, upperLevel: tone.upperLevel, lowerLevel: tone.lowerLevel };
    }

    const occasion = getOccasionOverlapScore(upper, lower);
    const contrast = getStrictContrastScore(upper, lower);
    const style = getStylePolishScore(upper, lower);
    const premium = pairHasPremiumTone(upper, lower, toneProfile);
    const bothNeutral = isNeutralFamily(upper.analysis.family) && isNeutralFamily(lower.analysis.family);
    const loudSameColor = upper.analysis.family === lower.analysis.family && !isNeutralFamily(upper.analysis.family);

    let score = 0;
    score += tone.score;

    if (garmentScore >= 30) score += 14;
    else if (garmentScore >= 10) score += 6;

    if (occasion >= 18) score += 12;
    else if (occasion >= 10) score += 6;
    else score -= 12;

    score += contrast;

    if (style >= 18) score += 12;
    else if (style >= 12) score += 9;
    else if (style >= 6) score += 4;
    else if (style < 0) score -= 18;

    if (premium) score += 10;
    if (isNeutralFamily(lower.analysis.family) && !isNeutralFamily(upper.analysis.family)) score += 5;
    if (bothNeutral) score += 2;
    if (upper.analysis.undertone === lower.analysis.undertone) score += 2;
    if (loudSameColor) score -= 12;

    if (tone.upperLevel === "okay" && tone.lowerLevel === "okay" && !premium) score -= 10;
    if (contrast < 0 && !premium) score -= 10;

    score = clamp(Math.round(score), 0, 98);

    return {
      blocked: false,
      score,
      upperLevel: tone.upperLevel,
      lowerLevel: tone.lowerLevel,
      premium,
      mode: getBetterOutfitMode(upper, lower)
    };
  }

  function getStrictLevelLabel(score) {
    if (score >= 88) return "Elite Match";
    if (score >= 78) return "Best Match";
    if (score >= 68) return "Strong Match";
    if (score >= 58) return "Good Match";
    return "Low Match";
  }

  getImprovedMasterScore = function (upper, lower, toneProfile) {
    return getStrictScoreMeta(upper, lower, toneProfile).score;
  };

  getImprovedReason = function (upper, lower, score, toneProfile) {
    const meta = getStrictScoreMeta(upper, lower, toneProfile);
    const reasons = [];

    if (meta.blocked || score <= 0) {
      return "This outfit is not suitable for your detected skin tone.";
    }

    if (score >= 88) reasons.push("This is one of the strongest outfits for your detected skin tone");
    else if (score >= 78) reasons.push("This outfit suits your skin tone very well");
    else if (score >= 68) reasons.push("This is a strong skin-tone-friendly outfit");
    else reasons.push("This outfit is acceptable but weaker than the top matches");

    if (meta.upperLevel === "best") reasons.push(`the ${upper.label.toLowerCase()} color strongly suits your complexion`);
    else if (meta.upperLevel === "okay") reasons.push(`the ${upper.label.toLowerCase()} color is safe for your complexion`);

    if (meta.lowerLevel === "best") reasons.push(`the ${lower.label.toLowerCase()} color supports your face tone nicely`);
    else if (meta.lowerLevel === "okay") reasons.push(`the ${lower.label.toLowerCase()} color keeps the outfit balanced`);

    if (meta.mode === "smart") reasons.push("the outfit structure looks polished and refined");
    if (meta.mode === "smart-casual") reasons.push("the outfit structure feels modern and balanced");
    if (meta.mode === "casual") reasons.push("the outfit structure works well for a clean casual look");
    if (meta.mode === "home") reasons.push("the outfit structure is comfort-focused rather than stylish");

    if (meta.premium) reasons.push("this is also one of your tone-friendly premium color pairings");

    return reasons.join(". ") + ".";
  };

  renderSuggestions = function (combos) {
    if (!suggestionGrid || !suggestionEmptyState) return;
    suggestionGrid.innerHTML = "";

    if (!combos.length) {
      suggestionEmptyState.style.display = "block";
      suggestionEmptyState.textContent = "No suitable outfit matches found for this skin tone yet. Upload more better-matching clothes.";
      return;
    }

    suggestionEmptyState.style.display = "none";
    const frag = document.createDocumentFragment();

    combos.forEach((combo, index) => {
      const badgeText = index === 0 ? "Best Match" : index < 5 ? `Top Match ${index + 1}` : `Match ${index + 1}`;
      const mode = getBetterOutfitMode(combo.upper, combo.lower);
      const level = getStrictLevelLabel(combo.score);
      const card = document.createElement("div");
      card.className = "suggestion-card";
      card.innerHTML = `
        <div class="suggestion-top">
          <div>
            <h4>${badgeText}</h4>
            <p>${combo.upper.label} + ${combo.lower.label}</p>
          </div>
          <div class="suggestion-score">${combo.score}</div>
        </div>
        <div class="combo-row">
          <div class="combo-piece">
            <img src="${combo.upper.src}" alt="${combo.upper.label}">
            <h5>${combo.upper.label}</h5>
            <p>${combo.upper.analysis.family}<br>${combo.upper.analysis.hex}</p>
          </div>
          <div class="combo-piece">
            <img src="${combo.lower.src}" alt="${combo.lower.label}">
            <h5>${combo.lower.label}</h5>
            <p>${combo.lower.analysis.family}<br>${combo.lower.analysis.hex}</p>
          </div>
        </div>
        <div class="reason-box"><strong>Match level:</strong> ${level}<br><strong>Style:</strong> ${mode}<br>${combo.reason}</div>
      `;
      frag.appendChild(card);
    });

    suggestionGrid.appendChild(frag);
  };

  generateSuggestions = function () {
    const uppers = [...clothes.shirt, ...clothes.tshirt];
    const lowers = [...clothes.pant, ...clothes.nightPant, ...clothes.shorts];
    const toneProfile = appUser.toneProfile;

    if (!uppers.length || !lowers.length) {
      renderSuggestions([]);
      return;
    }

    const combos = [];
    const seen = new Set();

    for (const upper of uppers) {
      for (const lower of lowers) {
        const meta = getStrictScoreMeta(upper, lower, toneProfile);
        if (meta.blocked) continue;
        if (meta.score < 58) continue;

        const key = [
          upper.category,
          upper.analysis.family,
          upper.analysis.hex,
          lower.category,
          lower.analysis.family,
          lower.analysis.hex
        ].join("|");

        if (seen.has(key)) continue;
        seen.add(key);

        combos.push({
          upper,
          lower,
          score: meta.score,
          reason: getImprovedReason(upper, lower, meta.score, toneProfile)
        });
      }
    }

    combos.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getGarmentPairStrength(b.upper, b.lower) - getGarmentPairStrength(a.upper, a.lower);
    });

    renderSuggestions(combos);
  };

  try {
    generateSuggestions();
  } catch (e) {}
})();
/* ========= OUTFITMATCH EXACT TONE MATRIX PATCH ========= */
(function () {
  if (window.__OM_EXACT_TONE_MATRIX_PATCH__) return;
  window.__OM_EXACT_TONE_MATRIX_PATCH__ = true;

  const EXACT_SKIN_SWATCHES = [
    { group: "Fair", name: "Pale Ivory", hex: "#EFD5BF", undertones: ["cool", "neutral"] },
    { group: "Fair", name: "Warm Ivory", hex: "#E8C98F", undertones: ["warm", "neutral"] },
    { group: "Fair", name: "Rose Beige", hex: "#E7C0A0", undertones: ["cool", "neutral"] },
    { group: "Fair", name: "Almond Beige", hex: "#DDB48E", undertones: ["warm", "neutral"] },

    { group: "Light", name: "Yellow Beige", hex: "#DDB77D", undertones: ["warm"] },
    { group: "Light", name: "Sand Beige", hex: "#E1BD8F", undertones: ["warm", "neutral"] },
    { group: "Light", name: "True Beige", hex: "#D9B191", undertones: ["neutral"] },
    { group: "Light", name: "Natural Beige", hex: "#D0A26F", undertones: ["warm", "neutral"] },

    { group: "Medium", name: "Warm Beige", hex: "#D4A178", undertones: ["warm"] },
    { group: "Medium", name: "Medium Beige", hex: "#D2A070", undertones: ["neutral", "warm"] },
    { group: "Medium", name: "Golden Beige", hex: "#C99962", undertones: ["warm", "olive"] },
    { group: "Medium", name: "Caramel Beige", hex: "#B58A5A", undertones: ["warm", "olive"] },

    { group: "Tan", name: "Honey Beige", hex: "#BC8455", undertones: ["warm"] },
    { group: "Tan", name: "Reddish Tan", hex: "#AE7448", undertones: ["warm", "neutral"] },
    { group: "Tan", name: "Golden Bronze", hex: "#B07A4F", undertones: ["warm", "olive"] },
    { group: "Tan", name: "Olive Brown", hex: "#9E7247", undertones: ["olive", "warm"] },
    { group: "Tan", name: "Cafe Brown", hex: "#A47442", undertones: ["warm", "olive"] },

    { group: "Deep", name: "Golden Brown", hex: "#8B5937", undertones: ["warm"] },
    { group: "Deep", name: "Toasted Brown", hex: "#99643A", undertones: ["warm", "neutral"] },
    { group: "Deep", name: "Chocolate Brown", hex: "#774321", undertones: ["warm", "neutral"] },
    { group: "Deep", name: "Deep Brown", hex: "#6A442C", undertones: ["neutral", "olive"] }
  ];

  const SHADE_LIBRARY = [
    { name: "pure white", hex: "#F8F8F4", family: "white" },
    { name: "soft white", hex: "#F2EFE8", family: "white" },
    { name: "ivory", hex: "#F0E5CF", family: "white" },
    { name: "cream", hex: "#EBD9B5", family: "light-neutral" },
    { name: "beige", hex: "#D9BE96", family: "light-neutral" },
    { name: "stone beige", hex: "#CBB28E", family: "light-neutral" },
    { name: "taupe", hex: "#9C8774", family: "neutral" },
    { name: "camel", hex: "#B88A52", family: "brown" },
    { name: "tan brown", hex: "#9F774B", family: "brown" },
    { name: "mocha brown", hex: "#7C5336", family: "brown" },
    { name: "chocolate brown", hex: "#5A3825", family: "brown" },
    { name: "olive green", hex: "#6E7541", family: "green" },
    { name: "sage green", hex: "#9AA37A", family: "green" },
    { name: "forest green", hex: "#355B3E", family: "green" },
    { name: "emerald green", hex: "#0F6B51", family: "green" },
    { name: "mint green", hex: "#A9CCB0", family: "green" },
    { name: "sky blue", hex: "#9EC6E7", family: "blue" },
    { name: "powder blue", hex: "#B8CBDF", family: "blue" },
    { name: "steel blue", hex: "#6487A5", family: "blue" },
    { name: "teal blue", hex: "#2A6F73", family: "blue" },
    { name: "royal blue", hex: "#2D5D9F", family: "blue" },
    { name: "navy blue", hex: "#1E3557", family: "blue" },
    { name: "denim blue", hex: "#4D6F94", family: "blue" },
    { name: "slate blue", hex: "#5E6C87", family: "blue" },
    { name: "peach", hex: "#E5B292", family: "orange-red" },
    { name: "rust orange", hex: "#B95F32", family: "orange-red" },
    { name: "terracotta", hex: "#A85A3B", family: "orange-red" },
    { name: "coral", hex: "#D97C62", family: "orange-red" },
    { name: "tomato red", hex: "#C94E3F", family: "red" },
    { name: "classic red", hex: "#B43232", family: "red" },
    { name: "maroon", hex: "#6B2430", family: "red" },
    { name: "berry", hex: "#8B3D57", family: "red" },
    { name: "mustard", hex: "#C79A31", family: "yellow-gold" },
    { name: "golden yellow", hex: "#D5AC41", family: "yellow-gold" },
    { name: "mauve", hex: "#A77D93", family: "pink-purple" },
    { name: "lavender", hex: "#A892BF", family: "pink-purple" },
    { name: "dusty rose", hex: "#C69297", family: "pink-purple" },
    { name: "charcoal", hex: "#41464E", family: "dark-neutral" },
    { name: "slate grey", hex: "#66707A", family: "dark-neutral" },
    { name: "cool grey", hex: "#9BA2AA", family: "neutral" },
    { name: "black", hex: "#111111", family: "black" }
  ];

  const GROUP_BASE = {
    Fair: {
      upperBest: ["pure white", "soft white", "ivory", "powder blue", "sky blue", "steel blue", "berry", "dusty rose", "lavender", "charcoal", "slate blue"],
      lowerBest: ["navy blue", "charcoal", "slate grey", "cool grey", "black", "stone beige"],
      upperOkay: ["cream", "beige", "sage green", "mint green", "maroon"],
      lowerOkay: ["beige", "taupe", "denim blue"],
      avoidFamilies: ["yellow-gold", "orange-red"]
    },
    Light: {
      upperBest: ["soft white", "ivory", "cream", "sky blue", "powder blue", "denim blue", "sage green", "mint green", "dusty rose", "berry", "camel"],
      lowerBest: ["navy blue", "charcoal", "slate grey", "stone beige", "taupe", "olive green"],
      upperOkay: ["beige", "steel blue", "maroon", "mauve", "forest green"],
      lowerOkay: ["cool grey", "black", "tan brown"],
      avoidFamilies: ["orange-red"]
    },
    Medium: {
      upperBest: ["pure white", "soft white", "cream", "camel", "olive green", "forest green", "teal blue", "royal blue", "navy blue", "maroon", "mustard"],
      lowerBest: ["charcoal", "navy blue", "stone beige", "taupe", "mocha brown", "olive green"],
      upperOkay: ["beige", "sage green", "denim blue", "berry", "golden yellow"],
      lowerOkay: ["cool grey", "black", "tan brown"],
      avoidFamilies: ["pink-purple"]
    },
    Tan: {
      upperBest: ["pure white", "cream", "camel", "olive green", "forest green", "emerald green", "teal blue", "royal blue", "navy blue", "maroon", "rust orange"],
      lowerBest: ["charcoal", "navy blue", "mocha brown", "chocolate brown", "stone beige", "black"],
      upperOkay: ["sage green", "mustard", "berry", "denim blue"],
      lowerOkay: ["taupe", "tan brown", "slate grey"],
      avoidFamilies: ["pink-purple"]
    },
    Deep: {
      upperBest: ["pure white", "soft white", "cream", "camel", "forest green", "emerald green", "royal blue", "navy blue", "teal blue", "mustard", "classic red", "maroon"],
      lowerBest: ["charcoal", "black", "navy blue", "chocolate brown", "mocha brown", "stone beige"],
      upperOkay: ["olive green", "rust orange", "berry", "denim blue"],
      lowerOkay: ["taupe", "slate grey"],
      avoidFamilies: ["pink-purple"]
    }
  };

  const UNDERTONE_BASE = {
    warm: {
      upperBest: ["cream", "camel", "olive green", "forest green", "teal blue", "mustard", "maroon", "rust orange"],
      lowerBest: ["stone beige", "taupe", "mocha brown", "chocolate brown", "navy blue"],
      upperOkay: ["pure white", "soft white", "beige", "royal blue", "classic red"],
      lowerOkay: ["charcoal", "black", "olive green"],
      avoidFamilies: ["pink-purple"]
    },
    cool: {
      upperBest: ["pure white", "soft white", "powder blue", "sky blue", "steel blue", "navy blue", "berry", "dusty rose", "lavender", "charcoal"],
      lowerBest: ["navy blue", "charcoal", "slate grey", "cool grey", "black"],
      upperOkay: ["cream", "sage green", "mauve", "maroon"],
      lowerOkay: ["stone beige", "taupe"],
      avoidFamilies: ["yellow-gold", "orange-red"]
    },
    olive: {
      upperBest: ["cream", "camel", "olive green", "forest green", "emerald green", "teal blue", "navy blue", "maroon"],
      lowerBest: ["stone beige", "taupe", "mocha brown", "charcoal", "navy blue"],
      upperOkay: ["pure white", "sage green", "mustard", "denim blue"],
      lowerOkay: ["black", "cool grey"],
      avoidFamilies: ["pink-purple", "orange-red"]
    },
    neutral: {
      upperBest: ["pure white", "soft white", "cream", "beige", "sage green", "olive green", "navy blue", "denim blue", "berry", "charcoal"],
      lowerBest: ["navy blue", "charcoal", "stone beige", "taupe", "black"],
      upperOkay: ["camel", "forest green", "maroon", "dusty rose"],
      lowerOkay: ["cool grey", "mocha brown"],
      avoidFamilies: ["orange-red"]
    }
  };

  const SWATCH_OVERRIDES = {
    "Pale Ivory": {
      upperBest: ["pure white", "powder blue", "dusty rose", "lavender", "slate blue"],
      lowerBest: ["navy blue", "charcoal", "cool grey"],
      avoidFamilies: ["yellow-gold", "orange-red", "brown"]
    },
    "Warm Ivory": {
      upperBest: ["cream", "camel", "sage green", "teal blue", "mustard"],
      lowerBest: ["stone beige", "navy blue", "mocha brown"],
      avoidFamilies: ["pink-purple"]
    },
    "Rose Beige": {
      upperBest: ["soft white", "dusty rose", "berry", "powder blue", "mauve"],
      lowerBest: ["charcoal", "navy blue", "taupe"],
      avoidFamilies: ["yellow-gold", "orange-red"]
    },
    "Almond Beige": {
      upperBest: ["cream", "camel", "olive green", "forest green", "teal blue"],
      lowerBest: ["stone beige", "mocha brown", "navy blue"],
      avoidFamilies: ["pink-purple"]
    },
    "Yellow Beige": {
      upperBest: ["cream", "camel", "olive green", "sage green", "teal blue", "mustard"],
      lowerBest: ["navy blue", "stone beige", "mocha brown"],
      avoidFamilies: ["pink-purple"]
    },
    "Sand Beige": {
      upperBest: ["soft white", "beige", "sage green", "denim blue", "dusty rose"],
      lowerBest: ["navy blue", "taupe", "charcoal"],
      avoidFamilies: ["orange-red"]
    },
    "True Beige": {
      upperBest: ["soft white", "powder blue", "sage green", "berry", "charcoal"],
      lowerBest: ["navy blue", "stone beige", "slate grey"],
      avoidFamilies: ["orange-red"]
    },
    "Natural Beige": {
      upperBest: ["cream", "camel", "olive green", "denim blue", "maroon"],
      lowerBest: ["navy blue", "taupe", "mocha brown"],
      avoidFamilies: ["pink-purple"]
    },
    "Warm Beige": {
      upperBest: ["cream", "camel", "olive green", "forest green", "teal blue", "maroon"],
      lowerBest: ["stone beige", "charcoal", "navy blue"],
      avoidFamilies: ["pink-purple"]
    },
    "Medium Beige": {
      upperBest: ["soft white", "beige", "sage green", "denim blue", "berry"],
      lowerBest: ["navy blue", "charcoal", "taupe"],
      avoidFamilies: ["orange-red"]
    },
    "Golden Beige": {
      upperBest: ["cream", "camel", "olive green", "emerald green", "teal blue", "mustard"],
      lowerBest: ["stone beige", "mocha brown", "navy blue"],
      avoidFamilies: ["pink-purple"]
    },
    "Caramel Beige": {
      upperBest: ["cream", "camel", "forest green", "teal blue", "royal blue", "maroon"],
      lowerBest: ["charcoal", "navy blue", "chocolate brown"],
      avoidFamilies: ["pink-purple"]
    },
    "Honey Beige": {
      upperBest: ["cream", "camel", "olive green", "forest green", "royal blue", "rust orange"],
      lowerBest: ["stone beige", "mocha brown", "charcoal"],
      avoidFamilies: ["pink-purple"]
    },
    "Reddish Tan": {
      upperBest: ["soft white", "teal blue", "navy blue", "forest green", "charcoal"],
      lowerBest: ["stone beige", "charcoal", "black"],
      avoidFamilies: ["orange-red", "pink-purple"]
    },
    "Golden Bronze": {
      upperBest: ["cream", "camel", "olive green", "emerald green", "navy blue", "mustard"],
      lowerBest: ["chocolate brown", "charcoal", "stone beige"],
      avoidFamilies: ["pink-purple"]
    },
    "Olive Brown": {
      upperBest: ["cream", "olive green", "forest green", "emerald green", "teal blue", "navy blue"],
      lowerBest: ["stone beige", "mocha brown", "charcoal"],
      avoidFamilies: ["pink-purple", "orange-red"]
    },
    "Cafe Brown": {
      upperBest: ["cream", "camel", "forest green", "teal blue", "royal blue", "maroon"],
      lowerBest: ["stone beige", "charcoal", "black"],
      avoidFamilies: ["pink-purple"]
    },
    "Golden Brown": {
      upperBest: ["pure white", "cream", "mustard", "emerald green", "royal blue", "maroon"],
      lowerBest: ["charcoal", "black", "stone beige"],
      avoidFamilies: ["pink-purple"]
    },
    "Toasted Brown": {
      upperBest: ["soft white", "camel", "olive green", "forest green", "navy blue", "classic red"],
      lowerBest: ["black", "charcoal", "stone beige"],
      avoidFamilies: ["pink-purple"]
    },
    "Chocolate Brown": {
      upperBest: ["pure white", "cream", "camel", "forest green", "royal blue", "mustard", "classic red"],
      lowerBest: ["black", "charcoal", "stone beige"],
      avoidFamilies: ["pink-purple"]
    },
    "Deep Brown": {
      upperBest: ["soft white", "cream", "olive green", "emerald green", "royal blue", "teal blue", "maroon"],
      lowerBest: ["black", "charcoal", "stone beige", "navy blue"],
      avoidFamilies: ["pink-purple", "orange-red"]
    }
  };

  function uniq(arr) {
    return [...new Set((arr || []).filter(Boolean))];
  }

  function mergeToneRules(group, undertone, swatchName) {
    const a = GROUP_BASE[group] || GROUP_BASE.Medium;
    const b = UNDERTONE_BASE[undertone] || UNDERTONE_BASE.neutral;
    const c = SWATCH_OVERRIDES[swatchName] || {};

    const upperBest = uniq([...(a.upperBest || []), ...(b.upperBest || []), ...(c.upperBest || [])]);
    const lowerBest = uniq([...(a.lowerBest || []), ...(b.lowerBest || []), ...(c.lowerBest || [])]);
    const upperOkay = uniq([...(a.upperOkay || []), ...(b.upperOkay || []), ...(c.upperOkay || [])]).filter((x) => !upperBest.includes(x));
    const lowerOkay = uniq([...(a.lowerOkay || []), ...(b.lowerOkay || []), ...(c.lowerOkay || [])]).filter((x) => !lowerBest.includes(x));
    const avoidFamilies = uniq([...(a.avoidFamilies || []), ...(b.avoidFamilies || []), ...(c.avoidFamilies || [])]);

    const preferredFamilies = uniq(
      upperBest.concat(lowerBest)
        .map((shade) => SHADE_LIBRARY.find((s) => s.name === shade)?.family)
        .filter(Boolean)
    );

    const okayFamilies = uniq(
      upperOkay.concat(lowerOkay)
        .map((shade) => SHADE_LIBRARY.find((s) => s.name === shade)?.family)
        .filter((f) => f && !preferredFamilies.includes(f))
    );

    return {
      upperBest,
      lowerBest,
      upperOkay,
      lowerOkay,
      avoidFamilies,
      preferredFamilies,
      okayFamilies,
      premiumPairs: buildPremiumPairsFromLists(upperBest, lowerBest)
    };
  }

  function buildPremiumPairsFromLists(upperList, lowerList) {
    const topUpper = upperList.slice(0, 8);
    const topLower = lowerList.slice(0, 8);
    const pairs = [];
    for (const u of topUpper) {
      const uf = shadeInfoByName(u)?.family;
      if (!uf) continue;
      for (const l of topLower) {
        const lf = shadeInfoByName(l)?.family;
        if (!lf) continue;
        if (uf === lf && !["white", "light-neutral", "dark-neutral", "neutral", "brown"].includes(uf)) continue;
        pairs.push([uf, lf]);
      }
    }
    return uniq(pairs.map((x) => JSON.stringify(x))).map((x) => JSON.parse(x));
  }

  function shadeInfoByName(name) {
    return SHADE_LIBRARY.find((s) => s.name === name) || null;
  }

  function colorDistanceFromHex(hex1, hex2) {
    const a = hexToRgb(hex1);
    const b = hexToRgb(hex2);
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt((dr * dr * 1.12) + (dg * dg) + (db * db * 1.05));
  }

  function detectExactShadeFromRgb(r, g, b) {
    const hex = rgbToHex(r, g, b);
    let best = SHADE_LIBRARY[0];
    let bestScore = Infinity;

    for (const shade of SHADE_LIBRARY) {
      const dist = colorDistanceFromHex(hex, shade.hex);
      const shadeRgb = hexToRgb(shade.hex);
      const brightPenalty = Math.abs(brightnessOf(r, g, b) - brightnessOf(shadeRgb.r, shadeRgb.g, shadeRgb.b)) * 0.22;
      const score = dist + brightPenalty;
      if (score < bestScore) {
        bestScore = score;
        best = shade;
      }
    }

    return {
      shade: best.name,
      family: best.family,
      hex,
      rgb: { r, g, b },
      undertone: getBetterUndertone(r, g, b)
    };
  }

  function detectExactShadeFromHex(hex) {
    const rgb = hexToRgb(hex || "#808080");
    return detectExactShadeFromRgb(rgb.r, rgb.g, rgb.b);
  }

  function rebuildItemAnalysis(item) {
    const baseHex = item?.analysis?.hex || "#808080";
    const rgb = item?.analysis?.rgb || hexToRgb(baseHex);
    const exact = detectExactShadeFromRgb(rgb.r, rgb.g, rgb.b);
    return {
      ...item,
      analysis: {
        ...(item.analysis || {}),
        hex: exact.hex,
        rgb: exact.rgb,
        family: exact.family,
        undertone: exact.undertone,
        shade: exact.shade
      }
    };
  }

  function nearestExactSkinSwatch(r, g, b, brightness, undertone) {
    const guessedGroup = guessToneGroup(brightness);
    const groupIndex = { Fair: 0, Light: 1, Medium: 2, Tan: 3, Deep: 4 };

    let best = EXACT_SKIN_SWATCHES[0];
    let bestScore = Infinity;

    for (const swatch of EXACT_SKIN_SWATCHES) {
      const rgb = hexToRgb(swatch.hex);
      const dr = r - rgb.r;
      const dg = g - rgb.g;
      const db = b - rgb.b;
      const distance = Math.sqrt((dr * dr * 1.15) + (dg * dg) + (db * db * 1.08));
      const groupPenalty = Math.abs(groupIndex[guessedGroup] - groupIndex[swatch.group]) * 15;
      const undertonePenalty = swatch.undertones.includes(undertone) ? 0 : 12;
      const brightnessPenalty = Math.abs(brightness - brightnessOf(rgb.r, rgb.g, rgb.b)) * 0.25;
      const score = distance + groupPenalty + undertonePenalty + brightnessPenalty;
      if (score < bestScore) {
        bestScore = score;
        best = swatch;
      }
    }
    return best;
  }

  buildSkinToneProfile = function (r, g, b, brightness, undertone) {
    const resolvedUndertone = undertone || getBetterUndertone(r, g, b);
    const swatch = nearestExactSkinSwatch(r, g, b, brightness, resolvedUndertone);
    const rules = mergeToneRules(swatch.group, resolvedUndertone, swatch.name);

    return {
      label: `${swatch.group} - ${swatch.name}`,
      group: swatch.group,
      swatchName: swatch.name,
      swatchHex: swatch.hex,
      undertone: resolvedUndertone,
      themeName: typeof themeNameFor === "function" ? themeNameFor(swatch.group, resolvedUndertone) : "Custom Tone Theme",
      preferredFamilies: rules.preferredFamilies,
      okayFamilies: rules.okayFamilies,
      avoidFamilies: rules.avoidFamilies,
      premiumPairs: rules.premiumPairs,
      exactToneRules: rules,
      averageRgb: { r, g, b },
      brightness: Math.round(brightness)
    };
  };

  detectAverageClothColor = function (img) {
    const prepared = prepareCanvas(img, 320);
    if (!prepared) {
      return {
        hex: "#808080",
        family: "neutral",
        undertone: "neutral",
        rgb: { r: 128, g: 128, b: 128 },
        shade: "cool grey"
      };
    }

    const { width, height } = prepared;
    const data = imageCtx.getImageData(0, 0, width, height).data;
    const x1 = Math.floor(width * 0.18);
    const x2 = Math.floor(width * 0.82);
    const y1 = Math.floor(height * 0.12);
    const y2 = Math.floor(height * 0.88);

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        const i = ((y * width) + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 210) continue;
        if (r > 245 && g > 245 && b > 245) continue;
        if (r < 6 && g < 6 && b < 6) continue;
        totalR += r;
        totalG += g;
        totalB += b;
        count += 1;
      }
    }

    if (count < 100) {
      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
        count += 1;
      }
    }

    const avgR = Math.round(totalR / Math.max(1, count));
    const avgG = Math.round(totalG / Math.max(1, count));
    const avgB = Math.round(totalB / Math.max(1, count));
    return detectExactShadeFromRgb(avgR, avgG, avgB);
  };

  function ensureExactToneProfile() {
    if (!appUser) return null;
    if (appUser.toneProfile?.exactToneRules) return appUser.toneProfile;

    const rgb = appUser.toneProfile?.averageRgb || (appUser.toneProfile?.swatchHex ? hexToRgb(appUser.toneProfile.swatchHex) : null);
    if (!rgb) return appUser.toneProfile || null;

    const brightness = brightnessOf(rgb.r, rgb.g, rgb.b);
    appUser.toneProfile = buildSkinToneProfile(rgb.r, rgb.g, rgb.b, brightness, appUser.toneProfile?.undertone || getBetterUndertone(rgb.r, rgb.g, rgb.b));
    saveUserData();
    return appUser.toneProfile;
  }

  function getExactShadeLevel(item, toneProfile) {
    const rules = toneProfile?.exactToneRules;
    const isUpper = item.category === "shirt" || item.category === "tshirt";
    const shade = item.analysis?.shade || detectExactShadeFromHex(item.analysis?.hex || "#808080").shade;
    const family = item.analysis?.family || detectExactShadeFromHex(item.analysis?.hex || "#808080").family;

    const bestList = isUpper ? rules?.upperBest : rules?.lowerBest;
    const okayList = isUpper ? rules?.upperOkay : rules?.lowerOkay;

    if (!rules) return { level: "okay", shade, family, points: isUpper ? 20 : 14 };
    if (bestList?.includes(shade)) return { level: "best", shade, family, points: isUpper ? 58 : 42 };
    if (okayList?.includes(shade)) return { level: "okay", shade, family, points: isUpper ? 24 : 16 };
    if (rules.avoidFamilies?.includes(family)) return { level: "avoid", shade, family, points: -999 };
    if (toneProfile.preferredFamilies?.includes(family)) return { level: "okay", shade, family, points: isUpper ? 18 : 12 };
    if (toneProfile.okayFamilies?.includes(family)) return { level: "okay", shade, family, points: isUpper ? 12 : 8 };
    return { level: "avoid", shade, family, points: -999 };
  }

  function getPairStyleBonus(upper, lower) {
    let score = 0;
    const garment = getGarmentPairStrength(upper, lower);
    if (garment <= -80) return -999;
    score += garment >= 30 ? 18 : garment >= 10 ? 8 : -8;

    const occasion = getOccasionOverlapScore(upper, lower);
    score += occasion >= 18 ? 12 : occasion >= 10 ? 6 : -10;

    const polish = getStylePolishScore(upper, lower);
    score += polish >= 18 ? 12 : polish >= 12 ? 8 : polish >= 6 ? 4 : -10;

    const distance = getColorDistance(upper.analysis.hex, lower.analysis.hex);
    if (distance >= 45 && distance <= 150) score += 12;
    else if (distance >= 28 && distance < 45) score += 7;
    else if (distance > 150 && distance <= 205) score += 4;
    else score -= 10;

    if (upper.analysis.family === lower.analysis.family && !isNeutralFamily(upper.analysis.family)) score -= 8;
    if (isNeutralFamily(lower.analysis.family) && !isNeutralFamily(upper.analysis.family)) score += 5;
    if (upper.analysis.undertone === lower.analysis.undertone) score += 2;
    return score;
  }

  function getExactOrderMeta(upper, lower, toneProfile) {
    const upperTone = getExactShadeLevel(upper, toneProfile);
    const lowerTone = getExactShadeLevel(lower, toneProfile);

    if (upperTone.level === "avoid" || lowerTone.level === "avoid") {
      return { blocked: true, score: 0, reason: "Not suitable for your exact skin tone." };
    }

    const pairStyle = getPairStyleBonus(upper, lower);
    if (pairStyle <= -900) {
      return { blocked: true, score: 0, reason: "Upper and lower structure do not fit together." };
    }

    let toneAccuracy = upperTone.points + lowerTone.points;
    if (upperTone.level === "best" && lowerTone.level === "best") toneAccuracy += 16;
    else if (upperTone.level === "best" || lowerTone.level === "best") toneAccuracy += 7;

    if (toneProfile?.undertone === upper.analysis.undertone) toneAccuracy += 7;
    if (toneProfile?.undertone === lower.analysis.undertone) toneAccuracy += 5;

    let pairBonus = 0;
    if (toneProfile?.premiumPairs && matchesPairList(upper.analysis.family, lower.analysis.family, toneProfile.premiumPairs)) pairBonus += 10;
    if (upperTone.shade === lowerTone.shade && !isNeutralFamily(upper.analysis.family)) pairBonus -= 8;

    const displayScore = Math.max(0, Math.min(98, Math.round(toneAccuracy + pairStyle + pairBonus)));
    const orderScore = (toneAccuracy * 1000) + ((pairStyle + pairBonus) * 10) + Math.max(0, 260 - Math.round(getColorDistance(upper.analysis.hex, lower.analysis.hex)));

    const reasons = [];
    reasons.push(`${upperTone.shade} upper is ${upperTone.level} for ${toneProfile.swatchName}`);
    reasons.push(`${lowerTone.shade} lower is ${lowerTone.level} for ${toneProfile.swatchName}`);
    if (toneProfile?.premiumPairs && matchesPairList(upper.analysis.family, lower.analysis.family, toneProfile.premiumPairs)) {
      reasons.push("this is one of your tone-friendly color pairings");
    }
    return {
      blocked: false,
      score: displayScore,
      orderScore,
      upperTone,
      lowerTone,
      reason: reasons.join(". ") + "."
    };
  }

  getImprovedMasterScore = function (upper, lower, toneProfile) {
    return getExactOrderMeta(rebuildItemAnalysis(upper), rebuildItemAnalysis(lower), toneProfile || ensureExactToneProfile()).score;
  };

  getImprovedReason = function (upper, lower, score, toneProfile) {
    return getExactOrderMeta(rebuildItemAnalysis(upper), rebuildItemAnalysis(lower), toneProfile || ensureExactToneProfile()).reason;
  };

  renderSuggestions = function (combos) {
    if (!suggestionGrid || !suggestionEmptyState) return;
    suggestionGrid.innerHTML = "";

    if (!combos.length) {
      suggestionEmptyState.style.display = "block";
      suggestionEmptyState.textContent = "No exact skin-tone outfit matches found yet. Upload more outfit colors.";
      return;
    }

    suggestionEmptyState.style.display = "none";

    if (!document.getElementById("omExactToneStyle")) {
      const style = document.createElement("style");
      style.id = "omExactToneStyle";
      style.textContent = `
        .om-tone-chip{display:inline-flex;gap:6px;align-items:center;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.12);font-size:11px;font-weight:700;margin-bottom:8px}
        .om-tone-small{font-size:11px;opacity:.82;line-height:1.4;margin-top:6px}
        .om-score-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
        .om-score-main{font-size:22px;font-weight:800;line-height:1}
      `;
      document.head.appendChild(style);
    }

    const frag = document.createDocumentFragment();
    combos.forEach((combo, index) => {
      const mode = getBetterOutfitMode(combo.upper, combo.lower);
      const card = document.createElement("div");
      card.className = "suggestion-card";
      card.innerHTML = `
        <div class="suggestion-top">
          <div>
            <div class="om-tone-chip">${index === 0 ? "Best Exact Tone Match" : `Rank ${index + 1}`}</div>
            <h4>${combo.upper.label} + ${combo.lower.label}</h4>
            <p>${combo.upper.analysis.shade} + ${combo.lower.analysis.shade}</p>
          </div>
          <div class="om-score-wrap">
            <div class="om-score-main">${combo.score}</div>
            <div class="om-tone-small">Exact tone score</div>
          </div>
        </div>
        <div class="combo-row">
          <div class="combo-piece">
            <img src="${combo.upper.src}" alt="${combo.upper.label}">
            <h5>${combo.upper.label}</h5>
            <p>${combo.upper.analysis.shade}<br>${combo.upper.analysis.family}<br>${combo.upper.analysis.hex}</p>
          </div>
          <div class="combo-piece">
            <img src="${combo.lower.src}" alt="${combo.lower.label}">
            <h5>${combo.lower.label}</h5>
            <p>${combo.lower.analysis.shade}<br>${combo.lower.analysis.family}<br>${combo.lower.analysis.hex}</p>
          </div>
        </div>
        <div class="reason-box"><strong>Skin tone:</strong> ${combo.toneName}<br><strong>Style:</strong> ${mode}<br>${combo.reason}</div>
      `;
      frag.appendChild(card);
    });
    suggestionGrid.appendChild(frag);
  };

  generateSuggestions = function () {
    const toneProfile = ensureExactToneProfile();
    const uppers = [...clothes.shirt, ...clothes.tshirt].map(rebuildItemAnalysis);
    const lowers = [...clothes.pant, ...clothes.nightPant, ...clothes.shorts].map(rebuildItemAnalysis);

    clothes.shirt = uppers.filter((i) => i.category === "shirt");
    clothes.tshirt = uppers.filter((i) => i.category === "tshirt");
    clothes.pant = lowers.filter((i) => i.category === "pant");
    clothes.nightPant = lowers.filter((i) => i.category === "nightPant");
    clothes.shorts = lowers.filter((i) => i.category === "shorts");

    if (!uppers.length || !lowers.length || !toneProfile) {
      renderSuggestions([]);
      return;
    }

    const combos = [];
    const seen = new Set();

    for (const upper of uppers) {
      for (const lower of lowers) {
        const meta = getExactOrderMeta(upper, lower, toneProfile);
        if (meta.blocked) continue;
        if (meta.score < 48) continue;

        const key = [upper.category, upper.analysis.shade, lower.category, lower.analysis.shade].join("|");
        if (seen.has(key)) continue;
        seen.add(key);

        combos.push({
          upper,
          lower,
          score: meta.score,
          orderScore: meta.orderScore,
          toneName: toneProfile.swatchName,
          reason: meta.reason
        });
      }
    }

    combos.sort((a, b) => b.orderScore - a.orderScore || b.score - a.score);
    renderSuggestions(combos);
  };

  window.getExactToneOutfitLists = function () {
    const toneProfile = ensureExactToneProfile();
    if (!toneProfile?.exactToneRules) return null;
    return {
      skinTone: toneProfile.label,
      upperBest: toneProfile.exactToneRules.upperBest,
      lowerBest: toneProfile.exactToneRules.lowerBest,
      upperOkay: toneProfile.exactToneRules.upperOkay,
      lowerOkay: toneProfile.exactToneRules.lowerOkay,
      avoidFamilies: toneProfile.exactToneRules.avoidFamilies
    };
  };

  try {
    if (appUser?.toneProfile?.averageRgb) {
      const rgb = appUser.toneProfile.averageRgb;
      appUser.toneProfile = buildSkinToneProfile(rgb.r, rgb.g, rgb.b, brightnessOf(rgb.r, rgb.g, rgb.b), appUser.toneProfile.undertone);
      saveUserData();
    }
    generateSuggestions();
  } catch (e) {}
})();
/* ========= OUTFITMATCH HIDE SCORE IN FAVORITES PATCH ========= */
(function () {
  if (window.__OM_HIDE_FAV_SCORE_PATCH__) return;
  window.__OM_HIDE_FAV_SCORE_PATCH__ = true;

  function addFavScoreHideStyle() {
    if (document.getElementById("omHideFavScoreStyle")) return;

    const style = document.createElement("style");
    style.id = "omHideFavScoreStyle";
    style.textContent = `
      #favoritesPage .suggestion-score,
      #favoritesPage .score,
      #favoritesPage .score-badge,
      #favoritesPage .score-chip,
      #favoritesPage .score-tag,
      #favoritesPage .match-score,
      #favoritesPage .outfit-score,
      #favoritesPage .om-score-wrap,
      #favoritesPage .om-score-main,
      #favoritesPage .om-score-number,
      #favoritesPage .om-score-level,
      #favoritesPage .om-score-meta,
      #favoritesPage .om-tone-small {
        display: none !important;
        visibility: hidden !important;
      }

      #favoritesPage .suggestion-top {
        align-items: flex-start !important;
      }

      #favoritesPage .suggestion-top > div:last-child:empty {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function looksLikeScoreText(text) {
    const t = String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!t) return false;

    return (
      t === "score" ||
      t === "exact tone score" ||
      t === "skin tone accuracy" ||
      t === "best → least ranked" ||
      t === "best to least ranked" ||
      t.indexOf("match score") !== -1 ||
      t.indexOf("outfit score") !== -1 ||
      t.indexOf("tone score") !== -1 ||
      /^score\s*[:\-]?\s*\d+/.test(t) ||
      /^\d+\s*\/\s*100$/.test(t) ||
      /^\d+\s*%$/.test(t) ||
      /^\d{1,3}$/.test(t)
    );
  }

  function removeFavScores(root) {
    if (!root) return;

    const selectors = [
      ".suggestion-score",
      ".score",
      ".score-badge",
      ".score-chip",
      ".score-tag",
      ".match-score",
      ".outfit-score",
      ".om-score-wrap",
      ".om-score-main",
      ".om-score-number",
      ".om-score-level",
      ".om-score-meta",
      ".om-tone-small"
    ];

    selectors.forEach(function (selector) {
      root.querySelectorAll(selector).forEach(function (el) {
        el.remove();
      });
    });

    root.querySelectorAll("*").forEach(function (el) {
      if (!el || el.children.length > 0) return;
      const text = (el.textContent || "").trim();
      if (!text) return;

      if (looksLikeScoreText(text)) {
        el.remove();
      }
    });
  }

  function cleanFavoritesPage() {
    const favoritesPage = document.getElementById("favoritesPage");
    if (!favoritesPage) return;

    removeFavScores(favoritesPage);

    favoritesPage.querySelectorAll(".suggestion-top").forEach(function (top) {
      const children = Array.from(top.children).filter(Boolean);
      if (children.length >= 2) {
        const last = children[children.length - 1];
        const txt = (last.textContent || "").trim();
        if (!txt || looksLikeScoreText(txt)) {
          last.remove();
        }
      }
    });
  }

  addFavScoreHideStyle();
  cleanFavoritesPage();

  const observer = new MutationObserver(function () {
    cleanFavoritesPage();
  });

  function startObserver() {
    const favoritesPage = document.getElementById("favoritesPage");
    if (!favoritesPage) {
      setTimeout(startObserver, 400);
      return;
    }
    observer.observe(favoritesPage, {
      childList: true,
      subtree: true
    });
    cleanFavoritesPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }

  document.addEventListener("click", function () {
    setTimeout(cleanFavoritesPage, 80);
    setTimeout(cleanFavoritesPage, 220);
  });
})();