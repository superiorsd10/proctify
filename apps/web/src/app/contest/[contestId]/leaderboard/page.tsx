import { notFound } from "next/navigation";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";
import { LogTable } from "./log-table";
import { PaginationControls } from "./pagination";

async function getTestLogs(code: string, page: number) {
  const res = await fetch(
    `${SERVER_BASE_URL}/contest/leaderboard/get?contestId=${code}&page=${page}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch test logs");
  }
  return res.json();
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: { contestId: string };
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const {
    data: logs,
    pagination,
  } = await getTestLogs(params.contestId, page);

  return (
    <div className="container mx-auto py-10">
      <LogTable logs={logs} />
      <PaginationControls
        currentPage={pagination.pageNumber}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
