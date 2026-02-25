import Navbar from '@/components/generic/navbar'

export default function MemePage() {
  const url = 'https://api.memegen.link/images/buzz/memes/memes_everywhere.webp'

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3">
      <Navbar />
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-slate-900 text-slate-50">
        <img src={url} alt="meme" className="max-w-5/6 h-auto rounded-3xl" />
      </div>
    </div>
  )
}