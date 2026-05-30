import { useState } from "react";
import { Info, ChevronRight, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";

const FULL_DISCLAIMER = `This AI-generated report and all content provided by Hummm ("Hummm", "we", "us") are for general guidance and informational purposes only. They do not constitute a formal property valuation, financial advice, legal advice, investment advice, or any other form of professional advice.

Hummm uses artificial intelligence, publicly available data, and third-party data sources to generate estimates, scores, and recommendations. While we strive for accuracy, we make no guarantees, representations, or warranties — express or implied — regarding the completeness, accuracy, reliability, suitability, or availability of any information, data, or analysis provided.

You should not rely solely on any Hummm report or output when making property, financial, legal, or investment decisions. We strongly recommend that you consult a qualified, licensed professional in your jurisdiction — such as a RICS-accredited surveyor, solicitor, mortgage advisor, or financial advisor — before taking any action based on information provided by Hummm.

Hummm accepts no liability whatsoever for any loss, damage, cost, or expense (whether direct, indirect, incidental, consequential, or otherwise) arising from or in connection with the use of, or reliance on, any information or analysis provided by Hummm, including but not limited to property valuations, market analyses, negotiation strategies, compliance assessments, or investment projections.

All property data, including but not limited to prices, rental values, sold prices, floor areas, EPC ratings, and local area data, is sourced from publicly available records and third-party providers. Hummm does not independently verify this data and cannot guarantee its accuracy or completeness.

By using Hummm, you acknowledge and agree that:
• The information provided is not a substitute for professional advice.
• You are responsible for independently verifying all data and recommendations.
• Hummm is not liable for any decisions or actions taken based on its outputs.
• Past performance data does not guarantee future results.

Hummm acts as an autonomous property concierge and does not host, scrape, or store the databases of Rightmove, Zoopla, or any other property portal. We provide a curated search interface that links directly to public listings for the user's convenience.

For official valuations, legal compliance, or regulated financial advice, always consult a qualified professional.

© 2026 Hummm Global Pte. Ltd. All rights reserved.`;

const Disclaimer = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full py-4 px-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground/60 max-w-3xl mx-auto text-center">
          <Info size={10} className="inline mr-1 -mt-0.5 text-muted-foreground/40" />
          <span className="font-medium text-muted-foreground/70">Disclaimer:</span>{" "}
          This AI-generated report is for guidance purposes only and does not constitute formal valuation, financial, legal, or professional advice. Hummm accepts no liability for any decisions or losses arising from its use. For official valuations or advice, please consult a qualified licensed professional in your jurisdiction.{" "}
          <button
            onClick={() => setOpen(true)}
            className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            Read the full disclaimer →
          </button>
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Info size={18} className="text-primary" />
              Full Disclaimer
            </DialogTitle>
            <DialogDescription className="sr-only">Full legal disclaimer for Hummm services</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed mt-2">
            {FULL_DISCLAIMER}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Disclaimer;
