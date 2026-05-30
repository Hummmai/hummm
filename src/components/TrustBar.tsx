const sources = ["Land Registry", "Rightmove", "Zoopla", "ONS", "RICS"];

const TrustBar = () => {
  return (
    <section className="w-full bg-white/[0.02] border-y border-white/[0.06] py-5">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <p className="text-white/25 text-xs uppercase tracking-widest font-medium whitespace-nowrap shrink-0">
          Powered by data from
        </p>
        <div className="flex flex-wrap gap-3">
          {sources.map((s) => (
            <span
              key={s}
              className="border border-white/[0.08] rounded-full px-4 py-1.5 text-xs font-semibold text-white/40 hover:text-white/60 hover:border-white/20 transition-all cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
