import Card from '../components/Card.jsx'
import { products  } from '../../../data.js'

const OrderSection = () => {
  return (
    <>
      <h2 className="font-italiana text-2xl text-dark mt-24 mb-10 flex justify-center">Mis Compras</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <Card key={product.id} data={product} />
        ))}
      </div>
    </>

  )
}

export default OrderSection