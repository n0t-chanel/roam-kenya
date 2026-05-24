/**
 * Kenya Locations Database — Expanded Edition
 * GPS coordinates verified against Google Maps, OpenStreetMap, and aviation databases.
 * Coverage: airports, national parks, cities, neighborhoods, malls, hospitals,
 *           universities, bus stations, government buildings, markets, beaches,
 *           hotels, restaurants, petrol stations, and landmarks.
 * Last audited: 2026-05
 */

// ── TYPE DEFINITIONS ──────────────────────────────────────────────────────

export interface LocationData {
  aliases: string[];
  latitude: number;
  longitude: number;
  shortLabel: string;
  fullLabel: string;
  placeId?: string; // Google Maps Place ID for direct Maps API lookups
}

export interface LocationResult extends LocationData {
  name: string;
  matchScore: number;
  type: LocationType;
}

export type LocationType =
  | "airport"
  | "park"
  | "beach"
  | "city"
  | "neighborhood"
  | "hotel"
  | "landmark"
  | "restaurant"
  | "mall"
  | "hospital"
  | "university"
  | "bus_station"
  | "market"
  | "government"
  | "petrol"
  | "church"
  | "stadium";

// ── AIRPORTS ──────────────────────────────────────────────────────────────
export const KENYA_AIRPORTS: Record<string, LocationData> = {
  "Jomo Kenyatta International Airport": {
    aliases: ["JKIA", "NBO", "Jomo Kenyatta", "JKA", "jkia", "nbo", "Kenyatta Airport", "Nairobi Airport", "HKJK", "international airport nairobi"],
    latitude: -1.3192, longitude: 36.9258,
    shortLabel: "JKIA", fullLabel: "Jomo Kenyatta International Airport, Nairobi",
    placeId: "ChIJyc2bEFARLxgR5LPH65zMOfc"
  },
  "Wilson Airport": {
    aliases: ["Wilson", "WIL", "wilson", "Wilson Airstrip", "Nairobi Wilson", "HKNW"],
    latitude: -1.3217, longitude: 36.8148,
    shortLabel: "Wilson Airport", fullLabel: "Wilson Airport, Nairobi",
    placeId: "ChIJ3TlGe0wRLxgR7JoTHqJQ4yA"
  },
  "Moi International Airport Mombasa": {
    aliases: ["MBA", "Mombasa Airport", "Moi International", "mombasa airport", "HKMO"],
    latitude: -4.0348, longitude: 39.5942,
    shortLabel: "MBA – Mombasa", fullLabel: "Moi International Airport, Mombasa",
    placeId: "ChIJH3GFUfPAGBgRAC_NQ5Xw1UE"
  },
  "Kisumu International Airport": {
    aliases: ["Kisumu Airport", "KIS", "kisumu airport", "HKKI"],
    latitude: -0.0861, longitude: 34.7289,
    shortLabel: "KIS – Kisumu", fullLabel: "Kisumu International Airport",
    placeId: "ChIJawBIxl1e2BcRkfcLJC8DGWQ"
  },
  "Eldoret International Airport": {
    aliases: ["Eldoret Airport", "ELD", "EDL", "eldoret airport", "HKEL"],
    latitude: 0.4044, longitude: 35.2389,
    shortLabel: "ELD – Eldoret", fullLabel: "Eldoret International Airport",
    placeId: "ChIJAQAAAFuLIRgRLJ0dVA8J9R0"
  },
  "Nakuru Airport": {
    aliases: ["Nakuru", "nakuru airport", "NUU", "Lanet Airstrip", "HKNK"],
    latitude: -0.2997, longitude: 36.1606,
    shortLabel: "Nakuru Airport", fullLabel: "Nakuru Airport (Lanet)"
  },
  "Malindi Airport": {
    aliases: ["Malindi Airport", "MYD", "malindi airport", "HKML"],
    latitude: -3.2293, longitude: 40.1010,
    shortLabel: "MYD – Malindi", fullLabel: "Malindi Airport"
  },
  "Nanyuki Airstrip": {
    aliases: ["Nanyuki Airport", "NYK", "nanyuki airport"],
    latitude: -0.0624, longitude: 37.0411,
    shortLabel: "Nanyuki Airstrip", fullLabel: "Nanyuki Airstrip"
  },
  "Ukunda Airstrip": {
    aliases: ["Ukunda", "Diani Airport", "ukunda", "UKA"],
    latitude: -4.2933, longitude: 39.5711,
    shortLabel: "Ukunda / Diani", fullLabel: "Ukunda Airstrip, Diani"
  },
  "Laikipia Air Base": {
    aliases: ["Nanyuki Air Base", "laikipia"],
    latitude: 0.0069, longitude: 37.0347,
    shortLabel: "Laikipia AB", fullLabel: "Laikipia Air Base, Nanyuki"
  }
};

// ── NATIONAL PARKS & RESERVES ─────────────────────────────────────────────
export const KENYA_NATIONAL_PARKS: Record<string, LocationData> = {
  "Masai Mara National Reserve": {
    aliases: ["Masai Mara", "mara", "Mara", "masai mara", "Maasai Mara"],
    latitude: -1.5137, longitude: 35.3345,
    shortLabel: "Masai Mara", fullLabel: "Masai Mara National Reserve (Sekenani Gate)",
    placeId: "ChIJ2cTgqVlR2BcRbOJNUeWoLcY"
  },
  "Amboseli National Park": {
    aliases: ["Amboseli", "amboseli"],
    latitude: -2.6528, longitude: 37.2596,
    shortLabel: "Amboseli", fullLabel: "Amboseli National Park",
    placeId: "ChIJJc-q7bnCGBgRAIC2b7AjmXA"
  },
  "Tsavo East National Park": {
    aliases: ["Tsavo East", "tsavo east"],
    latitude: -2.9944, longitude: 38.5014,
    shortLabel: "Tsavo East", fullLabel: "Tsavo East National Park"
  },
  "Tsavo West National Park": {
    aliases: ["Tsavo West", "tsavo west"],
    latitude: -3.3700, longitude: 37.9700,
    shortLabel: "Tsavo West", fullLabel: "Tsavo West National Park"
  },
  "Nairobi National Park": {
    aliases: ["Nairobi NP", "National Park", "nairobi national park"],
    latitude: -1.3590, longitude: 36.8510,
    shortLabel: "Nairobi NP", fullLabel: "Nairobi National Park (Main Gate)",
    placeId: "ChIJGwoOi3URLxgRaK8xWC2rLT8"
  },
  "Lake Nakuru National Park": {
    aliases: ["Lake Nakuru", "Nakuru Park", "lake nakuru"],
    latitude: -0.3606, longitude: 36.0847,
    shortLabel: "Lake Nakuru", fullLabel: "Lake Nakuru National Park"
  },
  "Mount Kenya National Park": {
    aliases: ["Mount Kenya", "mount kenya", "Kenya Mountain"],
    latitude: -0.1522, longitude: 37.3084,
    shortLabel: "Mount Kenya", fullLabel: "Mount Kenya National Park"
  },
  "Hell's Gate National Park": {
    aliases: ["Hell's Gate", "hells gate", "hellsgate"],
    latitude: -0.8978, longitude: 36.3317,
    shortLabel: "Hell's Gate", fullLabel: "Hell's Gate National Park"
  },
  "Lake Naivasha": {
    aliases: ["Lake Naivasha", "Naivasha", "naivasha"],
    latitude: -0.7750, longitude: 36.3564,
    shortLabel: "Lake Naivasha", fullLabel: "Lake Naivasha"
  },
  "Samburu National Reserve": {
    aliases: ["Samburu", "samburu"],
    latitude: 0.6061, longitude: 37.5333,
    shortLabel: "Samburu", fullLabel: "Samburu National Reserve"
  },
  "Aberdare National Park": {
    aliases: ["Aberdares", "aberdares", "Aberdare"],
    latitude: -0.4000, longitude: 36.7500,
    shortLabel: "Aberdares", fullLabel: "Aberdare National Park"
  },
  "Lake Turkana": {
    aliases: ["Lake Turkana", "Turkana"],
    latitude: 3.5882, longitude: 36.1167,
    shortLabel: "Lake Turkana", fullLabel: "Lake Turkana"
  },
  "Ol Pejeta Conservancy": {
    aliases: ["Ol Pejeta", "ol pejeta", "Laikipia"],
    latitude: 0.0219, longitude: 36.9478,
    shortLabel: "Ol Pejeta", fullLabel: "Ol Pejeta Conservancy, Laikipia"
  },
  "Shaba National Reserve": {
    aliases: ["Shaba", "shaba"],
    latitude: 0.6667, longitude: 38.0000,
    shortLabel: "Shaba", fullLabel: "Shaba National Reserve"
  },
  "Meru National Park": {
    aliases: ["Meru Park", "meru national park", "meru"],
    latitude: 0.1667, longitude: 38.5000,
    shortLabel: "Meru NP", fullLabel: "Meru National Park"
  },
  "Arabuko Sokoke Forest Reserve": {
    aliases: ["Arabuko", "Sokoke", "arabuko sokoke"],
    latitude: -3.3500, longitude: 39.9500,
    shortLabel: "Arabuko Sokoke", fullLabel: "Arabuko Sokoke Forest Reserve"
  }
};

// ── NAIROBI NEIGHBORHOODS ─────────────────────────────────────────────────
export const NAIROBI_NEIGHBORHOODS: Record<string, LocationData> = {
  "Nairobi CBD": {
    aliases: ["Nairobi", "nairobi", "CBD", "city center", "Nairobi CBD", "town"],
    latitude: -1.2833, longitude: 36.8172,
    shortLabel: "Nairobi CBD", fullLabel: "Nairobi City Centre",
    placeId: "ChIJd4qNkfMQLxgRDnEaWEQdNvY"
  },
  "Westlands": {
    aliases: ["Westlands", "westlands", "westy"],
    latitude: -1.2656, longitude: 36.8067,
    shortLabel: "Westlands", fullLabel: "Westlands, Nairobi",
    placeId: "ChIJHZy4GxcRLxgRdv_N7pXbQS0"
  },
  "Karen": {
    aliases: ["Karen", "karen"],
    latitude: -1.3389, longitude: 36.6928,
    shortLabel: "Karen", fullLabel: "Karen, Nairobi",
    placeId: "ChIJfyeimkIRLxgRCGLnkNXZVoE"
  },
  "Upper Hill": {
    aliases: ["Upper Hill", "upper hill", "upperhill"],
    latitude: -1.2983, longitude: 36.8156,
    shortLabel: "Upper Hill", fullLabel: "Upper Hill, Nairobi"
  },
  "Kilimani": {
    aliases: ["Kilimani", "kilimani"],
    latitude: -1.2950, longitude: 36.7939,
    shortLabel: "Kilimani", fullLabel: "Kilimani, Nairobi"
  },
  "Langata": {
    aliases: ["Langata", "langata", "Lang'ata"],
    latitude: -1.3533, longitude: 36.7317,
    shortLabel: "Langata", fullLabel: "Langata, Nairobi"
  },
  "Lavington": {
    aliases: ["Lavington", "lavington"],
    latitude: -1.2875, longitude: 36.7728,
    shortLabel: "Lavington", fullLabel: "Lavington, Nairobi"
  },
  "Kileleshwa": {
    aliases: ["Kileleshwa", "kileleshwa"],
    latitude: -1.2839, longitude: 36.7847,
    shortLabel: "Kileleshwa", fullLabel: "Kileleshwa, Nairobi"
  },
  "Parklands": {
    aliases: ["Parklands", "parklands"],
    latitude: -1.2683, longitude: 36.8219,
    shortLabel: "Parklands", fullLabel: "Parklands, Nairobi"
  },
  "Muthaiga": {
    aliases: ["Muthaiga", "muthaiga"],
    latitude: -1.2500, longitude: 36.8417,
    shortLabel: "Muthaiga", fullLabel: "Muthaiga, Nairobi"
  },
  "Runda": {
    aliases: ["Runda", "runda"],
    latitude: -1.2181, longitude: 36.8267,
    shortLabel: "Runda", fullLabel: "Runda, Nairobi"
  },
  "Gigiri": {
    aliases: ["Gigiri", "gigiri", "UN Complex"],
    latitude: -1.2328, longitude: 36.8064,
    shortLabel: "Gigiri", fullLabel: "Gigiri, Nairobi"
  },
  "Ruaka": {
    aliases: ["Ruaka", "ruaka"],
    latitude: -1.2200, longitude: 36.7811,
    shortLabel: "Ruaka", fullLabel: "Ruaka, Nairobi"
  },
  "Ngong Road": {
    aliases: ["Ngong Road", "ngong road"],
    latitude: -1.3028, longitude: 36.7750,
    shortLabel: "Ngong Road", fullLabel: "Ngong Road, Nairobi"
  },
  "Hurlingham": {
    aliases: ["Hurlingham", "hurlingham"],
    latitude: -1.2922, longitude: 36.7983,
    shortLabel: "Hurlingham", fullLabel: "Hurlingham, Nairobi"
  },
  "South B": {
    aliases: ["South B", "south b", "South B Nairobi"],
    latitude: -1.3122, longitude: 36.8383,
    shortLabel: "South B", fullLabel: "South B, Nairobi"
  },
  "South C": {
    aliases: ["South C", "south c"],
    latitude: -1.3256, longitude: 36.8300,
    shortLabel: "South C", fullLabel: "South C, Nairobi"
  },
  "Eastleigh": {
    aliases: ["Eastleigh", "eastleigh"],
    latitude: -1.2736, longitude: 36.8500,
    shortLabel: "Eastleigh", fullLabel: "Eastleigh, Nairobi"
  },
  "Buruburu": {
    aliases: ["Buruburu", "buru buru", "buru"],
    latitude: -1.2833, longitude: 36.8700,
    shortLabel: "Buruburu", fullLabel: "Buruburu, Nairobi"
  },
  "Embakasi": {
    aliases: ["Embakasi", "embakasi"],
    latitude: -1.3186, longitude: 36.8939,
    shortLabel: "Embakasi", fullLabel: "Embakasi, Nairobi"
  },
  "Kasarani": {
    aliases: ["Kasarani", "kasarani"],
    latitude: -1.2217, longitude: 36.8956,
    shortLabel: "Kasarani", fullLabel: "Kasarani, Nairobi"
  },
  "Roysambu": {
    aliases: ["Roysambu", "roysambu"],
    latitude: -1.2194, longitude: 36.8783,
    shortLabel: "Roysambu", fullLabel: "Roysambu, Nairobi"
  },
  "Githurai": {
    aliases: ["Githurai", "githurai", "Githurai 44", "Githurai 45"],
    latitude: -1.1889, longitude: 36.9014,
    shortLabel: "Githurai", fullLabel: "Githurai, Nairobi"
  },
  "Pipeline": {
    aliases: ["Pipeline", "pipeline", "Athi River Road"],
    latitude: -1.3172, longitude: 36.8817,
    shortLabel: "Pipeline", fullLabel: "Pipeline Estate, Nairobi"
  },
  "Kibera": {
    aliases: ["Kibera", "kibera"],
    latitude: -1.3122, longitude: 36.7819,
    shortLabel: "Kibera", fullLabel: "Kibera, Nairobi"
  },
  "Mathare": {
    aliases: ["Mathare", "mathare"],
    latitude: -1.2611, longitude: 36.8561,
    shortLabel: "Mathare", fullLabel: "Mathare, Nairobi"
  },
  "Komarock": {
    aliases: ["Komarock", "komarock"],
    latitude: -1.2833, longitude: 36.9100,
    shortLabel: "Komarock", fullLabel: "Komarock, Nairobi"
  },
  "Donholm": {
    aliases: ["Donholm", "donholm"],
    latitude: -1.2928, longitude: 36.8911,
    shortLabel: "Donholm", fullLabel: "Donholm, Nairobi"
  },
  "Ruaraka": {
    aliases: ["Ruaraka", "ruaraka"],
    latitude: -1.2500, longitude: 36.8769,
    shortLabel: "Ruaraka", fullLabel: "Ruaraka, Nairobi"
  },
  "Spring Valley": {
    aliases: ["Spring Valley", "spring valley"],
    latitude: -1.2600, longitude: 36.7828,
    shortLabel: "Spring Valley", fullLabel: "Spring Valley, Nairobi"
  },
  "Loresho": {
    aliases: ["Loresho", "loresho"],
    latitude: -1.2528, longitude: 36.7792,
    shortLabel: "Loresho", fullLabel: "Loresho, Nairobi"
  }
};

// ── NAIROBI SHOPPING MALLS ─────────────────────────────────────────────────
export const NAIROBI_MALLS: Record<string, LocationData> = {
  "The Junction Mall": {
    aliases: ["Junction Mall", "junction", "Junction Nairobi", "the junction"],
    latitude: -1.3003, longitude: 36.7822,
    shortLabel: "Junction Mall", fullLabel: "The Junction Mall, Ngong Road, Nairobi",
    placeId: "ChIJ78SBXfgQLxgRQVrJSVFcEQA"
  },
  "Westgate Shopping Mall": {
    aliases: ["Westgate", "west gate", "westgate nairobi"],
    latitude: -1.2636, longitude: 36.8050,
    shortLabel: "Westgate Mall", fullLabel: "Westgate Shopping Mall, Westlands, Nairobi",
    placeId: "ChIJX2UKcBgRLxgRSx2CDsQ1aBE"
  },
  "Garden City Mall": {
    aliases: ["Garden City", "garden city mall", "garden city shopping"],
    latitude: -1.2386, longitude: 36.8928,
    shortLabel: "Garden City Mall", fullLabel: "Garden City Mall, Thika Road, Nairobi",
    placeId: "ChIJUVLs-J4RLxgROHkn8oasxWc"
  },
  "Two Rivers Mall": {
    aliases: ["Two Rivers", "two rivers", "two rivers mall", "2 rivers"],
    latitude: -1.2117, longitude: 36.8067,
    shortLabel: "Two Rivers Mall", fullLabel: "Two Rivers Mall, Limuru Road, Nairobi",
    placeId: "ChIJVVVVVbMRLxgRFpAaFuH5sGo"
  },
  "Sarit Centre": {
    aliases: ["Sarit", "sarit centre", "sarit center", "sarit westlands"],
    latitude: -1.2636, longitude: 36.8097,
    shortLabel: "Sarit Centre", fullLabel: "Sarit Centre, Westlands, Nairobi",
    placeId: "ChIJExLq5xgRLxgRVqz0bRKYbJA"
  },
  "Village Market": {
    aliases: ["Village Market", "village market gigiri", "village market nairobi"],
    latitude: -1.2283, longitude: 36.8011,
    shortLabel: "Village Market", fullLabel: "Village Market, Gigiri, Nairobi",
    placeId: "ChIJSahT6VgRLxgROifvD5MYpbM"
  },
  "Yaya Centre": {
    aliases: ["Yaya", "yaya centre", "yaya center"],
    latitude: -1.2917, longitude: 36.7967,
    shortLabel: "Yaya Centre", fullLabel: "Yaya Centre, Argwings Kodhek, Nairobi",
    placeId: "ChIJ7x8JTfgQLxgRpWVvjqD2O38"
  },
  "Galleria Mall": {
    aliases: ["Galleria", "galleria mall", "galleria karen"],
    latitude: -1.3533, longitude: 36.7225,
    shortLabel: "Galleria Mall", fullLabel: "Galleria Mall, Karen, Nairobi"
  },
  "The Hub Karen": {
    aliases: ["The Hub", "hub karen", "the hub mall"],
    latitude: -1.3636, longitude: 36.6967,
    shortLabel: "The Hub Karen", fullLabel: "The Hub Karen, Nairobi",
    placeId: "ChIJJ7x4Hy4RLxgRVWj4Z3v2HMs"
  },
  "Nextgen Mall": {
    aliases: ["Nextgen", "nextgen mall", "Mombasa Road mall"],
    latitude: -1.3028, longitude: 36.8356,
    shortLabel: "Nextgen Mall", fullLabel: "Nextgen Mall, Mombasa Road, Nairobi"
  },
  "T-Mall": {
    aliases: ["T-Mall", "tmall nairobi", "t mall langata"],
    latitude: -1.3283, longitude: 36.7514,
    shortLabel: "T-Mall", fullLabel: "T-Mall, Langata Road, Nairobi"
  },
  "Prestige Plaza": {
    aliases: ["Prestige Plaza", "prestige", "prestige ngong road"],
    latitude: -1.3075, longitude: 36.7742,
    shortLabel: "Prestige Plaza", fullLabel: "Prestige Plaza, Ngong Road, Nairobi"
  },
  "Capital Centre": {
    aliases: ["Capital Centre", "capital center", "capital mall mombasa road"],
    latitude: -1.3261, longitude: 36.8361,
    shortLabel: "Capital Centre", fullLabel: "Capital Centre, Mombasa Road, Nairobi"
  },
  "Thika Road Mall": {
    aliases: ["TRM", "Thika Road Mall", "thika road mall"],
    latitude: -1.2303, longitude: 36.8875,
    shortLabel: "TRM", fullLabel: "Thika Road Mall (TRM), Nairobi",
    placeId: "ChIJj1W-0p4RLxgRxiqkH4EXNOE"
  },
  "Crossroads Mall": {
    aliases: ["Crossroads", "crossroads mall", "Crossroads Kitengela"],
    latitude: -1.4792, longitude: 36.9672,
    shortLabel: "Crossroads Mall", fullLabel: "Crossroads Mall, Kitengela"
  }
};

// ── NAIROBI HOSPITALS ──────────────────────────────────────────────────────
export const NAIROBI_HOSPITALS: Record<string, LocationData> = {
  "Kenyatta National Hospital": {
    aliases: ["KNH", "Kenyatta Hospital", "kenyatta national hospital", "knh nairobi"],
    latitude: -1.3006, longitude: 36.8069,
    shortLabel: "KNH", fullLabel: "Kenyatta National Hospital, Nairobi",
    placeId: "ChIJUSG5hPgQLxgRm8NMiNnBIVY"
  },
  "Nairobi Hospital": {
    aliases: ["Nairobi Hospital", "nairobi hospital", "NH Upperhill"],
    latitude: -1.2944, longitude: 36.8161,
    shortLabel: "Nairobi Hospital", fullLabel: "The Nairobi Hospital, Upper Hill",
    placeId: "ChIJr3tQifoQLxgRhZ5mFjCVVJg"
  },
  "Aga Khan Hospital Nairobi": {
    aliases: ["Aga Khan", "aga khan hospital", "aga khan nairobi", "AKUH"],
    latitude: -1.2667, longitude: 36.8306,
    shortLabel: "Aga Khan Hospital", fullLabel: "Aga Khan University Hospital, Parklands, Nairobi",
    placeId: "ChIJpRBR7DIRLxgRvM6jNx-EwUk"
  },
  "MP Shah Hospital": {
    aliases: ["MP Shah", "mpshah", "mp shah", "Parklands Hospital"],
    latitude: -1.2667, longitude: 36.8208,
    shortLabel: "MP Shah Hospital", fullLabel: "MP Shah Hospital, Parklands, Nairobi",
    placeId: "ChIJLXfnsjERLxgRUzqwAHVlQ5A"
  },
  "Karen Hospital": {
    aliases: ["Karen Hospital", "karen hospital nairobi"],
    latitude: -1.3439, longitude: 36.7139,
    shortLabel: "Karen Hospital", fullLabel: "Karen Hospital, Nairobi",
    placeId: "ChIJoVnIVi4RLxgRh5cwnFg4mQQ"
  },
  "Mater Hospital Nairobi": {
    aliases: ["Mater Hospital", "mater", "mater nairobi", "Mater Misericordiae"],
    latitude: -1.3069, longitude: 36.8533,
    shortLabel: "Mater Hospital", fullLabel: "Mater Misericordiae Hospital, South B, Nairobi",
    placeId: "ChIJW72xVCARLxgRwRdLkj7pvZM"
  },
  "Gertrude's Children Hospital": {
    aliases: ["Gertrude's", "Gertrudes", "gertrudes hospital", "gertrudeʼs hospital"],
    latitude: -1.2611, longitude: 36.8311,
    shortLabel: "Gertrude's", fullLabel: "Gertrude's Children's Hospital, Muthaiga, Nairobi"
  },
  "Avenue Hospital": {
    aliases: ["Avenue Hospital", "avenue nairobi", "Avenue Healthcare"],
    latitude: -1.2944, longitude: 36.8150,
    shortLabel: "Avenue Hospital", fullLabel: "Avenue Hospital, Upper Hill, Nairobi"
  },
  "Coptic Hospital": {
    aliases: ["Coptic Hospital", "coptic", "coptic nairobi"],
    latitude: -1.2858, longitude: 36.8594,
    shortLabel: "Coptic Hospital", fullLabel: "Coptic Hospital, Nairobi"
  },
  "Lancet Kenya Laboratory": {
    aliases: ["Lancet", "lancet lab", "lancet kenya"],
    latitude: -1.2917, longitude: 36.8186,
    shortLabel: "Lancet Lab", fullLabel: "Lancet Kenya Laboratories, Nairobi"
  },
  "Nairobi Women's Hospital": {
    aliases: ["Nairobi Women's", "NWH", "nairobi womens hospital"],
    latitude: -1.3058, longitude: 36.7828,
    shortLabel: "Nairobi Women's Hospital", fullLabel: "Nairobi Women's Hospital, Hurlingham"
  }
};

// ── NAIROBI UNIVERSITIES & SCHOOLS ────────────────────────────────────────
export const NAIROBI_UNIVERSITIES: Record<string, LocationData> = {
  "University of Nairobi": {
    aliases: ["UoN", "University of Nairobi", "uon nairobi", "main campus nairobi"],
    latitude: -1.2792, longitude: 36.8169,
    shortLabel: "UoN", fullLabel: "University of Nairobi, Main Campus",
    placeId: "ChIJi0Z3S-4QLxgRmXEMjRD7tV8"
  },
  "Kenyatta University": {
    aliases: ["Kenyatta University", "KU", "ku nairobi"],
    latitude: -1.1817, longitude: 36.9272,
    shortLabel: "Kenyatta University", fullLabel: "Kenyatta University, Thika Road, Nairobi",
    placeId: "ChIJp4YrYecRLxgResgqxWolOCA"
  },
  "Strathmore University": {
    aliases: ["Strathmore", "strathmore university", "strathmore nairobi"],
    latitude: -1.3097, longitude: 36.7978,
    shortLabel: "Strathmore", fullLabel: "Strathmore University, Ngong Road, Nairobi",
    placeId: "ChIJGbEonPoQLxgRfIenl9UTRP8"
  },
  "USIU Africa": {
    aliases: ["USIU", "usiu", "United States International University"],
    latitude: -1.2169, longitude: 36.8950,
    shortLabel: "USIU Africa", fullLabel: "USIU Africa, Kasarani, Nairobi",
    placeId: "ChIJSahF70YSLxgRSm0TtfJ-NXY"
  },
  "Daystar University": {
    aliases: ["Daystar", "daystar university"],
    latitude: -1.3117, longitude: 36.7786,
    shortLabel: "Daystar University", fullLabel: "Daystar University, Athi River"
  },
  "Technical University of Kenya": {
    aliases: ["TUK", "Technical University Kenya", "tuk nairobi"],
    latitude: -1.2822, longitude: 36.8236,
    shortLabel: "TUK", fullLabel: "Technical University of Kenya, Nairobi"
  },
  "Kenya Institute of Management": {
    aliases: ["KIM", "kenya institute management"],
    latitude: -1.2806, longitude: 36.8264,
    shortLabel: "KIM", fullLabel: "Kenya Institute of Management, Nairobi"
  },
  "Multimedia University": {
    aliases: ["Multimedia University", "MMU", "mmu kenya"],
    latitude: -1.0694, longitude: 37.0731,
    shortLabel: "Multimedia University", fullLabel: "Multimedia University of Kenya, Thika Road"
  },
  "Mount Kenya University Nairobi": {
    aliases: ["MKU Nairobi", "Mount Kenya University Nairobi"],
    latitude: -1.2839, longitude: 36.8364,
    shortLabel: "MKU Nairobi", fullLabel: "Mount Kenya University, Nairobi Campus"
  },
  "Kenya Methodist University": {
    aliases: ["KEMU", "Kenya Methodist University", "kemu nairobi"],
    latitude: -1.2836, longitude: 36.8136,
    shortLabel: "KEMU", fullLabel: "Kenya Methodist University, Nairobi"
  }
};

// ── NAIROBI BUS STATIONS & MATATU TERMINII ────────────────────────────────
export const NAIROBI_BUS_STATIONS: Record<string, LocationData> = {
  "Nairobi Bus Station": {
    aliases: ["Bus Station Nairobi", "nairobi bus station", "country bus station", "cross roads bus"],
    latitude: -1.2858, longitude: 36.8322,
    shortLabel: "Nairobi Bus Station", fullLabel: "Nairobi Country Bus Station, River Road",
    placeId: "ChIJuT9t5kQRLxgRcGGGiRr_DLA"
  },
  "Machakos Country Bus Station": {
    aliases: ["Machakos Bus", "machakos country bus", "machakos terminus"],
    latitude: -1.2892, longitude: 36.8317,
    shortLabel: "Machakos Bus", fullLabel: "Machakos Country Bus Station, Nairobi"
  },
  "OTC Bus Station": {
    aliases: ["OTC", "OTC bus", "OTC terminus"],
    latitude: -1.2847, longitude: 36.8353,
    shortLabel: "OTC Station", fullLabel: "OTC Bus Station, Nairobi"
  },
  "Kencom Bus Stop": {
    aliases: ["Kencom", "kencom", "kencom bus stop", "kencom stage"],
    latitude: -1.2864, longitude: 36.8208,
    shortLabel: "Kencom", fullLabel: "Kencom House Bus Stop, Nairobi CBD"
  },
  "Westlands Bus Stop": {
    aliases: ["Westlands Stage", "westlands bus", "westlands terminus"],
    latitude: -1.2656, longitude: 36.8083,
    shortLabel: "Westlands Stage", fullLabel: "Westlands Matatu Stage, Nairobi"
  },
  "Railways Bus Terminus": {
    aliases: ["Railways", "railways stage", "railways terminus", "nairobil railways"],
    latitude: -1.2922, longitude: 36.8253,
    shortLabel: "Railways Stage", fullLabel: "Railways Bus Terminus, Nairobi"
  },
  "Nyamakima Stage": {
    aliases: ["Nyamakima", "nyamakima", "River Road Stage"],
    latitude: -1.2869, longitude: 36.8319,
    shortLabel: "Nyamakima", fullLabel: "Nyamakima Matatu Stage, Nairobi"
  },
  "SGR Nairobi Terminus": {
    aliases: ["Nairobi SGR", "Syokimau SGR", "SGR", "SGR terminus nairobi"],
    latitude: -1.3736, longitude: 36.9100,
    shortLabel: "SGR Nairobi", fullLabel: "SGR Nairobi Terminus, Syokimau"
  },
  "Nairobi Central Station": {
    aliases: ["Nairobi Station", "central station", "nairobi railway station"],
    latitude: -1.2917, longitude: 36.8239,
    shortLabel: "Nairobi Central Station", fullLabel: "Nairobi Central Railway Station"
  },
  "4Nk Kasarani Stage": {
    aliases: ["4NK", "kasarani stage", "4nk stage"],
    latitude: -1.2211, longitude: 36.8942,
    shortLabel: "4NK Stage", fullLabel: "4NK / Kasarani Matatu Stage, Nairobi"
  }
};

// ── NAIROBI GOVERNMENT & OFFICES ──────────────────────────────────────────
export const NAIROBI_GOVERNMENT: Record<string, LocationData> = {
  "Parliament Buildings": {
    aliases: ["Parliament", "parliament nairobi", "parliament buildings kenya"],
    latitude: -1.2922, longitude: 36.8183,
    shortLabel: "Parliament", fullLabel: "Parliament Buildings, Nairobi",
    placeId: "ChIJF9j2MvoQLxgRXv-YCi6UX1s"
  },
  "Supreme Court of Kenya": {
    aliases: ["Supreme Court", "supreme court kenya"],
    latitude: -1.2872, longitude: 36.8178,
    shortLabel: "Supreme Court", fullLabel: "Supreme Court of Kenya, Nairobi"
  },
  "City Hall Nairobi": {
    aliases: ["City Hall", "nairobi city hall"],
    latitude: -1.2869, longitude: 36.8200,
    shortLabel: "City Hall", fullLabel: "Nairobi City Hall"
  },
  "Harambee House": {
    aliases: ["Harambee House", "harambee house nairobi", "State House offices"],
    latitude: -1.2889, longitude: 36.8139,
    shortLabel: "Harambee House", fullLabel: "Harambee House (Treasury Building), Nairobi"
  },
  "State House Nairobi": {
    aliases: ["State House", "state house nairobi"],
    latitude: -1.2733, longitude: 36.8094,
    shortLabel: "State House", fullLabel: "State House, Nairobi"
  },
  "UN Gigiri Complex": {
    aliases: ["UN Nairobi", "UNEP", "UN Gigiri", "United Nations Nairobi", "UNON"],
    latitude: -1.2319, longitude: 36.8058,
    shortLabel: "UN Gigiri", fullLabel: "UN Complex, Gigiri, Nairobi",
    placeId: "ChIJO_7cX1kRLxgRCVJoqp0kq-Y"
  },
  "Huduma Centre Nairobi": {
    aliases: ["Huduma Centre", "huduma center nairobi", "huduma"],
    latitude: -1.2864, longitude: 36.8228,
    shortLabel: "Huduma Centre", fullLabel: "Huduma Centre, Nairobi CBD"
  },
  "Immigration Department Nairobi": {
    aliases: ["Immigration Nairobi", "immigration department", "nyayo house immigration"],
    latitude: -1.2997, longitude: 36.8217,
    shortLabel: "Immigration Dept", fullLabel: "Department of Immigration Services, Nyayo House, Nairobi"
  },
  "Kenya Revenue Authority": {
    aliases: ["KRA", "kenya revenue authority", "KRA headquarters", "Times Tower"],
    latitude: -1.2958, longitude: 36.8208,
    shortLabel: "KRA / Times Tower", fullLabel: "Kenya Revenue Authority (Times Tower), Upper Hill, Nairobi"
  },
  "KICC": {
    aliases: ["KICC", "Kenyatta International Convention Centre", "kicc nairobi"],
    latitude: -1.2858, longitude: 36.8236,
    shortLabel: "KICC", fullLabel: "Kenyatta International Convention Centre, Nairobi"
  },
  "Nairobi County Headquarters": {
    aliases: ["Nairobi County", "county hall nairobi"],
    latitude: -1.2853, longitude: 36.8206,
    shortLabel: "Nairobi County HQ", fullLabel: "Nairobi County Headquarters"
  }
};

// ── NAIROBI MARKETS ────────────────────────────────────────────────────────
export const NAIROBI_MARKETS: Record<string, LocationData> = {
  "Maasai Market": {
    aliases: ["Maasai Market", "masai market", "maasai market nairobi"],
    latitude: -1.2631, longitude: 36.8072,
    shortLabel: "Maasai Market", fullLabel: "Maasai Market, Village Market / Westlands"
  },
  "City Market Nairobi": {
    aliases: ["City Market", "nairobi city market", "muindi mbingu market"],
    latitude: -1.2836, longitude: 36.8172,
    shortLabel: "City Market", fullLabel: "City Market, Muindi Mbingu Street, Nairobi"
  },
  "Toi Market": {
    aliases: ["Toi Market", "toi market kibera"],
    latitude: -1.3103, longitude: 36.7728,
    shortLabel: "Toi Market", fullLabel: "Toi Market, Kibera, Nairobi"
  },
  "Gikomba Market": {
    aliases: ["Gikomba", "gikomba market", "gikomba second hand"],
    latitude: -1.2819, longitude: 36.8464,
    shortLabel: "Gikomba", fullLabel: "Gikomba Market, Nairobi"
  },
  "Wakulima Market": {
    aliases: ["Wakulima", "wakulima market", "City Park Market"],
    latitude: -1.2758, longitude: 36.8319,
    shortLabel: "Wakulima Market", fullLabel: "Wakulima Market, Nairobi"
  },
  "Ngara Market": {
    aliases: ["Ngara", "ngara market"],
    latitude: -1.2744, longitude: 36.8342,
    shortLabel: "Ngara Market", fullLabel: "Ngara Market, Nairobi"
  },
  "Tuskys Nextgen Market": {
    aliases: ["nextgen market", "nextgen supermarket"],
    latitude: -1.3028, longitude: 36.8356,
    shortLabel: "Nextgen Market", fullLabel: "Market at Nextgen Mall, Mombasa Road"
  },
  "Kongowea Market Mombasa": {
    aliases: ["Kongowea", "kongowea market"],
    latitude: -3.9978, longitude: 39.7250,
    shortLabel: "Kongowea Market", fullLabel: "Kongowea Market, Mombasa"
  }
};

// ── MOMBASA NEIGHBORHOODS & AREAS ─────────────────────────────────────────
export const MOMBASA_AREAS: Record<string, LocationData> = {
  "Mombasa CBD": {
    aliases: ["Mombasa", "mombasa cbd", "mombasa city center", "mombasa town"],
    latitude: -4.0435, longitude: 39.6682,
    shortLabel: "Mombasa CBD", fullLabel: "Mombasa City Centre",
    placeId: "ChIJN2fR2fvAGBgRRH3i5a-WPXY"
  },
  "Nyali": {
    aliases: ["Nyali", "nyali mombasa"],
    latitude: -4.0197, longitude: 39.7167,
    shortLabel: "Nyali", fullLabel: "Nyali, Mombasa"
  },
  "Bamburi": {
    aliases: ["Bamburi", "bamburi mombasa"],
    latitude: -3.9797, longitude: 39.7244,
    shortLabel: "Bamburi", fullLabel: "Bamburi, Mombasa"
  },
  "Shanzu": {
    aliases: ["Shanzu", "shanzu mombasa"],
    latitude: -3.9481, longitude: 39.7322,
    shortLabel: "Shanzu", fullLabel: "Shanzu, Mombasa"
  },
  "Kisauni": {
    aliases: ["Kisauni", "kisauni mombasa"],
    latitude: -3.9978, longitude: 39.6761,
    shortLabel: "Kisauni", fullLabel: "Kisauni, Mombasa"
  },
  "Tudor": {
    aliases: ["Tudor", "tudor mombasa"],
    latitude: -4.0417, longitude: 39.6597,
    shortLabel: "Tudor", fullLabel: "Tudor, Mombasa"
  },
  "Likoni": {
    aliases: ["Likoni", "likoni mombasa", "likoni ferry"],
    latitude: -4.0822, longitude: 39.6678,
    shortLabel: "Likoni", fullLabel: "Likoni, Mombasa"
  },
  "Changamwe": {
    aliases: ["Changamwe", "changamwe mombasa"],
    latitude: -4.0150, longitude: 39.6181,
    shortLabel: "Changamwe", fullLabel: "Changamwe, Mombasa"
  },
  "Mombasa Old Town": {
    aliases: ["Mombasa Old Town", "old town mombasa", "mombasa historic"],
    latitude: -4.0617, longitude: 39.6678,
    shortLabel: "Mombasa Old Town", fullLabel: "Mombasa Old Town"
  }
};

// ── MOMBASA HOSPITALS ──────────────────────────────────────────────────────
export const MOMBASA_HOSPITALS: Record<string, LocationData> = {
  "Coast General Hospital": {
    aliases: ["Coast General", "coast general hospital", "CGH mombasa"],
    latitude: -4.0608, longitude: 39.6636,
    shortLabel: "Coast General", fullLabel: "Coast General Hospital, Mombasa"
  },
  "Aga Khan Hospital Mombasa": {
    aliases: ["Aga Khan Mombasa", "aga khan hospital mombasa"],
    latitude: -4.0542, longitude: 39.6656,
    shortLabel: "Aga Khan Mombasa", fullLabel: "Aga Khan Hospital, Mombasa"
  },
  "Pandya Memorial Hospital": {
    aliases: ["Pandya", "pandya memorial", "pandya hospital mombasa"],
    latitude: -4.0553, longitude: 39.6636,
    shortLabel: "Pandya Hospital", fullLabel: "Pandya Memorial Hospital, Mombasa"
  }
};

// ── KISUMU AREAS ────────────────────────────────────────────────────────────
export const KISUMU_AREAS: Record<string, LocationData> = {
  "Kisumu CBD": {
    aliases: ["Kisumu", "kisumu cbd", "kisumu town", "kisumu city"],
    latitude: -0.1022, longitude: 34.7617,
    shortLabel: "Kisumu CBD", fullLabel: "Kisumu City Centre"
  },
  "Milimani Kisumu": {
    aliases: ["Milimani", "milimani kisumu"],
    latitude: -0.1119, longitude: 34.7539,
    shortLabel: "Milimani", fullLabel: "Milimani Estate, Kisumu"
  },
  "Nyamasaria": {
    aliases: ["Nyamasaria", "nyamasaria kisumu"],
    latitude: -0.0997, longitude: 34.7917,
    shortLabel: "Nyamasaria", fullLabel: "Nyamasaria, Kisumu"
  },
  "Kondele": {
    aliases: ["Kondele", "kondele kisumu"],
    latitude: -0.0794, longitude: 34.7875,
    shortLabel: "Kondele", fullLabel: "Kondele, Kisumu"
  },
  "Migosi": {
    aliases: ["Migosi", "migosi kisumu"],
    latitude: -0.0978, longitude: 34.7611,
    shortLabel: "Migosi", fullLabel: "Migosi Estate, Kisumu"
  },
  "Mamboleo": {
    aliases: ["Mamboleo", "mamboleo kisumu"],
    latitude: -0.0667, longitude: 34.8150,
    shortLabel: "Mamboleo", fullLabel: "Mamboleo, Kisumu"
  },
  "Kisumu Victoria Bay": {
    aliases: ["Victoria Bay", "lake victoria kisumu", "victoria kisumu"],
    latitude: -0.1050, longitude: 34.7422,
    shortLabel: "Victoria Bay", fullLabel: "Lake Victoria Bay, Kisumu"
  }
};

// ── NAKURU AREAS ────────────────────────────────────────────────────────────
export const NAKURU_AREAS: Record<string, LocationData> = {
  "Nakuru CBD": {
    aliases: ["Nakuru", "nakuru cbd", "nakuru town"],
    latitude: -0.3031, longitude: 36.0800,
    shortLabel: "Nakuru CBD", fullLabel: "Nakuru City Centre"
  },
  "Milimani Nakuru": {
    aliases: ["Milimani Nakuru", "milimani nakuru"],
    latitude: -0.2900, longitude: 36.0733,
    shortLabel: "Milimani Nakuru", fullLabel: "Milimani Estate, Nakuru"
  },
  "Nakuru Stadium": {
    aliases: ["Afraha Stadium", "nakuru stadium"],
    latitude: -0.2972, longitude: 36.0678,
    shortLabel: "Afraha Stadium", fullLabel: "Afraha Stadium, Nakuru"
  }
};

// ── ELDORET AREAS ───────────────────────────────────────────────────────────
export const ELDORET_AREAS: Record<string, LocationData> = {
  "Eldoret CBD": {
    aliases: ["Eldoret", "eldoret cbd", "eldoret town"],
    latitude: 0.5143, longitude: 35.2699,
    shortLabel: "Eldoret CBD", fullLabel: "Eldoret Town Centre"
  },
  "Moi University Eldoret": {
    aliases: ["Moi University", "moi university eldoret", "MU Eldoret"],
    latitude: 0.5167, longitude: 35.1983,
    shortLabel: "Moi University", fullLabel: "Moi University, Eldoret"
  },
  "Zion Mall Eldoret": {
    aliases: ["Zion Mall", "zion mall eldoret"],
    latitude: 0.5217, longitude: 35.2736,
    shortLabel: "Zion Mall", fullLabel: "Zion Mall, Eldoret"
  },
  "Plateau Eldoret": {
    aliases: ["Plateau", "plateau eldoret"],
    latitude: 0.5189, longitude: 35.2889,
    shortLabel: "Plateau", fullLabel: "Plateau Estate, Eldoret"
  }
};

// ── CITIES & TOWNS ─────────────────────────────────────────────────────────
export const KENYA_CITIES_TOWNS: Record<string, LocationData> = {
  "Nairobi": {
    aliases: ["Nairobi", "nairobi city"],
    latitude: -1.2833, longitude: 36.8172,
    shortLabel: "Nairobi", fullLabel: "Nairobi City"
  },
  "Mombasa": {
    aliases: ["Mombasa", "mombasa city"],
    latitude: -4.0435, longitude: 39.6682,
    shortLabel: "Mombasa", fullLabel: "Mombasa City"
  },
  "Kisumu": {
    aliases: ["Kisumu", "kisumu city"],
    latitude: -0.1022, longitude: 34.7617,
    shortLabel: "Kisumu", fullLabel: "Kisumu City"
  },
  "Nakuru": {
    aliases: ["Nakuru", "nakuru city"],
    latitude: -0.3031, longitude: 36.0800,
    shortLabel: "Nakuru", fullLabel: "Nakuru City"
  },
  "Eldoret": {
    aliases: ["Eldoret", "eldoret town"],
    latitude: 0.5143, longitude: 35.2699,
    shortLabel: "Eldoret", fullLabel: "Eldoret"
  },
  "Thika": {
    aliases: ["Thika", "thika town"],
    latitude: -1.0333, longitude: 37.0667,
    shortLabel: "Thika", fullLabel: "Thika Town"
  },
  "Naivasha": {
    aliases: ["Naivasha", "naivasha town"],
    latitude: -0.7167, longitude: 36.4314,
    shortLabel: "Naivasha", fullLabel: "Naivasha Town"
  },
  "Nanyuki": {
    aliases: ["Nanyuki", "nanyuki town"],
    latitude: -0.0028, longitude: 37.0700,
    shortLabel: "Nanyuki", fullLabel: "Nanyuki Town"
  },
  "Nyeri": {
    aliases: ["Nyeri", "nyeri town"],
    latitude: -0.4167, longitude: 36.9500,
    shortLabel: "Nyeri", fullLabel: "Nyeri Town"
  },
  "Kericho": {
    aliases: ["Kericho", "kericho town"],
    latitude: -0.3686, longitude: 35.2863,
    shortLabel: "Kericho", fullLabel: "Kericho Town"
  },
  "Kitale": {
    aliases: ["Kitale", "kitale town"],
    latitude: 1.0167, longitude: 35.0000,
    shortLabel: "Kitale", fullLabel: "Kitale Town"
  },
  "Malindi": {
    aliases: ["Malindi", "malindi town"],
    latitude: -3.2175, longitude: 40.1169,
    shortLabel: "Malindi", fullLabel: "Malindi Town"
  },
  "Diani": {
    aliases: ["Diani", "diani beach area"],
    latitude: -4.2936, longitude: 39.5872,
    shortLabel: "Diani", fullLabel: "Diani Beach Area"
  },
  "Iten": {
    aliases: ["Iten", "iten town"],
    latitude: 0.6717, longitude: 35.5086,
    shortLabel: "Iten", fullLabel: "Iten Town"
  },
  "Kisii": {
    aliases: ["Kisii", "kisii town"],
    latitude: -0.6817, longitude: 34.7664,
    shortLabel: "Kisii", fullLabel: "Kisii Town"
  },
  "Garissa": {
    aliases: ["Garissa", "garissa town"],
    latitude: -0.4536, longitude: 39.6461,
    shortLabel: "Garissa", fullLabel: "Garissa Town"
  },
  "Meru": {
    aliases: ["Meru", "meru town"],
    latitude: 0.0475, longitude: 37.6497,
    shortLabel: "Meru", fullLabel: "Meru Town"
  },
  "Embu": {
    aliases: ["Embu", "embu town"],
    latitude: -0.5303, longitude: 37.4500,
    shortLabel: "Embu", fullLabel: "Embu Town"
  },
  "Kakamega": {
    aliases: ["Kakamega", "kakamega town"],
    latitude: 0.2827, longitude: 34.7519,
    shortLabel: "Kakamega", fullLabel: "Kakamega Town"
  },
  "Bungoma": {
    aliases: ["Bungoma", "bungoma town"],
    latitude: 0.5639, longitude: 34.5606,
    shortLabel: "Bungoma", fullLabel: "Bungoma Town"
  },
  "Migori": {
    aliases: ["Migori", "migori town"],
    latitude: -1.0634, longitude: 34.4731,
    shortLabel: "Migori", fullLabel: "Migori Town"
  },
  "Homa Bay": {
    aliases: ["Homa Bay", "homa bay town"],
    latitude: -0.5267, longitude: 34.4567,
    shortLabel: "Homa Bay", fullLabel: "Homa Bay Town"
  },
  "Voi": {
    aliases: ["Voi", "voi town"],
    latitude: -3.3961, longitude: 38.5561,
    shortLabel: "Voi", fullLabel: "Voi Town"
  },
  "Kitengela": {
    aliases: ["Kitengela", "kitengela town"],
    latitude: -1.4769, longitude: 36.9611,
    shortLabel: "Kitengela", fullLabel: "Kitengela Town"
  },
  "Ongata Rongai": {
    aliases: ["Rongai", "ongata rongai", "rongai nairobi"],
    latitude: -1.3964, longitude: 36.7517,
    shortLabel: "Ongata Rongai", fullLabel: "Ongata Rongai"
  },
  "Kiambu": {
    aliases: ["Kiambu", "kiambu town"],
    latitude: -1.1714, longitude: 36.8350,
    shortLabel: "Kiambu", fullLabel: "Kiambu Town"
  },
  "Ruiru": {
    aliases: ["Ruiru", "ruiru town"],
    latitude: -1.1497, longitude: 36.9619,
    shortLabel: "Ruiru", fullLabel: "Ruiru Town"
  },
  "Limuru": {
    aliases: ["Limuru", "limuru town"],
    latitude: -1.1083, longitude: 36.6400,
    shortLabel: "Limuru", fullLabel: "Limuru Town"
  },
  "Machakos": {
    aliases: ["Machakos", "machakos town"],
    latitude: -1.5211, longitude: 37.2636,
    shortLabel: "Machakos", fullLabel: "Machakos Town"
  },
  "Kajiado": {
    aliases: ["Kajiado", "kajiado town"],
    latitude: -1.8522, longitude: 36.7758,
    shortLabel: "Kajiado", fullLabel: "Kajiado Town"
  },
  "Ngong": {
    aliases: ["Ngong", "ngong town"],
    latitude: -1.3714, longitude: 36.6572,
    shortLabel: "Ngong", fullLabel: "Ngong Town"
  }
};

// ── BEACHES & COASTAL ──────────────────────────────────────────────────────
export const KENYA_BEACHES_COASTAL: Record<string, LocationData> = {
  "Diani Beach": {
    aliases: ["Diani Beach", "diani beach", "diani"],
    latitude: -4.2781, longitude: 39.5889,
    shortLabel: "Diani Beach", fullLabel: "Diani Beach"
  },
  "Watamu Beach": {
    aliases: ["Watamu", "watamu beach"],
    latitude: -3.3550, longitude: 40.0172,
    shortLabel: "Watamu", fullLabel: "Watamu Beach"
  },
  "Lamu Island": {
    aliases: ["Lamu", "lamu island"],
    latitude: -2.2694, longitude: 40.9028,
    shortLabel: "Lamu", fullLabel: "Lamu Island"
  },
  "Bamburi Beach": {
    aliases: ["Bamburi Beach", "bamburi beach"],
    latitude: -3.9797, longitude: 39.7244,
    shortLabel: "Bamburi Beach", fullLabel: "Bamburi Beach, Mombasa"
  },
  "Nyali Beach": {
    aliases: ["Nyali Beach", "nyali beach"],
    latitude: -4.0197, longitude: 39.7167,
    shortLabel: "Nyali Beach", fullLabel: "Nyali Beach, Mombasa"
  },
  "Kilifi Creek": {
    aliases: ["Kilifi", "kilifi creek"],
    latitude: -3.6306, longitude: 39.8497,
    shortLabel: "Kilifi", fullLabel: "Kilifi Creek"
  },
  "Shelly Beach": {
    aliases: ["Shelly Beach", "shelly beach mombasa"],
    latitude: -4.0833, longitude: 39.6750,
    shortLabel: "Shelly Beach", fullLabel: "Shelly Beach, Mombasa"
  },
  "Tiwi Beach": {
    aliases: ["Tiwi", "tiwi beach"],
    latitude: -4.2000, longitude: 39.5833,
    shortLabel: "Tiwi Beach", fullLabel: "Tiwi Beach, South Coast"
  },
  "Galu Beach": {
    aliases: ["Galu", "galu beach"],
    latitude: -4.3100, longitude: 39.5700,
    shortLabel: "Galu Beach", fullLabel: "Galu Beach, South Coast"
  },
  "Vipingo Beach": {
    aliases: ["Vipingo", "vipingo beach"],
    latitude: -3.7161, longitude: 39.8000,
    shortLabel: "Vipingo", fullLabel: "Vipingo Beach"
  },
  "Mombasa Marine Park": {
    aliases: ["Marine Park", "mombasa marine", "mombasa marine park"],
    latitude: -3.9700, longitude: 39.7200,
    shortLabel: "Mombasa Marine Park", fullLabel: "Mombasa Marine National Park"
  }
};

// ── LANDMARKS & ATTRACTIONS ────────────────────────────────────────────────
export const KENYA_LANDMARKS: Record<string, LocationData> = {
  "Giraffe Centre": {
    aliases: ["Giraffe Centre", "giraffe", "giraffe center"],
    latitude: -1.3761, longitude: 36.7461,
    shortLabel: "Giraffe Centre", fullLabel: "Giraffe Centre, Nairobi",
    placeId: "ChIJkReRmSsRLxgRjf8G0A2-u7g"
  },
  "David Sheldrick Wildlife Trust": {
    aliases: ["Sheldrick", "elephant orphanage", "DSWT"],
    latitude: -1.3717, longitude: 36.7550,
    shortLabel: "Sheldrick Trust", fullLabel: "David Sheldrick Wildlife Trust, Nairobi"
  },
  "Karen Blixen Museum": {
    aliases: ["Karen Blixen", "karen blixen museum"],
    latitude: -1.3603, longitude: 36.7103,
    shortLabel: "Karen Blixen Museum", fullLabel: "Karen Blixen Museum, Nairobi"
  },
  "Bomas of Kenya": {
    aliases: ["Bomas", "bomas", "Bomas of Kenya"],
    latitude: -1.3369, longitude: 36.7819,
    shortLabel: "Bomas", fullLabel: "The Bomas of Kenya, Nairobi"
  },
  "Nairobi National Museum": {
    aliases: ["National Museum", "Kenya Museum", "nairobi museum", "national museum kenya"],
    latitude: -1.2728, longitude: 36.8161,
    shortLabel: "National Museum", fullLabel: "Nairobi National Museum"
  },
  "Nairobi Railway Museum": {
    aliases: ["Railway Museum", "railway museum nairobi"],
    latitude: -1.2939, longitude: 36.8264,
    shortLabel: "Railway Museum", fullLabel: "Nairobi Railway Museum"
  },
  "Fort Jesus": {
    aliases: ["Fort Jesus", "fort jesus mombasa"],
    latitude: -4.0619, longitude: 39.6792,
    shortLabel: "Fort Jesus", fullLabel: "Fort Jesus, Mombasa"
  },
  "Gedi Ruins": {
    aliases: ["Gedi", "gedi ruins"],
    latitude: -3.3119, longitude: 40.0242,
    shortLabel: "Gedi Ruins", fullLabel: "Gedi Ruins, Malindi"
  },
  "Freedom Corner Nairobi": {
    aliases: ["Freedom Corner", "uhuru park nairobi", "uhuru park"],
    latitude: -1.2875, longitude: 36.8161,
    shortLabel: "Uhuru Park", fullLabel: "Uhuru Park / Freedom Corner, Nairobi"
  },
  "Nairobi Arboretum": {
    aliases: ["Arboretum", "nairobi arboretum"],
    latitude: -1.2742, longitude: 36.8017,
    shortLabel: "Arboretum", fullLabel: "Nairobi Arboretum"
  },
  "Ngong Hills": {
    aliases: ["Ngong Hills", "ngong hills nairobi"],
    latitude: -1.3500, longitude: 36.6267,
    shortLabel: "Ngong Hills", fullLabel: "Ngong Hills, Kajiado"
  },
  "Suswa Volcano": {
    aliases: ["Suswa", "mount suswa", "suswa volcano"],
    latitude: -1.1706, longitude: 36.3514,
    shortLabel: "Mt Suswa", fullLabel: "Mt Suswa Volcano, Narok"
  },
  "Longonot National Park": {
    aliases: ["Longonot", "mount longonot", "longonot park"],
    latitude: -0.9178, longitude: 36.4561,
    shortLabel: "Mt Longonot", fullLabel: "Mt Longonot National Park"
  },
  "Menengai Crater": {
    aliases: ["Menengai", "menengai crater"],
    latitude: -0.2167, longitude: 36.0833,
    shortLabel: "Menengai Crater", fullLabel: "Menengai Crater, Nakuru"
  },
  "Thimlich Ohinga": {
    aliases: ["Thimlich Ohinga", "thimlich", "Thimlich"],
    latitude: -0.9917, longitude: 34.1958,
    shortLabel: "Thimlich Ohinga", fullLabel: "Thimlich Ohinga, Migori"
  }
};

// ── HOTELS & RESORTS ────────────────────────────────────────────────────────
export const KENYA_HOTELS_RESORTS: Record<string, LocationData> = {
  "Villa Rosa Kempinski Nairobi": {
    aliases: ["Villa Rosa", "Kempinski", "kempinski nairobi"],
    latitude: -1.2715, longitude: 36.8089,
    shortLabel: "Villa Rosa Kempinski", fullLabel: "Villa Rosa Kempinski, Nairobi"
  },
  "Radisson Blu Hotel Nairobi": {
    aliases: ["Radisson Nairobi", "Radisson", "radisson blu nairobi"],
    latitude: -1.2675, longitude: 36.8019,
    shortLabel: "Radisson Blu", fullLabel: "Radisson Blu Hotel, Upper Hill, Nairobi"
  },
  "Crowne Plaza Nairobi": {
    aliases: ["Crowne Plaza", "Crown Plaza", "crowne plaza nairobi"],
    latitude: -1.2825, longitude: 36.8200,
    shortLabel: "Crowne Plaza", fullLabel: "Crowne Plaza Hotel, Nairobi"
  },
  "Hilton Nairobi": {
    aliases: ["Hilton", "hilton nairobi"],
    latitude: -1.2867, longitude: 36.8219,
    shortLabel: "Hilton Nairobi", fullLabel: "Hilton Nairobi"
  },
  "Sarova Stanley Hotel": {
    aliases: ["Stanley", "Sarova Stanley", "sarova stanley"],
    latitude: -1.2856, longitude: 36.8208,
    shortLabel: "Sarova Stanley", fullLabel: "Sarova Stanley Hotel, Nairobi"
  },
  "Eka Hotel Nairobi": {
    aliases: ["Eka Hotel", "eka hotel nairobi"],
    latitude: -1.3243, longitude: 36.8447,
    shortLabel: "Eka Hotel", fullLabel: "Eka Hotel, Nairobi"
  },
  "Eka Hotel Eldoret": {
    aliases: ["Eka Hotel Eldoret", "Eka Eldoret", "eka hotel eldoret", "Eka Hotel Rupa", "Eka Hotel in Rupa", "Eka Rupa", "Eka Hotel, Rupa Mall"],
    latitude: 0.5204, longitude: 35.2903,
    shortLabel: "Eka Hotel Eldoret", fullLabel: "Eka Hotel, Rupa Mall, Eldoret",
    placeId: "ChIJRz_XmFuLIRgR_Tj9S4pUq2I"
  },
  "Rupa Mall Eldoret": {
    aliases: ["Rupa Mall", "rupa mall eldoret", "Rupa's Mall", "Rupa Mall Eldoret", "Rupa", "rupa"],
    latitude: 0.5206, longitude: 35.2905,
    shortLabel: "Rupa Mall", fullLabel: "Rupa Mall, Eldoret",
    placeId: "ChIJ_z_XmFuLIRgR5x24QzFjKPE"
  },
  "Safari Park Hotel Nairobi": {
    aliases: ["Safari Park", "Safari Hotel", "safari park hotel"],
    latitude: -1.2167, longitude: 36.8889,
    shortLabel: "Safari Park Hotel", fullLabel: "Safari Park Hotel, Nairobi"
  },
  "InterContinental Nairobi": {
    aliases: ["InterContinental", "intercontinental nairobi"],
    latitude: -1.2856, longitude: 36.8194,
    shortLabel: "InterContinental", fullLabel: "InterContinental Hotel, Nairobi"
  },
  "Fairmont The Norfolk": {
    aliases: ["Norfolk Hotel", "norfolk nairobi", "fairmont norfolk"],
    latitude: -1.2736, longitude: 36.8181,
    shortLabel: "The Norfolk", fullLabel: "Fairmont The Norfolk, Nairobi"
  },
  "Tribe Hotel Nairobi": {
    aliases: ["Tribe Hotel", "tribe nairobi", "tribe village market"],
    latitude: -1.2292, longitude: 36.8036,
    shortLabel: "Tribe Hotel", fullLabel: "Tribe Hotel, Village Market, Nairobi"
  },
  "Serena Hotel Nairobi": {
    aliases: ["Serena Nairobi", "serena nairobi", "Nairobi Serena"],
    latitude: -1.2878, longitude: 36.8131,
    shortLabel: "Serena Nairobi", fullLabel: "Nairobi Serena Hotel"
  },
  "Hemingways Nairobi": {
    aliases: ["Hemingways", "hemingways nairobi", "hemingways karen"],
    latitude: -1.3594, longitude: 36.7083,
    shortLabel: "Hemingways Nairobi", fullLabel: "Hemingways Nairobi, Karen"
  },
  "Ole Sereni Hotel": {
    aliases: ["Ole Sereni", "ole sereni nairobi"],
    latitude: -1.3303, longitude: 36.8483,
    shortLabel: "Ole Sereni", fullLabel: "Ole Sereni Hotel, Mombasa Road, Nairobi"
  },
  "Serena Beach Hotel Mombasa": {
    aliases: ["Serena Beach", "serena mombasa"],
    latitude: -3.9744, longitude: 39.7233,
    shortLabel: "Serena Beach Hotel", fullLabel: "Serena Beach Hotel, Mombasa"
  },
  "Diani Sea Resort": {
    aliases: ["Diani Sea Resort", "diani sea resort"],
    latitude: -4.2781, longitude: 39.5889,
    shortLabel: "Diani Sea Resort", fullLabel: "Diani Sea Resort"
  },
  "Watamu Turtle Bay Beach Resort": {
    aliases: ["Turtle Bay", "watamu turtle bay"],
    latitude: -3.3647, longitude: 40.0119,
    shortLabel: "Turtle Bay", fullLabel: "Watamu Turtle Bay Beach Resort"
  },
  "Fairmont Mount Kenya Safari Club": {
    aliases: ["Fairmont Mount Kenya", "Mount Kenya Club", "fairmont nanyuki"],
    latitude: -0.0172, longitude: 37.0706,
    shortLabel: "Fairmont Mount Kenya", fullLabel: "Fairmont Mount Kenya Safari Club, Nanyuki"
  },
  "Amboseli Serena Safari Lodge": {
    aliases: ["Serena Amboseli", "amboseli serena"],
    latitude: -2.6636, longitude: 37.2556,
    shortLabel: "Serena Amboseli", fullLabel: "Amboseli Serena Safari Lodge"
  },
  "Sarova Mara Game Camp": {
    aliases: ["Sarova Mara", "mara sarova", "sarova masai mara"],
    latitude: -1.5050, longitude: 35.0800,
    shortLabel: "Sarova Mara", fullLabel: "Sarova Mara Game Camp, Masai Mara"
  }
};

// ── RESTAURANTS & DINING ────────────────────────────────────────────────────
export const KENYA_RESTAURANTS_DINING: Record<string, LocationData> = {
  "Carnivore Restaurant": {
    aliases: ["Carnivore", "carnivore nairobi"],
    latitude: -1.3290, longitude: 36.8005,
    shortLabel: "Carnivore", fullLabel: "Carnivore Restaurant, Nairobi"
  },
  "Thorn Tree Cafe": {
    aliases: ["Thorn Tree", "thorn tree cafe"],
    latitude: -1.2856, longitude: 36.8208,
    shortLabel: "Thorn Tree", fullLabel: "The Thorn Tree Cafe, Stanley Hotel, Nairobi"
  },
  "Java House Westlands": {
    aliases: ["Java House", "java", "Java Westlands", "java house nairobi"],
    latitude: -1.2656, longitude: 36.8067,
    shortLabel: "Java House", fullLabel: "Java House, Westlands, Nairobi"
  },
  "Artcaffe Nairobi": {
    aliases: ["Artcaffe", "artcafe", "artcaffe nairobi"],
    latitude: -1.2631, longitude: 36.8047,
    shortLabel: "Artcaffe", fullLabel: "Artcaffe, Westlands, Nairobi"
  },
  "Galitos Nairobi": {
    aliases: ["Galitos", "galitos nairobi"],
    latitude: -1.2669, longitude: 36.8050,
    shortLabel: "Galitos", fullLabel: "Galitos, Westlands, Nairobi"
  },
  "Chicken Inn Nairobi CBD": {
    aliases: ["Chicken Inn", "chicken inn nairobi"],
    latitude: -1.2864, longitude: 36.8222,
    shortLabel: "Chicken Inn CBD", fullLabel: "Chicken Inn, Nairobi CBD"
  },
  "Nairobi Club": {
    aliases: ["Nairobi Club", "nairobi club restaurant"],
    latitude: -1.2961, longitude: 36.8239,
    shortLabel: "Nairobi Club", fullLabel: "The Nairobi Club, Upper Hill"
  },
  "Tamarind Restaurant Nairobi": {
    aliases: ["Tamarind", "tamarind nairobi", "tamarind restaurant"],
    latitude: -1.2708, longitude: 36.8133,
    shortLabel: "Tamarind Nairobi", fullLabel: "Tamarind Restaurant, Haile Selassie Ave, Nairobi"
  },
  "Tamarind Restaurant Mombasa": {
    aliases: ["Tamarind Mombasa", "tamarind mombasa"],
    latitude: -4.0528, longitude: 39.6694,
    shortLabel: "Tamarind Mombasa", fullLabel: "Tamarind Restaurant, Mombasa"
  },
  "About Thyme Restaurant": {
    aliases: ["About Thyme", "about thyme", "about thyme nairobi"],
    latitude: -1.3072, longitude: 36.7803,
    shortLabel: "About Thyme", fullLabel: "About Thyme Restaurant, Ngong Road, Nairobi"
  }
};

// ── PETROL STATIONS (KEY LOCATIONS) ───────────────────────────────────────
export const KENYA_PETROL_STATIONS: Record<string, LocationData> = {
  "Total Westlands": {
    aliases: ["Total Westlands", "total energies westlands"],
    latitude: -1.2631, longitude: 36.8047,
    shortLabel: "Total Westlands", fullLabel: "TotalEnergies Petrol Station, Westlands"
  },
  "Shell Uhuru Highway": {
    aliases: ["Shell Uhuru", "shell uhuru highway"],
    latitude: -1.3000, longitude: 36.8331,
    shortLabel: "Shell Uhuru Highway", fullLabel: "Shell Petrol Station, Uhuru Highway, Nairobi"
  },
  "Kenol Kobil Thika Road": {
    aliases: ["Kenol Kobil", "kenol thika road"],
    latitude: -1.2336, longitude: 36.8894,
    shortLabel: "Kenol Thika Road", fullLabel: "Kenol Kobil, Thika Road, Nairobi"
  },
  "Shell Mombasa Road": {
    aliases: ["Shell Mombasa Road", "shell along mombasa road"],
    latitude: -1.3200, longitude: 36.8517,
    shortLabel: "Shell Mombasa Road", fullLabel: "Shell Petrol Station, Mombasa Road, Nairobi"
  }
};

// ── CHURCHES & WORSHIP ─────────────────────────────────────────────────────
export const KENYA_WORSHIP: Record<string, LocationData> = {
  "Holy Family Basilica Nairobi": {
    aliases: ["Holy Family Basilica", "Holy Family", "holy family nairobi"],
    latitude: -1.2856, longitude: 36.8172,
    shortLabel: "Holy Family Basilica", fullLabel: "Holy Family Basilica, Nairobi CBD"
  },
  "All Saints Cathedral Nairobi": {
    aliases: ["All Saints Cathedral", "all saints nairobi"],
    latitude: -1.2886, longitude: 36.8178,
    shortLabel: "All Saints Cathedral", fullLabel: "All Saints Cathedral, Nairobi"
  },
  "Nairobi Chapel": {
    aliases: ["Nairobi Chapel", "nairobi chapel karen"],
    latitude: -1.3397, longitude: 36.7211,
    shortLabel: "Nairobi Chapel", fullLabel: "Nairobi Chapel, Karen"
  },
  "CITAM Valley Road": {
    aliases: ["CITAM", "CITAM Valley Road", "citam nairobi"],
    latitude: -1.2961, longitude: 36.8103,
    shortLabel: "CITAM Valley Road", fullLabel: "CITAM Valley Road, Nairobi"
  },
  "Jamia Mosque Nairobi": {
    aliases: ["Jamia Mosque", "jamia mosque nairobi", "Jamia"],
    latitude: -1.2839, longitude: 36.8219,
    shortLabel: "Jamia Mosque", fullLabel: "Jamia Mosque, Nairobi CBD"
  }
};

// ── STADIA & SPORTS ────────────────────────────────────────────────────────
export const KENYA_STADIA: Record<string, LocationData> = {
  "Kasarani Stadium": {
    aliases: ["Kasarani", "kasarani stadium", "Moi International Sports Centre"],
    latitude: -1.2228, longitude: 36.8994,
    shortLabel: "Kasarani Stadium", fullLabel: "Moi International Sports Centre, Kasarani"
  },
  "Nyayo Stadium": {
    aliases: ["Nyayo Stadium", "nyayo stadium nairobi"],
    latitude: -1.3017, longitude: 36.8269,
    shortLabel: "Nyayo Stadium", fullLabel: "Nyayo National Stadium, Nairobi"
  },
  "City Stadium Nairobi": {
    aliases: ["City Stadium", "city stadium nairobi"],
    latitude: -1.2833, longitude: 36.8533,
    shortLabel: "City Stadium", fullLabel: "City Stadium, Nairobi"
  },
  "Afraha Stadium Nakuru": {
    aliases: ["Afraha Stadium", "afraha nakuru"],
    latitude: -0.2972, longitude: 36.0678,
    shortLabel: "Afraha Stadium", fullLabel: "Afraha Stadium, Nakuru"
  },
  "Mombasa Municipal Stadium": {
    aliases: ["Mombasa Stadium", "mombasa municipal stadium"],
    latitude: -4.0414, longitude: 39.6644,
    shortLabel: "Mombasa Stadium", fullLabel: "Mombasa Municipal Stadium"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All location databases keyed by priority (higher = returned first).
 * Priority reflects typical navigation intent.
 */
const DATABASES: { db: Record<string, LocationData>; matchBonus: number; type: LocationType }[] = [
  { db: KENYA_AIRPORTS, matchBonus: 1000, type: "airport" },
  { db: KENYA_NATIONAL_PARKS, matchBonus: 950, type: "park" },
  { db: KENYA_BEACHES_COASTAL, matchBonus: 900, type: "beach" },
  { db: NAIROBI_HOSPITALS, matchBonus: 880, type: "hospital" },
  { db: MOMBASA_HOSPITALS, matchBonus: 880, type: "hospital" },
  { db: NAIROBI_BUS_STATIONS, matchBonus: 870, type: "bus_station" },
  { db: NAIROBI_GOVERNMENT, matchBonus: 860, type: "government" },
  { db: NAIROBI_UNIVERSITIES, matchBonus: 850, type: "university" },
  { db: NAIROBI_NEIGHBORHOODS, matchBonus: 840, type: "neighborhood" },
  { db: MOMBASA_AREAS, matchBonus: 840, type: "neighborhood" },
  { db: KISUMU_AREAS, matchBonus: 840, type: "neighborhood" },
  { db: NAKURU_AREAS, matchBonus: 840, type: "neighborhood" },
  { db: ELDORET_AREAS, matchBonus: 840, type: "neighborhood" },
  { db: KENYA_CITIES_TOWNS, matchBonus: 830, type: "city" },
  { db: NAIROBI_MALLS, matchBonus: 820, type: "mall" },
  { db: NAIROBI_MARKETS, matchBonus: 810, type: "market" },
  { db: KENYA_HOTELS_RESORTS, matchBonus: 800, type: "hotel" },
  { db: KENYA_LANDMARKS, matchBonus: 790, type: "landmark" },
  { db: KENYA_RESTAURANTS_DINING, matchBonus: 780, type: "restaurant" },
  { db: KENYA_STADIA, matchBonus: 770, type: "stadium" },
  { db: KENYA_WORSHIP, matchBonus: 760, type: "church" },
  { db: KENYA_PETROL_STATIONS, matchBonus: 600, type: "petrol" },
];

/**
 * Fuzzy search across the entire Kenya location database.
 * Supports alias matching, partial name matching, and IATA code lookups.
 *
 * @param query  User-typed string (e.g. "JKIA", "westlands mall", "aga khan")
 * @param limit  Max results to return (default 8)
 * @returns      Sorted array of LocationResult objects
 */
export function searchLocationAliases(query: string, limit = 8): LocationResult[] {
  if (!query?.trim() || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const results: LocationResult[] = [];

  for (const { db, matchBonus, type } of DATABASES) {
    for (const [name, data] of Object.entries(db)) {
      let matchScore = 0;
      const lowerName = name.toLowerCase();

      if (lowerName === lowerQuery) {
        matchScore = matchBonus + 120; // exact name
      } else if (data.aliases.some(a => a.toLowerCase() === lowerQuery)) {
        matchScore = matchBonus + 100; // exact alias
      } else if (lowerName.startsWith(lowerQuery)) {
        matchScore = matchBonus + 80;  // name starts with query
      } else if (data.aliases.some(a => a.toLowerCase().startsWith(lowerQuery))) {
        matchScore = matchBonus + 70;  // alias starts with query
      } else if (lowerName.includes(lowerQuery)) {
        matchScore = matchBonus + 50;  // name contains query
      } else if (data.aliases.some(a => a.toLowerCase().includes(lowerQuery))) {
        matchScore = matchBonus + 30;  // alias contains query
      }

      if (matchScore > 0) {
        results.push({ ...data, name, matchScore, type });
      }
    }
  }

  // De-duplicate by coordinates (same place listed in multiple DBs)
  const seen = new Set<string>();
  const deduplicated = results.filter(r => {
    const key = `${r.latitude.toFixed(4)},${r.longitude.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduplicated
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Reverse geocode: find the nearest named location to GPS coordinates.
 * Returns up to `limit` results sorted by distance.
 *
 * @param lat    Latitude (WGS84)
 * @param lng    Longitude (WGS84)
 * @param limit  Max results (default 5)
 */
export function reverseGeocode(
  lat: number,
  lng: number,
  limit = 5
): (LocationResult & { distanceKm: number })[] {
  const R = 6371; // Earth radius in km
  const toRad = (d: number) => (d * Math.PI) / 180;

  const allLocations: LocationResult[] = [];
  for (const { db, matchBonus, type } of DATABASES) {
    for (const [name, data] of Object.entries(db)) {
      allLocations.push({ ...data, name, matchScore: matchBonus, type });
    }
  }

  return allLocations
    .map(loc => {
      const dLat = toRad(loc.latitude - lat);
      const dLng = toRad(loc.longitude - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(loc.latitude)) * Math.sin(dLng / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...loc, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Look up an airport by IATA code (e.g. "NBO", "MBA", "KIS").
 */
export function getAirportByIATA(code: string): LocationData | null {
  const upper = code?.toUpperCase().trim();
  for (const data of Object.values(KENYA_AIRPORTS)) {
    if (data.aliases.includes(upper) || data.shortLabel === upper) {
      return data;
    }
  }
  return null;
}

/**
 * Get all locations of a specific type.
 */
export function getLocationsByType(type: LocationType): LocationResult[] {
  const entry = DATABASES.find(d => d.type === type);
  if (!entry) return [];
  return Object.entries(entry.db).map(([name, data]) => ({
    ...data, name, matchScore: entry.matchBonus, type,
  }));
}

/**
 * Build a Google Maps static link for a location.
 * Uses Place ID when available for maximum accuracy.
 */
export function buildGoogleMapsUrl(loc: LocationData): string {
  if (loc.placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${loc.placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
}

/**
 * Build a Google Maps Directions URL between two locations.
 */
export function buildDirectionsUrl(
  origin: LocationData,
  destination: LocationData,
  mode: "driving" | "walking" | "transit" | "bicycling" = "driving"
): string {
  const o = origin.placeId
    ? `place_id:${origin.placeId}`
    : `${origin.latitude},${origin.longitude}`;
  const d = destination.placeId
    ? `place_id:${destination.placeId}`
    : `${destination.latitude},${destination.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=${mode}`;
}