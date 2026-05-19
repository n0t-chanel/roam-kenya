import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How far in advance should I book my transfer?",
    answer: "We recommend booking your transfer at least 24 hours in advance to guarantee vehicle availability. However, for urgent requests, please contact our concierge via WhatsApp, and we will do our absolute best to accommodate you."
  },
  {
    question: "What happens if my flight to JKIA is delayed?",
    answer: "There is no need to worry. Our logistics team actively monitors all inbound flights using your provided flight number. Your chauffeur will adjust their arrival time automatically, and you receive 60 minutes of complimentary wait time after your flight lands."
  },
  {
    question: "What is your cancellation and refund policy?",
    answer: "We offer a highly flexible and transparent cancellation policy. Your 30% reservation deposit is fully refundable if you cancel your booking within 24 hours of making the payment. Refunds are automatically processed back to your original payment method within 5 business days."
  },
  {
    question: "Do you provide services outside of Nairobi?",
    answer: "Absolutely. While our headquarters are in Nairobi, our Intercity and Safari Class fleets are equipped to take you anywhere in East Africa, including Mombasa, Naivasha, Nanyuki, and the Maasai Mara."
  },
  {
    question: "Are your chauffeurs fully vetted?",
    answer: "Yes. Every Jamupet Transit chauffeur undergoes a rigorous background check, possesses a clean driving record with over 5 years of VIP experience, and is trained in defensive driving and executive etiquette."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleWhatsApp = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I have a specific question about your services.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="py-24 bg-[#FDFCFB] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#B35A38]" />
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Clear Details</span>
            <div className="w-8 h-[1px] bg-[#B35A38]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
            Frequently Asked <span className="italic font-light text-[#C5A059]">Questions.</span>
          </h2>
          <p className="text-gray-500 font-light text-sm md:text-base">
            Everything you need to know about traveling with Jamupet Transit Solutions.
          </p>
        </div>

        {/* Premium Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`bg-white border transition-all duration-500 rounded-2xl overflow-hidden ${
                  isOpen 
                    ? "border-[#C5A059]/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)]" 
                    : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className={`font-bold text-lg transition-colors duration-300 ${isOpen ? "text-[#C5A059]" : "text-gray-900 group-hover:text-[#C5A059]"}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ml-4 ${
                    isOpen ? "bg-[#C5A059]/10 text-[#C5A059] rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-[#C5A059]/5 group-hover:text-[#C5A059]"
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                
                {/* Smooth Expansion Wrapper */}
                <div 
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-8 pb-8 text-gray-600 font-light leading-relaxed border-t border-gray-50 pt-6 mt-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA for Unanswered Questions */}
        <div className="mt-16 text-center bg-gray-50 border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-gray-900 font-bold text-lg mb-1">Still have questions?</h4>
            <p className="text-gray-500 text-sm font-light">Our concierge team is available 24/7 to assist you.</p>
          </div>
          <button 
            onClick={handleWhatsApp}
            className="w-full md:w-auto bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-bold hover:border-[#C5A059] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm shrink-0"
          >
            <MessageCircle size={16} className="text-[#C5A059]" /> Chat with us
          </button>
        </div>

      </div>
    </section>
  );
}