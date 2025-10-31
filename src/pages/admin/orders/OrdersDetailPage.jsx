import { useParams } from "react-router-dom";
import { Container } from "../../../../shared/components/layout/Container.jsx";
import { Header } from "../../../../shared/components/layout/Header.jsx";

const OrdersDetailPage = () => {
  const { orderId } = useParams();

  return (
    <main className="admin-order-detail">
      <Header title={`Orden ${orderId ?? ""}`} subtitle="Detalle y línea de productos." />

      <Container>
        <section className="admin-card">
          <h2>Resumen</h2>
          <dl>
            <div className="admin-card__row">
              <dt>Cliente</dt>
              <dd>Cargando...</dd>
            </div>
            <div className="admin-card__row">
              <dt>Total</dt>
              <dd>$0</dd>
            </div>
            <div className="admin-card__row">
              <dt>Estado</dt>
              <dd>En preparación</dd>
            </div>
          </dl>
        </section>
      </Container>
    </main>
  );
};

export default OrdersDetailPage;
