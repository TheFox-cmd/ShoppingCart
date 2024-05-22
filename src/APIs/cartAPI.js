const URL = "http://localhost:3000";
export const getCart = () => {
  return fetch(`${URL}/cart`, {}).then((res) => res.json()); 
};

export const addToCart = (inventoryItem) => {
  return fetch(`${URL}/cart`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(inventoryItem)
  }).then((res) => res.json())
};

export const updateCart = (id, item) => {
  return fetch(`${URL}/cart/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(item)
  }).then((res) => res.json())
};

export const deleteFromCart = (id) => {
  return fetch(`${URL}/cart/${id}`,{
    method: "DELETE"
  }).then((res) => res.json())
};

export const checkout = () => {
  return getCart().then((data) =>
    Promise.all(data.map((item) => deleteFromCart(item.id)))
  );
}