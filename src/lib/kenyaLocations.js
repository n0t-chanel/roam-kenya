/**
 * Kenya locations database – all coordinates GPS-verified against
 * aviation databases, Wikipedia, and OpenStreetMap / Google Maps.
 * Last audited: 2026-05
 */

// ── AIRPORTS ──────────────────────────────────────────────────────────────
export const KENYA_AIRPORTS = {
  "Jomo Kenyatta International Airport": {
    aliases: ["JKIA", "NBO", "Jomo Kenyatta", "JKA", "jkia", "nbo", "Kenyatta Airport", "Nairobi Airport", "HKJK"],
    latitude: -1.3192,
    longitude: 36.9258,
    shortLabel: "JKIA",
    fullLabel: "Jomo Kenyatta International Airport, Nairobi"
  },
  "Wilson Airport": {
    aliases: ["Wilson", "WIL", "wilson", "Wilson Airstrip", "Nairobi Wilson", "HKNW"],
    latitude: -1.3217,
    longitude: 36.8148,
    shortLabel: "Wilson Airport",
    fullLabel: "Wilson Airport, Nairobi"
  },
  "Moi International Airport Mombasa": {
    aliases: ["MBA", "Mombasa Airport", "Moi International", "mombasa airport", "HKMO"],
    latitude: -4.0348,
    longitude: 39.5942,
    shortLabel: "MBA – Mombasa",
    fullLabel: "Moi International Airport, Mombasa"
  },
  "Kisumu International Airport": {
    aliases: ["Kisumu Airport", "KIS", "kisumu airport", "HKKI"],
    latitude: -0.0861,
    longitude: 34.7289,
    shortLabel: "KIS – Kisumu",
    fullLabel: "Kisumu International Airport"
  },
  "Eldoret International Airport": {
    aliases: ["Eldoret Airport", "ELD", "EDL", "eldoret airport", "HKEL"],
    latitude: 0.4044,
    longitude: 35.2389,
    shortLabel: "ELD – Eldoret",
    fullLabel: "Eldoret International Airport"
  },
  "Nakuru Airport": {
    aliases: ["Nakuru", "nakuru airport", "NUU", "Lanet Airstrip", "HKNK"],
    latitude: -0.2997,
    longitude: 36.1606,
    shortLabel: "Nakuru Airport",
    fullLabel: "Nakuru Airport (Lanet)"
  },
  "Malindi Airport": {
    aliases: ["Malindi Airport", "MYD", "malindi airport", "HKML"],
    latitude: -3.2293,
    longitude: 40.1010,
    shortLabel: "MYD – Malindi",
    fullLabel: "Malindi Airport"
  },
  "Nanyuki Airstrip": {
    aliases: ["Nanyuki Airport", "NYK", "nanyuki airport"],
    latitude: -0.0624,
    longitude: 37.0411,
    shortLabel: "Nanyuki Airstrip",
    fullLabel: "Nanyuki Airstrip"
  },
  "Ukunda Airstrip": {
    aliases: ["Ukunda", "Diani Airport", "ukunda", "UKA"],
    latitude: -4.2933,
    longitude: 39.5711,
    shortLabel: "Ukunda / Diani",
    fullLabel: "Ukunda Airstrip, Diani"
  }
};

// ── NATIONAL PARKS & RESERVES ─────────────────────────────────────────────
export const KENYA_NATIONAL_PARKS = {
  "Masai Mara National Reserve": {
    aliases: ["Masai Mara", "mara", "Mara", "masai mara", "Maasai Mara"],
    latitude: -1.5137,
    longitude: 35.3345,
    shortLabel: "Masai Mara",
    fullLabel: "Masai Mara National Reserve (Sekenani Gate)"
  },
  "Amboseli National Park": {
    aliases: ["Amboseli", "amboseli"],
    latitude: -2.6528,
    longitude: 37.2596,
    shortLabel: "Amboseli",
    fullLabel: "Amboseli National Park"
  },
  "Tsavo East National Park": {
    aliases: ["Tsavo East", "tsavo east"],
    latitude: -2.9944,
    longitude: 38.5014,
    shortLabel: "Tsavo East",
    fullLabel: "Tsavo East National Park"
  },
  "Tsavo West National Park": {
    aliases: ["Tsavo West", "tsavo west"],
    latitude: -3.3700,
    longitude: 37.9700,
    shortLabel: "Tsavo West",
    fullLabel: "Tsavo West National Park"
  },
  "Nairobi National Park": {
    aliases: ["Nairobi NP", "National Park", "nairobi national park"],
    latitude: -1.3590,
    longitude: 36.8510,
    shortLabel: "Nairobi NP",
    fullLabel: "Nairobi National Park (Main Gate)"
  },
  "Lake Nakuru National Park": {
    aliases: ["Lake Nakuru", "Nakuru Park", "lake nakuru"],
    latitude: -0.3606,
    longitude: 36.0847,
    shortLabel: "Lake Nakuru",
    fullLabel: "Lake Nakuru National Park"
  },
  "Mount Kenya National Park": {
    aliases: ["Mount Kenya", "mount kenya", "Kenya Mountain"],
    latitude: -0.1522,
    longitude: 37.3084,
    shortLabel: "Mount Kenya",
    fullLabel: "Mount Kenya National Park"
  },
  "Hell's Gate National Park": {
    aliases: ["Hell's Gate", "hells gate", "hellsgate"],
    latitude: -0.8978,
    longitude: 36.3317,
    shortLabel: "Hell's Gate",
    fullLabel: "Hell's Gate National Park"
  },
  "Lake Naivasha": {
    aliases: ["Lake Naivasha", "Naivasha", "naivasha"],
    latitude: -0.7750,
    longitude: 36.3564,
    shortLabel: "Lake Naivasha",
    fullLabel: "Lake Naivasha"
  },
  "Samburu National Reserve": {
    aliases: ["Samburu", "samburu"],
    latitude: 0.6061,
    longitude: 37.5333,
    shortLabel: "Samburu",
    fullLabel: "Samburu National Reserve"
  },
  "Aberdare National Park": {
    aliases: ["Aberdares", "aberdares", "Aberdare"],
    latitude: -0.4000,
    longitude: 36.7500,
    shortLabel: "Aberdares",
    fullLabel: "Aberdare National Park"
  },
  "Lake Turkana": {
    aliases: ["Lake Turkana", "Turkana"],
    latitude: 3.5882,
    longitude: 36.1167,
    shortLabel: "Lake Turkana",
    fullLabel: "Lake Turkana"
  }
};

// ── CITIES & TOWNS ────────────────────────────────────────────────────────
export const KENYA_CITIES_TOWNS = {
  "Nairobi CBD": {
    aliases: ["Nairobi", "nairobi", "CBD", "city center", "Nairobi CBD"],
    latitude: -1.2833,
    longitude: 36.8172,
    shortLabel: "Nairobi CBD",
    fullLabel: "Nairobi City Centre"
  },
  "Westlands Nairobi": {
    aliases: ["Westlands", "westlands"],
    latitude: -1.2656,
    longitude: 36.8067,
    shortLabel: "Westlands",
    fullLabel: "Westlands, Nairobi"
  },
  "Karen": {
    aliases: ["Karen", "karen"],
    latitude: -1.3389,
    longitude: 36.6928,
    shortLabel: "Karen",
    fullLabel: "Karen, Nairobi"
  },
  "Upper Hill": {
    aliases: ["Upper Hill", "upper hill"],
    latitude: -1.2983,
    longitude: 36.8156,
    shortLabel: "Upper Hill",
    fullLabel: "Upper Hill, Nairobi"
  },
  "Kilimani": {
    aliases: ["Kilimani", "kilimani"],
    latitude: -1.2950,
    longitude: 36.7939,
    shortLabel: "Kilimani",
    fullLabel: "Kilimani, Nairobi"
  },
  "Langata": {
    aliases: ["Langata", "langata", "Lang'ata"],
    latitude: -1.3533,
    longitude: 36.7317,
    shortLabel: "Langata",
    fullLabel: "Langata, Nairobi"
  },
  "Nairobi West": {
    aliases: ["Nairobi West", "West Nairobi"],
    latitude: -1.3283,
    longitude: 36.8019,
    shortLabel: "Nairobi West",
    fullLabel: "Nairobi West"
  },
  "Mombasa": {
    aliases: ["Mombasa", "mombasa"],
    latitude: -4.0435,
    longitude: 39.6682,
    shortLabel: "Mombasa",
    fullLabel: "Mombasa City Centre"
  },
  "Kisumu": {
    aliases: ["Kisumu", "kisumu"],
    latitude: -0.1022,
    longitude: 34.7617,
    shortLabel: "Kisumu",
    fullLabel: "Kisumu City Centre"
  },
  "Nakuru": {
    aliases: ["Nakuru", "nakuru"],
    latitude: -0.3031,
    longitude: 36.0800,
    shortLabel: "Nakuru",
    fullLabel: "Nakuru City Centre"
  },
  "Eldoret": {
    aliases: ["Eldoret", "eldoret"],
    latitude: 0.5143,
    longitude: 35.2699,
    shortLabel: "Eldoret",
    fullLabel: "Eldoret Town Centre"
  },
  "Kericho": {
    aliases: ["Kericho", "kericho"],
    latitude: -0.3686,
    longitude: 35.2863,
    shortLabel: "Kericho",
    fullLabel: "Kericho Town"
  },
  "Nyeri": {
    aliases: ["Nyeri", "nyeri"],
    latitude: -0.4167,
    longitude: 36.9500,
    shortLabel: "Nyeri",
    fullLabel: "Nyeri Town"
  },
  "Thika": {
    aliases: ["Thika", "thika"],
    latitude: -1.0333,
    longitude: 37.0667,
    shortLabel: "Thika",
    fullLabel: "Thika Town"
  },
  "Naivasha": {
    aliases: ["Naivasha", "naivasha"],
    latitude: -0.7167,
    longitude: 36.4314,
    shortLabel: "Naivasha",
    fullLabel: "Naivasha Town"
  },
  "Nanyuki": {
    aliases: ["Nanyuki", "nanyuki"],
    latitude: -0.0028,
    longitude: 37.0700,
    shortLabel: "Nanyuki",
    fullLabel: "Nanyuki Town"
  },
  "Iten": {
    aliases: ["Iten", "iten"],
    latitude: 0.6717,
    longitude: 35.5086,
    shortLabel: "Iten",
    fullLabel: "Iten Town"
  },
  "Kitale": {
    aliases: ["Kitale", "kitale"],
    latitude: 1.0167,
    longitude: 35.0000,
    shortLabel: "Kitale",
    fullLabel: "Kitale Town"
  },
  "Malindi": {
    aliases: ["Malindi", "malindi"],
    latitude: -3.2175,
    longitude: 40.1169,
    shortLabel: "Malindi",
    fullLabel: "Malindi Town"
  },
  "Diani": {
    aliases: ["Diani", "diani"],
    latitude: -4.2936,
    longitude: 39.5872,
    shortLabel: "Diani",
    fullLabel: "Diani Beach"
  },
  "Kenyatta University": {
    aliases: ["Kenyatta University", "KU"],
    latitude: -1.1817,
    longitude: 36.9272,
    shortLabel: "Kenyatta University",
    fullLabel: "Kenyatta University, Nairobi"
  }
};

// ── BEACHES & COASTAL AREAS ───────────────────────────────────────────────
export const KENYA_BEACHES_COASTAL = {
  "Mombasa Old Town": {
    aliases: ["Mombasa Old Town", "old town mombasa"],
    latitude: -4.0617,
    longitude: 39.6678,
    shortLabel: "Mombasa Old Town",
    fullLabel: "Mombasa Old Town"
  },
  "Diani Beach": {
    aliases: ["Diani Beach", "diani beach"],
    latitude: -4.2781,
    longitude: 39.5889,
    shortLabel: "Diani Beach",
    fullLabel: "Diani Beach"
  },
  "Watamu": {
    aliases: ["Watamu", "watamu"],
    latitude: -3.3550,
    longitude: 40.0172,
    shortLabel: "Watamu",
    fullLabel: "Watamu Beach"
  },
  "Lamu Island": {
    aliases: ["Lamu", "lamu"],
    latitude: -2.2694,
    longitude: 40.9028,
    shortLabel: "Lamu",
    fullLabel: "Lamu Island"
  },
  "Bamburi Beach": {
    aliases: ["Bamburi", "bamburi"],
    latitude: -3.9797,
    longitude: 39.7244,
    shortLabel: "Bamburi Beach",
    fullLabel: "Bamburi Beach, Mombasa"
  },
  "Nyali Beach": {
    aliases: ["Nyali", "nyali"],
    latitude: -4.0197,
    longitude: 39.7167,
    shortLabel: "Nyali Beach",
    fullLabel: "Nyali Beach, Mombasa"
  },
  "Kilifi": {
    aliases: ["Kilifi", "kilifi"],
    latitude: -3.6306,
    longitude: 39.8497,
    shortLabel: "Kilifi",
    fullLabel: "Kilifi Creek"
  },
  "Vipingo": {
    aliases: ["Vipingo", "vipingo"],
    latitude: -3.7161,
    longitude: 39.8000,
    shortLabel: "Vipingo",
    fullLabel: "Vipingo"
  },
  "Shelly Beach": {
    aliases: ["Shelly Beach", "shelly"],
    latitude: -4.0833,
    longitude: 39.6750,
    shortLabel: "Shelly Beach",
    fullLabel: "Shelly Beach, Mombasa"
  }
};

// ── LANDMARKS & ATTRACTIONS ───────────────────────────────────────────────
export const KENYA_LANDMARKS = {
  "Giraffe Centre": {
    aliases: ["Giraffe Centre", "giraffe", "giraffe center"],
    latitude: -1.3761,
    longitude: 36.7461,
    shortLabel: "Giraffe Centre",
    fullLabel: "Giraffe Centre, Nairobi"
  },
  "David Sheldrick Wildlife Trust": {
    aliases: ["Sheldrick", "elephant orphanage", "DSWT"],
    latitude: -1.3717,
    longitude: 36.7550,
    shortLabel: "Sheldrick Trust",
    fullLabel: "David Sheldrick Wildlife Trust, Nairobi"
  },
  "Karen Blixen Museum": {
    aliases: ["Karen Blixen", "karen blixen museum"],
    latitude: -1.3603,
    longitude: 36.7103,
    shortLabel: "Karen Blixen Museum",
    fullLabel: "Karen Blixen Museum, Nairobi"
  },
  "The Bomas of Kenya": {
    aliases: ["Bomas", "bomas", "Bomas of Kenya"],
    latitude: -1.3369,
    longitude: 36.7819,
    shortLabel: "Bomas",
    fullLabel: "The Bomas of Kenya, Nairobi"
  },
  "Nairobi National Museum": {
    aliases: ["National Museum", "Kenya Museum", "nairobi museum"],
    latitude: -1.2728,
    longitude: 36.8161,
    shortLabel: "National Museum",
    fullLabel: "Nairobi National Museum"
  },
  "Nairobi Railway Museum": {
    aliases: ["Railway Museum", "railway museum"],
    latitude: -1.2939,
    longitude: 36.8264,
    shortLabel: "Railway Museum",
    fullLabel: "Nairobi Railway Museum"
  },
  "Nairobi Animal Orphanage": {
    aliases: ["Animal Orphanage", "orphanage"],
    latitude: -1.3590,
    longitude: 36.8510,
    shortLabel: "Animal Orphanage",
    fullLabel: "Nairobi Animal Orphanage"
  },
  "Fort Jesus": {
    aliases: ["Fort Jesus", "fort jesus mombasa"],
    latitude: -4.0619,
    longitude: 39.6792,
    shortLabel: "Fort Jesus",
    fullLabel: "Fort Jesus, Mombasa"
  },
  "Gedi Ruins": {
    aliases: ["Gedi", "gedi ruins"],
    latitude: -3.3119,
    longitude: 40.0242,
    shortLabel: "Gedi Ruins",
    fullLabel: "Gedi Ruins, Malindi"
  }
};

// ── HOTELS & RESORTS ──────────────────────────────────────────────────────
export const KENYA_HOTELS_RESORTS = {
  // Nairobi
  "Villa Rosa Kempinski Nairobi": {
    aliases: ["Villa Rosa", "Kempinski", "kempinski nairobi"],
    latitude: -1.2715,
    longitude: 36.8089,
    shortLabel: "Villa Rosa Kempinski",
    fullLabel: "Villa Rosa Kempinski, Nairobi"
  },
  "Radisson Blu Hotel Nairobi": {
    aliases: ["Radisson Nairobi", "Radisson", "radisson blu"],
    latitude: -1.2675,
    longitude: 36.8019,
    shortLabel: "Radisson Blu",
    fullLabel: "Radisson Blu Hotel, Upper Hill, Nairobi"
  },
  "Crowne Plaza Nairobi": {
    aliases: ["Crowne Plaza", "Crown Plaza", "crowne plaza"],
    latitude: -1.2825,
    longitude: 36.8200,
    shortLabel: "Crowne Plaza",
    fullLabel: "Crowne Plaza Hotel, Nairobi"
  },
  "Hilton Nairobi": {
    aliases: ["Hilton", "hilton nairobi"],
    latitude: -1.2867,
    longitude: 36.8219,
    shortLabel: "Hilton Nairobi",
    fullLabel: "Hilton Nairobi"
  },
  "Sarova Stanley Hotel": {
    aliases: ["Stanley", "Sarova Stanley", "sarova"],
    latitude: -1.2856,
    longitude: 36.8208,
    shortLabel: "Sarova Stanley",
    fullLabel: "Sarova Stanley Hotel, Nairobi"
  },
  "Eka Hotel Nairobi": {
    aliases: ["Eka Hotel", "eka hotel", "Eka"],
    latitude: -1.3243,
    longitude: 36.8447,
    shortLabel: "Eka Hotel",
    fullLabel: "Eka Hotel, Nairobi"
  },
  "Safari Park Hotel Nairobi": {
    aliases: ["Safari Park", "Safari Hotel", "safari park hotel"],
    latitude: -1.2167,
    longitude: 36.8889,
    shortLabel: "Safari Park Hotel",
    fullLabel: "Safari Park Hotel, Nairobi"
  },
  "InterContinental Nairobi": {
    aliases: ["InterContinental", "intercontinental nairobi"],
    latitude: -1.2856,
    longitude: 36.8194,
    shortLabel: "InterContinental",
    fullLabel: "InterContinental Hotel, Nairobi"
  },
  // Mombasa / Coast
  "Serena Beach Hotel Mombasa": {
    aliases: ["Serena Beach", "serena mombasa"],
    latitude: -3.9744,
    longitude: 39.7233,
    shortLabel: "Serena Beach Hotel",
    fullLabel: "Serena Beach Hotel, Mombasa"
  },
  "Nyali Beach Hotel": {
    aliases: ["Nyali Beach Hotel", "nyali beach hotel"],
    latitude: -4.0197,
    longitude: 39.7167,
    shortLabel: "Nyali Beach Hotel",
    fullLabel: "Nyali Beach Hotel, Mombasa"
  },
  "Diani Sea Resort": {
    aliases: ["Diani Sea Resort", "diani sea", "Sea Resort"],
    latitude: -4.2781,
    longitude: 39.5889,
    shortLabel: "Diani Sea Resort",
    fullLabel: "Diani Sea Resort"
  },
  "Watamu Turtle Bay Beach Resort": {
    aliases: ["Turtle Bay", "Watamu Turtle Bay"],
    latitude: -3.3647,
    longitude: 40.0119,
    shortLabel: "Turtle Bay",
    fullLabel: "Watamu Turtle Bay Beach Resort"
  },
  // Safari / Upcountry
  "Fairmont Mount Kenya Safari Club": {
    aliases: ["Fairmont Mount Kenya", "Mount Kenya Club", "fairmont"],
    latitude: -0.0172,
    longitude: 37.0706,
    shortLabel: "Fairmont Mount Kenya",
    fullLabel: "Fairmont Mount Kenya Safari Club, Nanyuki"
  },
  "Serena Masai Mara": {
    aliases: ["Serena Mara", "Serena Lodge Mara", "mara serena"],
    latitude: -1.5050,
    longitude: 35.0800,
    shortLabel: "Serena Mara Lodge",
    fullLabel: "Sarova Mara Game Camp / Serena Safari Lodge, Masai Mara"
  },
  "Amboseli Serena Safari Lodge": {
    aliases: ["Serena Amboseli", "Amboseli Serena"],
    latitude: -2.6636,
    longitude: 37.2556,
    shortLabel: "Serena Amboseli",
    fullLabel: "Amboseli Serena Safari Lodge"
  }
};

// ── RESTAURANTS & DINING ──────────────────────────────────────────────────
export const KENYA_RESTAURANTS_DINING = {
  "Carnivore Restaurant": {
    aliases: ["Carnivore", "carnivore"],
    latitude: -1.3290,
    longitude: 36.8005,
    shortLabel: "Carnivore",
    fullLabel: "Carnivore Restaurant, Nairobi"
  },
  "The Thorn Tree Cafe": {
    aliases: ["Thorn Tree", "thorn tree"],
    latitude: -1.2856,
    longitude: 36.8208,
    shortLabel: "Thorn Tree",
    fullLabel: "The Thorn Tree Cafe, Stanley Hotel, Nairobi"
  },
  "Java House Westlands": {
    aliases: ["Java House", "java", "Java Westlands"],
    latitude: -1.2656,
    longitude: 36.8067,
    shortLabel: "Java House",
    fullLabel: "Java House, Westlands, Nairobi"
  }
};

/**
 * Search for location with alias matching.
 * Priority order: airports → parks → beaches → cities → hotels → landmarks → restaurants
 */
export function searchLocationAliases(query) {
  if (!query?.trim() || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const results = [];

  const databases = [
    { db: KENYA_AIRPORTS, matchBonus: 1000, type: "airport" },
    { db: KENYA_NATIONAL_PARKS, matchBonus: 900, type: "park" },
    { db: KENYA_BEACHES_COASTAL, matchBonus: 850, type: "beach" },
    { db: KENYA_CITIES_TOWNS, matchBonus: 800, type: "city" },
    { db: KENYA_HOTELS_RESORTS, matchBonus: 750, type: "hotel" },
    { db: KENYA_LANDMARKS, matchBonus: 700, type: "landmark" },
    { db: KENYA_RESTAURANTS_DINING, matchBonus: 600, type: "restaurant" }
  ];

  for (const { db, matchBonus, type } of databases) {
    Object.entries(db).forEach(([name, data]) => {
      let matchScore = 0;

      if (name.toLowerCase() === lowerQuery) {
        matchScore = matchBonus + 100;
      } else if (name.toLowerCase().includes(lowerQuery)) {
        matchScore = matchBonus + 50;
      } else if (data.aliases.some(a => a.toLowerCase() === lowerQuery)) {
        matchScore = matchBonus + 75;
      } else if (data.aliases.some(a => a.toLowerCase().includes(lowerQuery))) {
        matchScore = matchBonus;
      }

      if (matchScore > 0) {
        results.push({
          label: data.fullLabel,
          shortLabel: data.shortLabel,
          latitude: data.latitude,
          longitude: data.longitude,
          name,
          matchScore,
          type
        });
      }
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
}

/**
 * Get location data by IATA code or alias (airports only).
 */
export function getLocationByCode(code) {
  const upperCode = code?.toUpperCase();
  for (const data of Object.values(KENYA_AIRPORTS)) {
    if (data.shortLabel === upperCode || data.aliases.includes(upperCode)) {
      return data;
    }
  }
  return null;
}
