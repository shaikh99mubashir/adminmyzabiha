// const { VITE_NODE_ENV } = import.meta.env; // Use import.meta.env instead of process.env
const { hostname } = window.location;

const servers = {
  local: "http://localhost:3050",  
  // local: "https://api.myzabiha.com",  
  live: "https://api.myzabiha.com",
  dummy: "",
};


let URL;

if (hostname.includes("myzabiha.com")) {
  URL = servers.live;
} else {
  URL = servers.local;
}
export const SOCKET_URL = URL;
export const UPLOADS_URL = `${URL}/`;
export const BASE_URL = `${URL}/v1`;