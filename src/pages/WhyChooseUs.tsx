import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Banknote, Handshake, ShieldCheck, Rocket, Zap } from 'lucide-react';

export function WhyChooseUs() {
  return (
    <div className="max-w-6xl mx-auto py-10 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sira-blue mb-4">Why Choose Sira Go?</h1>
        <p className="text-lg text-gray-500 font-medium">We make hiring and job searching simple, fast, and accessible for everyone.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: 'Post Jobs in Minutes', desc: 'No complicated process. No waiting for admins. Submit your job in under 2 minutes via web or Telegram.' },
          { icon: Banknote, title: 'Affordable for Every Business', desc: 'Traditional platforms are expensive. Sira Go is built to be cost-effective for startups and growing companies.' },
          { icon: Send, title: 'Telegram-First Experience', desc: 'Reach thousands instantly. Your job gets published directly to our Telegram audience.' },
          { icon: Handshake, title: 'Direct Connection', desc: 'No long application forms. Candidates can apply instantly by contacting you directly via Telegram or Phone.' },
          { icon: ShieldCheck, title: 'Verified Quality', desc: 'We review posts to reduce spam and fake jobs. Quality over quantity ensures you find real talent.' },
          { icon: Rocket, title: 'Fast Hiring Process', desc: 'Less friction means faster hiring. Get responses quickly and fill open positions significantly faster.' }
        ].map((feature, idx) => {
          const isEven = idx % 2 === 0;
          const Icon = feature.icon;
          return (
            <div key={idx} className={`group flex flex-col p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-[0_20px_40px_-12px_rgba(11,44,95,0.12)] transition-all duration-300 transform hover:-translate-y-[4px] relative overflow-hidden ${isEven ? 'hover:border-sira-blue/30' : 'hover:border-sira-orange/30'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-700 ease-out ${isEven ? 'bg-sira-blue' : 'bg-sira-orange'}`}></div>
              <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-6 group-hover:scale-110 transition-transform duration-300 ease-out relative z-10 ${isEven ? 'group-hover:border-sira-blue/30 text-sira-blue' : 'group-hover:border-sira-orange/30 text-sira-orange'}`}>
                <Icon size={28} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{feature.title}</h3>
              <p className="text-base text-gray-500 leading-relaxed font-medium relative z-10">{feature.desc}</p>
            </div>
          );
        })}
      </div>

      <section className="p-10 md:p-14 bg-sira-blue rounded-3xl text-white flex flex-col sm:flex-row justify-between items-center gap-8 shadow-[0_20px_40px_-15px_rgba(11,44,95,0.4)] text-center sm:text-left">
        <div className="flex flex-col">
          <h4 className="text-3xl md:text-4xl font-bold text-white mb-2">Ready to grow your team?</h4>
          <p className="text-blue-100 text-lg">Join hundreds of companies hiring on Sira Go today.</p>
        </div>
        <Link to="/employer/post" className="px-10 py-5 bg-sira-orange text-black font-bold rounded-2xl text-lg hover:bg-[#E66E00] transition-colors shadow-lg whitespace-nowrap">
          Post a Job Now
        </Link>
      </section>
    </div>
  );
}
