import { notFound } from "next/navigation";
import { LogTable } from "./log-table";
import { PaginationControls } from "./pagination";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";
import { auth } from "@clerk/nextjs/server";

async function getTestLogs(code: string, page: number, userId: string) {
  const res = await fetch(
    `${SERVER_BASE_URL}/test/monitor?testId=${code}&userId=${userId}&page=${page}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch test logs");
  }
  return res.json();
}

export default async function MonitorPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { page?: string };
}) {
  const { userId } = await auth();
  const page = Number(searchParams.page) || 1;
  const {
    data: logs,
    title,
    pagination,
  } = await getTestLogs(params.code, page, userId as string);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <LogTable logs={logs} />
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
