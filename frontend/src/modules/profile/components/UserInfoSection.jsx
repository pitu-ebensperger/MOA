import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'

const UserInfoSection = () => {

  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false)

  console.log('----> user', user);

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = () => {
    setIsEditing(false)
  }

  return (
    <section >
        <h2 className="font-italiana text-4xl text-dark mt-24 mb-10 flex justify-center">
          Mi Perfil
        </h2>
        <div className="flex justify-center gap-4">
          <div className="w-1/3 profile-image">
            <i className="fa-solid fa-user text-8xl"></i>
          </div>
          <div className="w-1/3">
            <h2 className="text-2xl mb-4">@Usuario</h2>

            <form className="flex flex-col gap-2">

              <input
              type="text"
              disabled={!isEditing}
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary2"
              placeholder="Nombre"
              />

              <input
                type="email"
                disabled={!isEditing}
                className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary2"
                placeholder="correo@ejemplo.com"
              />

              <input
                type="tel"
                disabled={!isEditing}
                className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary2"
                placeholder="+56 9 1234 5678"
              />

              <input
                type="text"
                disabled={!isEditing}
                className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary2"
                placeholder="Tu dirección"
              />

              <div className="flex justify-between gap-2 mt-4">
                <Link
                  type="button"
                  className="w-1/2 px-4 py-2 border border-primary2 text-primary2 rounded hover:bg-primary2 hover:text-white transition-colors text-center"
                  onClick={handleEditClick}
                >
                Editar
                </Link>
                <Link
                  type="button"
                  className="w-1/2 px-4 py-2 border border-primary2 text-primary2 rounded hover:bg-primary2 hover:text-white transition-colors text-center"
                  onClick={handleSaveClick}
                  disabled={!isEditing}
                >
                Guardar
                </Link>

            </div>

            </form>
          </div>
          </div>
    </section>
  )
}

export default UserInfoSection