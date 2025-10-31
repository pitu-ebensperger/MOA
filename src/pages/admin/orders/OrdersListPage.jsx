import { Link } from "react-router-dom";
import { Container } from "../../../../shared/components/layout/Container.jsx";
import { Header } from "../../../../shared/components/layout/Header.jsx";

const mockOrders = [
  { id: "ord-101", customer: "Ana R.", total: "$42.500", status: "En preparación" },
  { id: "ord-102", customer: "Luis M.", total: "$28.900", status: "Despachado" },
];

const OrdersListPage = () => (
  <main className="admin-orders">
    <Header title="Órdenes" subtitle="Revisa el estado de las órdenes recientes." />

    <Container>
      <section className="admin-table">
        <table>
          <thead>
            <tr>
              <th># Orden</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.total}</td>
                <td>{order.status}</td>
                <td>
                  <Link to={`/admin/orders/${order.id}`}>Ver detalle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Container>
  </main>
);

export default OrdersListPage;
