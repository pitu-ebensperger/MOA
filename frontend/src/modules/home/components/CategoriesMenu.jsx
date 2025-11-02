export const CategoriesMenu = ({ categories = [], onSelect }) => (
  <div>
    <h3>Categorías</h3>
    <ul>
      {categories.map((category) => (
        <li key={category.id}>
          <button type="button" onClick={() => onSelect?.(category.id)}>
            {category.label ?? category.name}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
