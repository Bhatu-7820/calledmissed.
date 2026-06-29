import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center select-none font-sans">
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">
        Page Not Found
      </h2>
      <p className="text-slate-450 text-xs mb-6">
        The workspace path you are seeking could not be located.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
      >
        Return to Chat
      </Link>
    </div>
  );
}
