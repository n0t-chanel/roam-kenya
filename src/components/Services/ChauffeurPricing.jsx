import React from "react";
import { Info, CheckCircle2 } from "lucide-react";

const rates = [
  { vehicle: "Executive Sedan (Mercedes/BMW)", dailyKes: "35,000", dailyUsd: "270", airportKes: "12,000", airportUsd: "95" },
  { vehicle: "Luxury SUV (Land Cruiser V8/300)", dailyKes: "55,000", dailyUsd: "425", airportKes: "18,000", airportUsd: "140" },
  { vehicle: "Corporate SUV (Prado TXL)", dailyKes: "25,000", dailyUsd: "195", airportKes: "10,000", airportUsd: "80" },
  { vehicle: "Luxury Van (Alphard/Vellfire)", dailyKes: "22,000", dailyUsd: "170", airportKes: "8,500", airportUsd: "65" },
];

export default function ChauffeurPricing() {
  return (
    <section className="py-24 bg-gray-50 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-2 block">Transparent Rates</span>
            <h2 className="text-4xl font-bold">Chauffeur Service Pricing</h2>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm bg-white p-3 rounded-xl border border-gray-200">
            <Info size={16} className="text-[#C5A059]" />
            <span>Rates inclusive of fuel (Nairobi 80km) & driver.</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-white">
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Vehicle Category</th>
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Daily Rate (KES / USD)</th>
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Airport Transfer</th>
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-900">{item.vehicle}</td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-[#B35A38]">KES {item.dailyKes}</span>
                      <span className="text-xs text-gray-400">Approx. ${item.dailyUsd}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700">KES {item.airportKes}</span>
                      <span className="text-xs text-gray-400">${item.airportUsd}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase">
                      <CheckCircle2 size={14} /> Available
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}