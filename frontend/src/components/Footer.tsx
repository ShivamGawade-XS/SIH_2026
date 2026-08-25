import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-24 px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-t border-charcoal">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Col 1 */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-6">Collaborators & Governance</p>
            <div className="flex flex-col gap-3">
              <p className="text-xl serif italic font-normal text-alabaster">Khadi and Village Industries Commission (KVIC)</p>
              <p className="text-base serif italic text-taupe/80">National Bee Board — Honey Mission</p>
              <p className="text-xs text-warm-grey mt-2">Ministry of Micro, Small & Medium Enterprises, Govt. of India</p>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-6">Architectural Core</p>
            <p className="text-xl serif text-alabaster">TrueTag Universal Authentication</p>
            <p className="text-xs text-taupe/70 mt-2 leading-relaxed">
              Decentralized provenance protocol combining Polygon PoS immutable ledger, AI-driven anti-adulteration models, and physical tamper-evident micro-QR seals.
            </p>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col items-start md:items-end">
            <div className="bg-alabaster text-charcoal px-4 py-2 font-bold text-xs uppercase tracking-widest mb-4">
              SIH 2026 Finalist
            </div>
            <p className="text-[10px] text-warm-grey uppercase tracking-widest">Problem Statement: SIH26021</p>
            <p className="text-xs text-taupe/80 mt-2">Lead Developer: <span className="text-gold font-medium">Shivam Gawade</span></p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey">
            © 2026 HoneyChain by TrueTag. Open Source Under MIT License.
          </p>
          <div className="flex gap-8">
            <Link href="https://github.com/ShivamGawade-XS/SIH_2026" target="_blank" className="text-[10px] uppercase tracking-widest text-warm-grey hover:text-gold transition-colors duration-300">
              GitHub Repository
            </Link>
            <Link href="https://github.com/ShivamGawade-XS/zerocert" target="_blank" className="text-[10px] uppercase tracking-widest text-warm-grey hover:text-gold transition-colors duration-300">
              ZeroCert Engine
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
