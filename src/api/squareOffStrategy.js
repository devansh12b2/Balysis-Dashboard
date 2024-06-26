import { API_BASE_URL } from "./constants";

export const squareOffStrategy = async (
  token,
  strat_id,
  strat_name,
  shutdown,
  pin,
) => {
  const response = await fetch(`${API_BASE_URL}/trade/squareoff/strategy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      admin_pin: pin,
    },
    body: JSON.stringify({
      strat_name,
      strat_id,
      shutdown,
    }),
  });
  return response;
};
