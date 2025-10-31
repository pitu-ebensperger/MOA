import { Container } from "../../../shared/components/layout/Container.jsx";
import { Header } from "../../../shared/components/layout/Header.jsx";

const METRICS = [
  { id: "sales", label: "Ventas del mes", value: "$4.250.000" },
  { id: "orders", label: "Órdenes", value: "128" },
  { id: "avgValue", label: "Ticket promedio", value: "$33.200" },
];

const AdminDashboardPage = () => (
  <main className="admin-dashboard">
    <Header
      title="Panel de administración"
      subtitle="Resumen de ventas, órdenes y desempeño general."
    />

    <Container>
      <section className="admin-dashboard__metrics">
        {METRICS.map((metric) => (
          <article key={metric.id} className="admin-dashboard__metric">
            <h3>{metric.label}</h3>
            <p>{metric.value}</p>
          </article>
        ))}
      </section>
    </Container>
  </main>
);

export default AdminDashboardPage;
