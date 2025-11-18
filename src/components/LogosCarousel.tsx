export default function LogosCarousel({ logos }: { logos: string[] }) {
    return (
        <div className="overflow-hidden whitespace-nowrap fade-mask relative">
            <div className="inline-flex gap-6 animate-marquee" style={{ animationDuration: `${logos.length * 10}s`, animation: 'scroll-infinite 60s linear infinite' }}>
                {logos.map((logo: string, idx: number) => (
                    <span key={idx} className="text-2xl font-semibold">
                        {logo}
                    </span>
                ))}
                {/* repeat */}
                {logos.map((logo, idx: number) => (
                    <span key={`dup-${idx}`} className="text-2xl font-semibold">
                        {logo}
                    </span>
                ))}
            </div>
        </div>
    );
}


// export default function TrustedBy() {
//   const logos = [
//     { name: 'OpenAI', icon: 'O' },
//     { name: 'Google', icon: 'G' },
//     { name: 'Vercel', icon: 'V' },
//     { name: 'Anthropic', icon: 'A' },
//     { name: 'Stripe', icon: 'S' },
//   ];

//   const infiniteLogos = Array(6).fill(null).flatMap(() => logos);

//   return (
//     <section className="py-16 bg-white border-b border-slate-200">
//       <div className="max-w-7xl mx-auto px-6 mb-8">
//         <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
//           Trusted by teams using
//         </p>
//       </div>

//       <div className="overflow-hidden">
//         <div
//           className="flex gap-12 md:gap-6 whitespace-nowrap"
//           style={{
//             animation: 'scroll-infinite 60s linear infinite',
//           }}
//         >
//           {infiniteLogos.map((logo, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
//             >
//               <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
//                 <span className="text-xl font-bold text-slate-700">{logo.icon}</span>
//               </div>
//               <span className="text-lg font-semibold text-slate-700">{logo.name}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
