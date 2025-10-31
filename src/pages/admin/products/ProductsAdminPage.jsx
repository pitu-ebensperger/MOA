import { Link } from "react-router-dom";
import { Container } from "../../../../shared/components/layout/Container.jsx";
import { Header } from "../../../../shared/components/layout/Header.jsx";
import { Button } from "../../../../shared/components/ui/Button.jsx";

const mockProducts = [
  { id: "p-1", name: "Blend Espresso", status: "Publicado", stock: 34 },
  { id: "p-2", name: "Filtrado Etíope", status: "Borrador", stock: 12 },
];

const ProductsAdminPage = () => (
  <main className="admin-products">
    <Header
      title="Productos"
      subtitle="Gestiona tu catálogo, edita precios y controla el stock."
      actions={
        <Button as={Link} to="/admin/products/new" variant="secondary">
          Nuevo producto
        </Button>
      }
    />

    <Container>
      <section className="admin-table">
        <header className="admin-table__header">
          <h2>Catálogo</h2>
          <p>{mockProducts.length} productos</p>
        </header>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.status}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Container>
  </main>
);

export default ProductsAdminPage;
