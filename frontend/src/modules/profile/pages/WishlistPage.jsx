import Card from  '../components/Card.jsx';
import { products  } from '../../../data.js'


const WishlistPage = () => (
  <main>
    <h1 className="font-italiana text-4xl text-dark mt-24 mb-10 flex justify-center">Wishlist</h1>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
  {products.map((product) => (
    <Card key={product.id} data={product} />
  ))}
</div>
  </main>
);