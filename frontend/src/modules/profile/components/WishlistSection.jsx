import Card from '../components/Card.jsx'
import { products  } from '../../../data.js'
import { Link } from 'react-router-dom'


const WishlistSection = () => {

  return (
    <>
      <h2 className="font-italiana text-2xl text-dark mt-24 mb-10 flex justify-center">Mis Favoritos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <Card key={product.id} data={product} />
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <Link
          type="button"
          className="px-6 py-2 border border-primary2 text-primary2 rounded hover:bg-primary2 hover:text-white transition-colors text-center"
          to="/wishlist"
        >
          Ver más
        </Link>
      </div>

    </>
  )
}

export default WishlistSection