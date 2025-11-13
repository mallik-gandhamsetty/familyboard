import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              FB
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">FamilyBoard</span>
          </div>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Turn Family Chaos Into Calm
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                FamilyBoard is an intelligent family hub that blends planning, communication, and household routines with AI that listens, learns, and organizes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Get Started Free
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-lg">📅</span>
                <span>Unified family calendar</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-lg">✅</span>
                <span>Shared tasks & chores</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-lg">🤖</span>
                <span>AI-powered assistant</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-lg">🎙️</span>
                <span>Voice commands</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-lg">🍽️</span>
                <span>Meal planning</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="space-y-4">
                <div className="h-4 bg-blue-200 dark:bg-blue-900 rounded w-3/4"></div>
                <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 h-24"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 h-24"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 h-24"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 h-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Why Families Love FamilyBoard
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to keep your family organized and connected
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Smart Calendar
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Unified calendar with conflict detection and smart suggestions
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                AI Assistant
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Natural language commands and predictive intelligence
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Voice Control
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Hands-free interaction with voice input and output
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Task Management
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Gamified chores with points and progress tracking
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Meal Planning
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                AI-assisted recipes and grocery list management
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Family Profiles
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Role-based access for parents, kids, and caregivers
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-blue-600 mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  3 family members
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Calendar + Tasks
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  AI text chat
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border border-blue-600 dark:border-blue-500">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Plus</h3>
              <p className="text-3xl font-bold text-blue-600 mb-6">$5/mo</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Unlimited members
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Voice mode
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Meal planner
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Smart routines
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-blue-600 mb-6">$10/mo</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Everything in Plus
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  AI summaries
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Predictive planning
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-600">✓</span>
                  Family memory
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-24 py-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 FamilyBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
