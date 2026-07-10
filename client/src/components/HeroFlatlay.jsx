import { Search } from 'lucide-react'

export default function HeroFlatlay({ featured = [], onSearch }) {
  const positions = [
    'top-4 left-[4%] w-40 rotate-[-8deg]',
    'top-24 left-[26%] w-48 rotate-[5deg] z-10',
    'top-2 left-[50%] w-44 rotate-[-3deg]',
    'top-32 left-[70%] w-40 rotate-[9deg]',
    'top-0 left-[85%] w-36 rotate-[-6deg] hidden lg:block',
  ]

  return (
    <section className="relative overflow-hidden bg-[#EEE7D8] px-4 pb-16 pt-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #2B2620 1px, transparent 1px), radial-gradient(circle at 60% 70%, #2B2620 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="relative z-20">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#6E7856]">
            This week&apos;s flatlay
          </span>
          <h1 className="mt-3 font-['Fraunces'] text-4xl italic leading-tight text-[#2B2620] sm:text-5xl">
            Made by hand,
            <br />
            chosen for you.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] text-[#4A443A]">
            Ceramics, jewelry, prints and more from independent makers —
            curated by your taste, not an algorithm&apos;s guess.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSearch?.(new FormData(e.target).get('q'))
            }}
            className="mt-6 flex max-w-md items-center gap-2 rounded-sm border border-dashed border-[#5C3A4B] bg-[#FBF8F2] p-1.5"
          >
            <Search size={18} className="ml-2 text-[#5C3A4B]" />
            <input
              name="q"
              type="text"
              placeholder="Search hand-thrown mugs, gold rings, wall prints..."
              className="w-full bg-transparent py-1.5 text-sm text-[#2B2620] outline-none placeholder:text-[#9A9284]"
            />
            <button
              type="submit"
              className="rounded-sm bg-[#5C3A4B] px-4 py-2 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] transition-colors hover:bg-[#2B2620] cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        <div className="relative h-72 sm:h-96">
          {featured.slice(0, 5).map((p, i) => (
            <img
              key={p.id}
              src={p.image}
              alt={p.name}
              className={`absolute aspect-square rounded-sm border-4 border-[#FBF8F2] object-cover shadow-[0_8px_20px_rgba(43,38,32,0.18)] ${positions[i]}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
