export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-widest">
          MISTER <span className="text-yellow-400">CASH</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 tracking-wide">
          Your AI mentor. No tests. No grades. Just real skills.
        </p>
        <button className="bg-yellow-400 text-black font-bold px-8 py-4 text-lg tracking-widest hover:bg-yellow-300 transition-all">
          GET STARTED
        </button>
      </div>
    </main>
  );
}
