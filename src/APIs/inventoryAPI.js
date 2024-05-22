const URL = "http://localhost:3000";

export const getInventory = () => {
  return fetch(`${URL}/inventory`, {}).then((res) => res.json());
};
