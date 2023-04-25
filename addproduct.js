const addProductForm = document.getElementById("add-product-form");
addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const productName = document.getElementById("product-name").value;
  const productDescription = document.getElementById("product-description").value;
  const productPrice = document.getElementById("product-price").value;

  const newProduct = {
    name: productName,
    description: productDescription,
    price: productPrice,
  };
});
