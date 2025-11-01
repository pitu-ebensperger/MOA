import { useState } from "react";
import { Container } from "../../../../components/layout/Container.jsx";
import { Header } from "../../../../components/layout/Header.jsx";
import Button from "../../../../components/ui/Button.jsx";

const initialForm = {
  name: "",
  price: "",
  sku: "",
  stock: "",
  description: "",
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const NewProductPage = () => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : 0,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message ?? "No pudimos crear el producto.";
        throw new Error(message);
      }

      setForm(initialForm);
      setFeedback({ type: "success", message: "Producto creado correctamente." });
    } catch (error) {
      console.error("Error al crear el producto", error);
      setFeedback({
        type: "error",
        message: error?.message ?? "No pudimos crear el producto. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar producto"}
            </Button>
          </div>

          {feedback && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={`admin-form__feedback admin-form__feedback--${feedback.type}`}
            >
              {feedback.message}
            </p>
          )}
        </form>
      </Container>
    </main>
  );
};

export default NewProductPage;
