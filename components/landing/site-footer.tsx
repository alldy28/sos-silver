// components/landing/site-footer.tsx
import Image from "next/image";
import Link from "next/link";

/**
 * Komponen Footer (Server Component)
 */
export function SiteFooter() {
  return (
    <footer className="bg-slate-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logosos-baru.png"
                alt="Sossilver Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <div className="text-lg font-semibold text-slate-800">
                {" "}
                SoS Silver{" "}
              </div>
            </Link>
          </div>
          <nav className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Tentang Kami
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Kontak
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              FAQ
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-gray-300 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} sosilver.co.id. Hak Cipta
            Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
