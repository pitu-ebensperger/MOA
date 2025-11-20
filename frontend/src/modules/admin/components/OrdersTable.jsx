import PropTypes from "prop-types"
import { TanstackDataTable } from "@/components/data-display/DataTable.jsx"
import { Pagination } from "@/components/ui/Pagination.jsx"

export function OrdersTable({
  data,
  columns,
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="mt-4">
      <TanstackDataTable data={data} columns={columns} />

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={data.length}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

OrdersTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
