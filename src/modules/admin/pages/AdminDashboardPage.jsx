import { UserCog } from 'lucide-react';


export default function AdminDashboardPage() {
    return (
        <div className="admin-dashboard-page max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center mb-8">
                <UserCog className="icon-admin-dashboard size-8 mr-4 text-primary-600" />
                <h1 className="text-3xl font-semibold">Panel de Administración</h1>
            </div>
            <p className="text-lg text-gray-700">
                Bienvenido al panel de administración. Aquí puedes gestionar usuarios, productos, pedidos y más.
            </p>
        </div>
    );
}