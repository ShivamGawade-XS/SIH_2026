export default function GridLines() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-40 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
      <div className="w-full h-full flex justify-between">
        <div className="w-px h-full bg-charcoal/5" />
        <div className="w-px h-full bg-charcoal/5 hidden md:block" />
        <div className="w-px h-full bg-charcoal/5 hidden lg:block" />
        <div className="w-px h-full bg-charcoal/5" />
      </div>
    </div>
  );
}
