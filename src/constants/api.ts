const { VITE_NODE_ENV } = import.meta.env; // Use import.meta.env instead of process.env
const { hostname } = window.location;

const servers = {
  local: "http://localhost:3050",
  customDev: "",
  live: "",
  dummy: "",
};


let URL;

if (VITE_NODE_ENV === "production" && hostname.includes("react.customdev.solutions")) {
  URL = servers.customDev;
} else if (VITE_NODE_ENV === "production" && hostname.includes("realmoneydragon.io")) {
  URL = servers.live;
} else {
  URL = servers.local;
}
export const SOCKET_URL = URL;
export const UPLOADS_URL = `${URL}/`;
export const BASE_URL = `${URL}/v1`;