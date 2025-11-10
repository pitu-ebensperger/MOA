import Button from "../../../components/ui/Button.jsx";
import { useCartContext } from "../context/cartContext.jsx";

const safePreventDefault = (event) => {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
};

const AddToCartButton = ({
  component,
  product,
  quantity = 1,
  children = "Agregar al carrito",
  openDrawerOnAdd = true,
  onAdded,
  onClick,
  ...rest
}) => {
  const { addToCart, openDrawer } = useCartContext();
  const RenderComponent = component ?? Button;

  const handleClick = (event) => {
    safePreventDefault(event);
    if (!product) return;
    addToCart(product, { quantity });
    if (openDrawerOnAdd) {
      openDrawer();
    }
    if (typeof onAdded === "function") {
      onAdded(product);
    }
    if (typeof onClick === "function") {
      onClick(event);
    }
  };

  return (
    <RenderComponent type="button" onClick={handleClick} {...rest}>
      {children}
    </RenderComponent>
  );
};

export default AddToCartButton;
