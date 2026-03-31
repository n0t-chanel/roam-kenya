// src/data/galleryData.js

// 1. Import the images first
import galleryImg from "../assets/gallery.jpg";
import TsavoImg from "../assets/Tsavo.jpg";
import BreezeImg from "../assets/Breeze.jpg";
import DianiImg from "../assets/Diani.jpg";
import groupImg from "../assets/group.jpg";
import HikingImg from "../assets/Hiking.jpg";


// 2. Export the array
export const galleryItems = [
     { 
    id: 1, 
    image: galleryImg, // Use the imported variable, not a string
    title: " RoadTrips Around Kenya", 
    category: "RoadTrips" 
  },
  { 
    id: 2, 
    image: TsavoImg, // Use the imported variable, not a string
    title: " Tsavo Elephants Beauty", 
    category: "Wilderness" 
  },
  { 
    id: 3, 
    image: BreezeImg, 
    title: "Explore Mount Kenya", 
    category: "Adventure" 
  },
  { 
    id: 4, 
    image: DianiImg, 
    title: " Lets Go To Diani Beach Adventures", 
    category: "Coastal" 
  },
  {
    id:5,
    image:groupImg,
    title: "Group Of Friends Enjoying Our Rides",
    category:"Ride With Us "
  },
   {
    id:6,
    image:HikingImg,
    title: "Hikings ",

  }
];