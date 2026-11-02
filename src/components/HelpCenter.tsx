import React, { useState } from 'react';
import { MessageSquare, Headset, HelpCircle, ShieldCheck, ChevronDown, ChevronUp, Wallet, ShoppingBag } from 'lucide-react';

export const HelpCenter: React.FC = () => {
  const WHATSAPP_NUMBER = '01625174905';
  const WHATSAPP_LINK = `https://wa.me/8801625174905?text=Hello%20Drive%20Zone%20Online%20Support`;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I deposit money into my Drive Zone Online wallet?',
      a: 'Go to the Wallet tab, select your preferred mobile banking method (bKash, Nagad, or Rocket), send money manually to payment number 01625174905, copy the Transaction ID (TrxID) from your SMS, and submit the deposit form. Admin verifies and credits your wallet.',
    },
    {
      q: 'What is the deposit and user transfer fee?',
      a: 'A flat fee of ৳20 applies for deposit requests and user-to-user balance transfers. This fee covers system transaction overhead.',
    },
    {
      q: 'How do I purchase a gaming product or hypercar skin?',
      a: 'Ensure you have sufficient wallet balance, browse the Marketplace, select your item, and click "Buy Now". The purchase uses atomic security transactions to deduct funds and credit the seller instantly.',
    },
    {
      q: 'How do I sell my own Drive Zone Online items?',
      a: 'Click "Sell Product" or "Post Product" in the header or dashboard, fill in your product title, description, price, category, and upload an image. Your product will immediately be listed on the marketplace.',
    },
    {
      q: 'What should I do if my deposit is delayed or rejected?',
      a: 'Double check that you submitted the correct TrxID. If an issue arises, contact our support team directly via WhatsApp at 01625174905 for instant resolution.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Headset className="w-3.5 h-3.5" /> 24/7 Official Customer Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
          DRIVE ZONE ONLINE <span className="text-cyan-400">HELP CENTER</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Need help with deposits, wallet transfers, or marketplace purchases? Our dedicated support team is available via WhatsApp.
        </p>
      </div>

      {/* WhatsApp Hero Card */}
      <div className="cyber-card p-8 rounded-3xl border border-emerald-500/40 text-center space-y-4 bg-emerald-950/20 shadow-2xl">
        <MessageSquare className="w-12 h-12 text-emerald-400 mx-auto fill-current" />
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white">Contact Live WhatsApp Support</h2>
          <p className="text-sm font-tech font-bold text-emerald-400">Official Number: {WHATSAPP_NUMBER}</p>
        </div>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          For fast deposit verification, payment issues, or order assistance, chat directly with our customer support agent on WhatsApp.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-wider px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          Open WhatsApp Chat ({WHATSAPP_NUMBER})
        </a>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 pt-4">
        <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="cyber-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs font-bold text-white hover:text-cyan-300"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
