// import { useContext } from "react";
// import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();

// const handleViewDetail = (id) => {
//     navigate(`/products/${id}`)
// }

const Card = ({ data }) => {
  const { name, price, img } = data;

  return (
    <div className="relative bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-sm group">
      <img
        src={img}
        alt={name}
        className="w-full h-70 object-cover"
      />

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className="text-lg font-semibold mb-1 !text-white drop-shadow-md">{name}</h3>
        <p className="text-white font-medium text-base">${price.toLocaleString('es-CL')}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors">
          Agregar al carro
        </button>
      </div>
    </div>
  );
};

export default Card;