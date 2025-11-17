import React from "react";
import PropTypes from "prop-types";
import {
  TableToolbar,
  FilterTags,
  QuickFilterPill,
} from "../../../components/data-display/TableToolbar.jsx";

export default function ProductsToolbar({
  onlyLowStock,
  onToggleLowStock,
  activeTags,
  onRemoveTag,
}) {
  return (
    <TableToolbar className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <QuickFilterPill active={onlyLowStock} onClick={onToggleLowStock}>
          Stock crítico
        </QuickFilterPill>
        <FilterTags tags={activeTags} onRemove={onRemoveTag} />
      </div>
    </TableToolbar>
  );
}

ProductsToolbar.propTypes = {
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
