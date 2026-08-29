"use client";

import { useState } from "react";
import { MessageSquare, PhoneCall, Smartphone, X, Send, Sparkles, CheckCircle2 } from "lucide-react";

interface OfflineSMSSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfflineSMSSimulator({ isOpen, onClose }: OfflineSMSSimulatorProps) {
  const [channel, setChannel] = useState<"sms" | "ussd">("sms");
  const [queryText, setQueryText] = useState("VERIFY TT-2026-00001");
  const [lang, setLang] = useState<"en" | "hi" | "bn">("en");
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setResponseMsg(null);

    setTimeout(() => {
      setIsSending(false);
      const isBatch2 = queryText.includes("2") || queryText.toLowerCase().includes("sundarban");

      if (channel === "sms") {
        if (lang === "hi") {
          setResponseMsg(
            isBatch2
              ? `[KVIC-HONEY]: बैच #002 (सुंदरबन मैंग्रोव हनी) प्रमाणित शुद्ध है। उत्पादक: लक्ष्मी देवी (प. बंगाल)। शुद्धता स्कोर: 91/100 (FSSAI IS 4941 पास)। पॉलीगॉन ब्लॉकचेन पर सुरक्षित।`
              : `[KVIC-HONEY]: बैच #001 (मुजफ्फरपुर लीची हनी) प्रमाणित शुद्ध है। उत्पादक: राजेश कुमार वर्मा (बिहार)। शुद्धता स्कोर: 94/100 (ग्रेड A+)। ब्लॉकचेन हैश: 0x98f4...`
          );
        } else if (lang === "bn") {
          setResponseMsg(
            isBatch2
              ? `[KVIC-HONEY]: ব্যাচ #002 (সুন্দরবন বুনো মধু) ১০০% খাঁটি। মৌচাষী: লক্ষ্মী দেবী। বিশুদ্ধতা স্কোর: 91/100 (FSSAI উত্তীর্ণ)। ব্লকচেইন যাচাইকৃত।`
              : `[KVIC-HONEY]: ব্যাচ #001 (মুজাফফরপুর লিচু মধু) ১০০% খাঁটি। মৌচাষী: রাজেশ কুমার বর্মা। বিশুদ্ধতা স্কোর: 94/100 (গ্রেড A+)।`
          );
        } else {
          setResponseMsg(
            isBatch2
              ? `[KVIC-HONEY]: Batch #002 (Sundarbans Wild Mangrove Honey) is AUTHENTIC. Beekeeper: Lakshmi Devi (Bengal). Purity Score: 91/100 (FSSAI IS 4941 Passed). Polygon Blockchain Anchored.`
              : `[KVIC-HONEY]: Batch #001 (Muzaffarpur Litchi Honey) is AUTHENTIC. Beekeeper: Rajesh K. Verma (Bihar). Purity Score: 94/100 (Grade A+ Raw Organic). FSSAI Compliant. Polygon Tx: 0x98f4...`
          );
        }
      } else {
        // USSD response
        setResponseMsg(
          `*99*4941# KVIC HoneyChain:\n1. Status: VERIFIED PURE\n2. Batch: #001 (Litchi Honey)\n3. Farmer: Rajesh Verma (Bihar)\n4. Score: 94/100 (Grade A+)\nPress 0 for Voice Hindi`
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="border-2 border-gold bg-white max-w-lg w-full p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-charcoal/40 hover:text-charcoal transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
          <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Inclusive Rural Access Protocol
            </p>
            <h3 className="text-2xl serif text-charcoal font-bold">
              Offline SMS & USSD Verification
            </h3>
          </div>
        </div>

        <p className="text-xs text-warm-grey mb-6">
          Enables non-smartphone and rural feature phone users to authenticate honey jars via toll-free SMS (<strong>56767</strong>) or national USSD shortcode (<strong>*99*4941#</strong>).
        </p>

        {/* Mode & Language Tabs */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex border border-charcoal/20">
            <button
              type="button"
              onClick={() => { setChannel("sms"); setQueryText("VERIFY TT-2026-00001"); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                channel === "sms" ? "bg-charcoal text-alabaster" : "bg-white text-warm-grey hover:bg-alabaster"
              }`}
            >
              SMS (56767)
            </button>
            <button
              type="button"
              onClick={() => { setChannel("ussd"); setQueryText("*99*4941*001#"); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                channel === "ussd" ? "bg-charcoal text-alabaster" : "bg-white text-warm-grey hover:bg-alabaster"
              }`}
            >
              USSD (*99#)
            </button>
          </div>

          <div className="flex gap-1">
            {(["en", "hi", "bn"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[10px] font-bold uppercase border ${
                  lang === l ? "border-gold bg-gold/20 text-charcoal" : "border-charcoal/20 text-warm-grey"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "বাংলা"}
              </button>
            ))}
          </div>
        </div>

        {/* Input Query Bar */}
        <div className="flex gap-2 mb-6">
          <input
            id="sms-query"
            name="query"
            aria-label="Offline SMS or USSD verification query input"
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={channel === "sms" ? "e.g. VERIFY TT-2026-00001" : "*99*4941*001#"}
            className="flex-1 h-11 border-2 border-charcoal/20 px-3 text-xs font-mono font-bold focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="px-5 h-11 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Querying..." : "Send"}</span>
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[10px] uppercase font-bold text-warm-grey self-center">Presets:</span>
          <button
            type="button"
            onClick={() => setQueryText(channel === "sms" ? "VERIFY TT-2026-00001" : "*99*4941*001#")}
            className="text-[10px] font-mono px-2 py-1 bg-[#F9F8F6] border border-charcoal/15 hover:border-gold text-charcoal"
          >
            Batch #1 (Bihar Litchi)
          </button>
          <button
            type="button"
            onClick={() => setQueryText(channel === "sms" ? "VERIFY TT-2026-00002" : "*99*4941*002#")}
            className="text-[10px] font-mono px-2 py-1 bg-[#F9F8F6] border border-charcoal/15 hover:border-gold text-charcoal"
          >
            Batch #2 (Sundarbans)
          </button>
        </div>

        {/* Simulated Feature Phone Screen */}
        <div className="border-4 border-charcoal bg-[#1A261A] text-[#76E076] p-4 rounded-lg font-mono text-xs shadow-inner min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[9px] text-[#55A055] pb-2 border-b border-[#2A3F2A]">
            <span>SIGNAL: ■■■■ (BSNL/Jio)</span>
            <span>{channel === "sms" ? "SMS GATEWAY: 56767" : "USSD GATEWAY"}</span>
          </div>

          <div className="py-3">
            {responseMsg ? (
              <div className="animate-in fade-in duration-300">
                <p className="text-[10px] text-[#A0FFA0] mb-1 font-bold">
                  {channel === "sms" ? "➔ INCOMING FROM MD-KVICGOV:" : "➔ USSD SESSION ACTIVE:"}
                </p>
                <p className="whitespace-pre-line leading-relaxed">{responseMsg}</p>
              </div>
            ) : (
              <p className="text-center text-[#4A7F4A] italic text-[11px] pt-4">
                Press &quot;Send&quot; above to simulate mobile network carrier query...
              </p>
            )}
          </div>

          <div className="text-right text-[8px] text-[#55A055]">
            GOVT OF INDIA • NATIONAL BEE BOARD ENCLAVE
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 mt-6 border border-charcoal/30 bg-white hover:bg-alabaster text-charcoal uppercase tracking-widest text-[10px] font-bold transition-colors"
        >
          Close Simulator
        </button>
      </div>
    </div>
  );
}
