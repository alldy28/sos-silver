import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * [FILE BARU]
 * Halaman untuk /myaccount/profile
 */
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CUSTOMER) {
    redirect("/login-customer");
  }

  // Ambil data user lengkap dari DB (bukan hanya sesi)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login-customer");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Profil Saya
      </h2>
      <div className="space-y-4">
        {/* Nanti kita akan ganti ini dengan Client Component (Form) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Lengkap
          </label>
          <input
            type="text"
            readOnly
            value={user.name || ""}
            className="mt-1 block w-full max-w-lg rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            readOnly
            value={user.email}
            className="mt-1 block w-full max-w-lg rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email tidak dapat diubah.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ganti Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 block w-full max-w-lg rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled // Dinonaktifkan untuk saat ini
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
