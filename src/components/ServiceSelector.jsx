import { Plane, Car, Hotel, MapPin, Heart, Camera, Truck } from "lucide-react";

const SERVICES = [
  {
    id: "airport-transfer",
    name: "Airport Transfers",
    description: "Punctual, stress-free arrivals at JKIA & Wilson.",
    icon: Plane,
    iconColor: "#B35A38"
  },
  {
    id: "chauffeur-rental",
    name: "Chauffeur Rentals",
    description: "Premium fleet with professional drivers for the day.",
    icon: Car,
    iconColor: "#B35A38"
  },
  {
    id: "hotel-transfer",
    name: "Hotel Transfers",
    description: "Seamless transit direct to your Nairobi accommodation.",
    icon: Hotel,
    iconColor: "#B35A38"
  },
  {
    id: "intercity-ride",
    name: "Intercity Rides",
    description: "Safe, luxurious long-distance travel across Kenya.",
    icon: MapPin,
    iconColor: "#B35A38"
  },
  {
    id: "wedding-travel",
    name: "Wedding Travel",
    description: "Elegant transport for your special day.",
    icon: Heart,
    iconColor: "#B35A38"
  },
  {
    id: "safari-tour",
    name: "Safari Tours",
    description: "Custom expeditions for locals and tourists.",
    icon: Camera,
    iconColor: "#B35A38"
  },
  {
    id: "fleet-management",
    name: "Fleet Management",
    description: "Turn your vehicle into a premium asset.",
    icon: Truck,
    iconColor: "#B35A38"
  }
];

export default function ServiceSelector({ onSelectService }) {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-[#B35A38]">Service</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select a service to get started with your booking today
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="group relative p-8 bg-white border border-gray-300 hover:border-[#B35A38] transition-all duration-300 hover:shadow-lg text-left cursor-pointer"
              >
                {/* Content */}
                <div>
                  {/* Icon */}
                  <div className="w-16 h-16 bg-[#B35A38] flex items-center justify-center mb-4 group-hover:shadow-md transition-all duration-300">
                    <IconComponent
                      size={32}
                      className="text-white"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#B35A38] transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 group-hover:text-gray-800 transition-colors duration-300">
                    {service.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 group-hover:bg-[#B35A38] group-hover:border-[#B35A38] group-hover:text-white transition-all duration-300">
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
