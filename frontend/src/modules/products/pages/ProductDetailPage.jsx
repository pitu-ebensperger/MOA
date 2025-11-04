import { useParams } from "react-router-dom";
import { getProductById } from "../../../utils/mockdata.js";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const product = id ? getProductById(id) : null;

  return (
    <h1>Product Detail</h1>
  );
};
