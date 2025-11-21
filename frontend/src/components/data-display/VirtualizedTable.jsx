import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PropTypes from 'prop-types';

/**Tabla con filas virtualizadas
 * Renderiza solo las filas visibles en pantalla
 * @param {Array} data - Array de datos para la tabla
 * @param {Array} columns - Definición de columnas
 * @param {Function} renderRow - Función para renderizar cada fila
 * @param {number} rowHeight - Altura de cada fila en px (default: 60)
 * @param {number} overscan - Filas extra a renderizar (default: 5)
 * @param {string} className - Clases CSS adicionales
 */
export function VirtualizedTable({
  data = [],
  columns = [],
  renderRow,
  rowHeight = 60,
  overscan = 5,
  className = '',
  emptyMessage = 'No hay datos para mostrar',
}) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="grid" style={{ 
          gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
          minWidth: 'fit-content',
        }}>
          {columns.map((column, index) => (
            <div
              key={column.key || index}
              className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 ${
                column.headerClassName || ''
              }`}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-auto bg-white"
        style={{
          height: '600px', // Ajustable según necesidad
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = data[virtualRow.index];
            
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                {renderRow(item, virtualRow.index)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer con info */}
      <div className="bg-neutral-50 border-t border-neutral-200 px-4 py-2">
        <p className="text-xs text-neutral-500">
          Mostrando {virtualItems.length} de {data.length} filas
        </p>
      </div>
    </div>
  );
}

VirtualizedTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      header: PropTypes.node.isRequired,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
    })
  ).isRequired,
  renderRow: PropTypes.func.isRequired,
  rowHeight: PropTypes.number,
  overscan: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default VirtualizedTable;
