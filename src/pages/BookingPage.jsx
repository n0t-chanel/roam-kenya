import { useState } from "react";
import ServiceSelector from "../components/ServiceSelector";
import ServiceBookingForm from "../components/ServiceBookingForm";

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleBackToSelector = () => {
    setSelectedService(null);
  };

  return (
    <>
      {selectedService ? (
        <ServiceBookingForm 
          serviceType={selectedService} 
          onBack={handleBackToSelector}
        />
      ) : (
        <ServiceSelector onSelectService={handleServiceSelect} />
      )}
    </>
  );
}
