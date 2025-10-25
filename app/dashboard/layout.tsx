
import { logoutAction } from "@/actions/auth-actions";
import { PowerIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-6">
        <nav className="flex-1">
          <Link
            href="/dashboard"
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            Sossilver Admin
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <form action={logoutAction}>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <PowerIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
