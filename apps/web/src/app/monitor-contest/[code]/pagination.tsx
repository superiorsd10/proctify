"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/ui/pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function PaginationControls({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) router.push(createPageURL(currentPage - 1));
            }}
            size="default"
          />
        </PaginationItem>
        {[...Array(totalPages)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              href={createPageURL(i + 1)}
              onClick={(e) => {
                e.preventDefault();
                router.push(createPageURL(i + 1));
              }}
              isActive={currentPage === i + 1}
              size="default"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages)
                router.push(createPageURL(currentPage + 1));
            }}
            size="default"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
