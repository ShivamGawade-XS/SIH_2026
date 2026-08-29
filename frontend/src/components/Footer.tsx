import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-10 mt-16">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between gap-8">

        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">HoneyChain</p>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Blockchain honey provenance for KVIC and the National Bee Board.
            SIH 2026 — Problem Statement SIH26021.
          </p>
        </div>

        <div className="flex gap-12 text-sm">
          <div>
            <p className="text-text-muted text-xs font-medium mb-3 uppercase tracking-wide">Platform</p>
            <ul className="space-y-2">
              <li><Link href="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Home</Link></li>
              <li><Link href="/verify" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Verify</Link></li>
              <li><Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium mb-3 uppercase tracking-wide">Open Source</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/ShivamGawade-XS/SIH_2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-sm"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-border">
        <p className="text-xs text-text-muted">
          © 2026 HoneyChain by TrueTag. Open source under MIT License.
          Lead Developer: Shivam Gawade.
        </p>
      </div>
    </footer>
  );
}
