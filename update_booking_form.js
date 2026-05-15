const fs = require('fs');

const filePath = 'C:\\Users\\MicroAple\\roam-kenya\\src\\components\\BookingForm.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldStr = `                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 text-gray-800 outline-none \${
                       formErrors.time ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-[#C5A059]'
                     }`}
                   />`;

const newStr = `                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 text-gray-800 outline-none \${formData.flightNumber.trim() ? 'bg-blue-50 border-blue-300 cursor-not-allowed' : ''} \${
                       formErrors.time ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-[#C5A059]'
                     }`}
                    title={formData.flightNumber ? "Time is automatically set to current time for airport pickups" : ""}
                   />`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Replacement successful!');
} else {
  console.log('✗ Pattern not found');
}
