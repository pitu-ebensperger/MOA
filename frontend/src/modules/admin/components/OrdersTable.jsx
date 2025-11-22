import PropTypes from "prop-types"
import { TanstackDataTable } from "@/components/data-display/DataTable.jsx"
import { Pagination } from "@/components/ui/Pagination.jsx"

export function OrdersTable({
  data,
  columns,
  page,
  totalPages,
  total,
  onPageChange,
}) {
  return (
    <div className="mt-4">
      <TanstackDataTable data={data} columns={columns} />

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={typeof total === 'number' ? total : data.length}
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
  total: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};
