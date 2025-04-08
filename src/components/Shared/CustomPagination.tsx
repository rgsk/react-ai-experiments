import { useCallback, useEffect, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
const TRIPLE_DOTS = "triple-dots" as const;
interface ICustomPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  total: number;
  perPage: number;
}
const CustomPagination: React.FC<ICustomPaginationProps> = ({
  currentPage,
  setCurrentPage,
  total,
  perPage,
}) => {
  const lowerLimit = useMemo(
    () => (currentPage - 1) * perPage + 1,
    [currentPage, perPage]
  );
  const upperLimit = useMemo(
    () => Math.min(lowerLimit + perPage - 1, total),
    [lowerLimit, perPage, total]
  );
  const numberOfTotalPages = useMemo(() => {
    return Math.ceil(total / perPage);
  }, [perPage, total]);

  const { prevPageDisabled, nextPageDisabled } = useMemo(() => {
    return {
      prevPageDisabled: currentPage === 1,
      nextPageDisabled: currentPage === numberOfTotalPages,
    };
  }, [currentPage, numberOfTotalPages]);
  const goToPrevPage = useCallback(() => {
    if (!prevPageDisabled) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, prevPageDisabled, setCurrentPage]);
  const goToNextPage = useCallback(() => {
    if (!nextPageDisabled) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, nextPageDisabled, setCurrentPage]);

  const pagesToShow = useMemo(() => {
    if (numberOfTotalPages > 7) {
      return currentPage <= 4
        ? [1, 2, 3, 4, 5, TRIPLE_DOTS, numberOfTotalPages]
        : currentPage > numberOfTotalPages - 4
        ? [
            1,
            TRIPLE_DOTS,
            numberOfTotalPages - 4,
            numberOfTotalPages - 3,
            numberOfTotalPages - 2,
            numberOfTotalPages - 1,
            numberOfTotalPages,
          ]
        : [
            1,
            TRIPLE_DOTS,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            TRIPLE_DOTS,
            numberOfTotalPages,
          ];
    } else {
      const result = Array(numberOfTotalPages)
        .fill(0)
        .map((v, i) => i + 1);
      return result;
    }
  }, [numberOfTotalPages, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  return (
    <div>
      <div className="flex justify-center">
        <div>
          {total === 0 ? (
            <p>
              <span>{0}</span> results
            </p>
          ) : (
            <p>
              Showing <span>{lowerLimit}</span> to <span>{upperLimit}</span> of{" "}
              <span>{total}</span> results
            </p>
          )}
        </div>
      </div>
      <div className="h-4"></div>

      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={goToPrevPage}
                isActive={!prevPageDisabled}
              />
            </PaginationItem>
            {pagesToShow.map((pageNumber, i) => {
              return (
                <PaginationItem key={i}>
                  {pageNumber === TRIPLE_DOTS ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => {
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={goToNextPage}
                isActive={!nextPageDisabled}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
export default CustomPagination;
