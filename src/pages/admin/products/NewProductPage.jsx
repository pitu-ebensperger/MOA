import { useState } from "react";
import { Container } from "../../../../shared/components/layout/Container.jsx";
import { Header } from "../../../../shared/components/layout/Header.jsx";
import { Button } from "../../../../shared/components/ui/Button.jsx";

const initialForm = {
  name: "",
  price: "",
  sku: "",
  stock: "",
  description: "",
};

const NewProductPage = () => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: conectar con mutation real
    console.log("Producto enviado", form);
  };

  return (
    <main className="admin-new-product">
      <Header title="Nuevo producto" subtitle="Completa la información para agregar un producto." />

      <Container>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} />
          </label>
          <label>
            Precio
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="100"
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
            />
          </label>
          <label>
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <div className="admin-form__actions">
            <Button variant="secondary" type="button" onClick={() => setForm(initialForm)}>
              Limpiar
            </Button>
            <Button type="submit">Guardar producto</Button>
          </div>
        </form>
      </Container>
    </main>
  );
};

export default NewProductPage;
