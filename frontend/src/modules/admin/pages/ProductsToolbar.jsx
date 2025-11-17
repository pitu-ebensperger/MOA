import React from "react";
import PropTypes from "prop-types";
import {
  TableToolbar,
  TableSearch,
  FilterTags,
  ToolbarSpacer,
  QuickFilterPill,
  ColumnsMenuButton,
} from "../../../components/data-display/TableToolbar.jsx";

export default function ProductsToolbar({
  table,
  search,
  onSearchChange,
  onlyLowStock,
  onToggleLowStock,
  activeTags,
  onRemoveTag,
}) {
  return (
    <TableToolbar>
      <TableSearch
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por nombre, SKU…"
      />
      <ToolbarSpacer />
      <QuickFilterPill active={onlyLowStock} onClick={onToggleLowStock}>
        Stock crítico
      </QuickFilterPill>
      <ToolbarSpacer />
      <FilterTags tags={activeTags} onRemove={onRemoveTag} />
      <div className="ml-auto flex items-center gap-2">
        <ColumnsMenuButton table={table} />
      </div>
    </TableToolbar>
  );
}

ProductsToolbar.propTypes = {
  table: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onlyLowStock: PropTypes.bool.isRequired,
  onToggleLowStock: PropTypes.func.isRequired,
  activeTags: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};
