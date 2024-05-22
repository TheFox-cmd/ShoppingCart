const URL = "http://localhost:3000";

export const getInventory = () => {
  // define your method to get inventory data
  return fetch(`${URL}/inventory`, {}).then((res) => res.json());
};