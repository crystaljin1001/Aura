import { QuickPeek } from '@/features/impact-engine/components/QuickPeek';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Impact Engine Dashboard */}
      <QuickPeek />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-black dark:text-white">
            Builder&apos;s OS
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            A specialized portfolio platform for builders to showcase their
            impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#features"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Get Started
            </a>
            <a
              href="#about"
              className="px-8 py-3 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
