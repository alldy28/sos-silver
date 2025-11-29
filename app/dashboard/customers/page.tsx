import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCustomersListAction } from "@/actions/admin-actions";
import { CustomerTable } from "./_components/CustomerTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login-customer");
  }

  const params = await searchParams;
  const query = params.q || "";

  const customers = await getCustomersListAction(query);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Data Pelanggan & Affiliate
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola semua pelanggan dan status program affiliate mereka.
          </p>
        </div>
        <div className="text-sm font-medium bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
          Total: {customers.length} User
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border dark:border-gray-700 overflow-hidden">
        <CustomerTable data={customers} />
      </div>
    </div>
  );
}
