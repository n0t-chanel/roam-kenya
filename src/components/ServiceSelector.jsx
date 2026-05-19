import { Plane, Car, Hotel, MapPin, Heart, Camera, Truck } from "lucide-react";

const SERVICES = [
  {
    id: "airport-transfer",
    name: "Airport Transfers",
    description: "Punctual, stress-free arrivals at JKIA & Wilson.",
    icon: Plane,
    iconColor: "#C5A059"
  },
  {
    id: "chauffeur-rental",
    name: "Chauffeur Rentals",
    description: "Premium fleet with professional drivers for the day.",
    icon: Car,
    iconColor: "#C5A059"
  },
  {
    id: "hotel-transfer",
    name: "Hotel Transfers",
    description: "Seamless transit direct to your Nairobi accommodation.",
    icon: Hotel,
    iconColor: "#C5A059"
  },
  {
    id: "intercity-ride",
    name: "Intercity Rides",
    description: "Safe, luxurious long-distance travel across Kenya.",
    icon: MapPin,
    iconColor: "#C5A059"
  },
  {
    id: "wedding-travel",
    name: "Wedding Travel",
    description: "Elegant transport for your special day.",
    icon: Heart,
    iconColor: "#C5A059"
  },
  {
    id: "safari-tour",
    name: "Safari Tours",
    description: "Custom expeditions for locals and tourists.",
    icon: Camera,
    iconColor: "#C5A059"
  },
  {
    id: "fleet-management",
    name: "Fleet Management",
    description: "Turn your vehicle into a premium asset.",
    icon: Truck,
    iconColor: "#C5A059"
  }
];

export default function ServiceSelector({ onSelectService }) {
  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="booking-portal-enter text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Choose Your <span className="text-[#C5A059]">Service</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Select a service to get started with your booking today
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="booking-portal-enter group relative rounded-xl p-5 sm:p-8 bg-white border border-gray-200 shadow-[0_10px_28px_rgba(15,23,42,0.04)] hover:border-[#1A1A1A]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.10)] transition-all duration-300 ease-out text-left cursor-pointer"
              >
                {/* Content */}
                <div>
                  {/* Icon */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#C5A059] group-hover:bg-[#1A1A1A] flex items-center justify-center mb-4 shadow-[0_8px_18px_rgba(197,160,89,0.18)] group-hover:shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition-all duration-300">
                    <IconComponent
                      size={32}
                      className="text-white"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1A1A1A] transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 group-hover:text-gray-800 transition-colors duration-300">
                    {service.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-gray-100 border border-gray-200 group-hover:bg-[#1A1A1A] group-hover:border-[#1A1A1A] group-hover:text-white transition-all duration-300">
                    <span className="text-xs font-semibold tracking-widest">
                      SELECT
                    </span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
