import PRODUCTS from "../model/productSchema.js";

function sortProducts(sort, tables) {
  let sortedProducts = [...tables];
  let sortStatusText = "Default";

  switch (sort) {
    case "latest":
      sortedProducts.sort((a, b) => b.timestamp - a.timestamp);
      sortStatusText = "latest";
      break;
    case "price-asc":
      sortedProducts.sort((a, b) => parseInt(a.price) - parseInt(b.price));
      sortStatusText = "Price- low to high";
      break;
    case "price-desc":
      sortedProducts.sort((a, b) => parseInt(b.price) - parseInt(a.price));
      sortStatusText = "Price- High to low";
      break;
    case "averageRating":
    //sortedProducts.sort((a, b) => b.averageRating - a.averageRating);
    //sortStatusText = "Average Rating";
    // break;
    default:
      sortedProducts.sort((a, b) => a.productId - b.productId);
      sortStatusText = "Default";
      break;
  }

  return { sortedProducts, sortStatusText };
}

export default sortProducts;
