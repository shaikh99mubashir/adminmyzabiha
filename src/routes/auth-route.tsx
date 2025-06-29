import { jwtDecode } from "jwt-decode";
import React, { ReactNode } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";

export const ROLES = {
  user: "USER",
  super_admin: "SUPER_ADMIN",
  admin: "ADMIN",
  sub_admin: "SUB_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

interface UserAuthCheckProps {
  roles?: Role[] | "all";
  children: ReactNode;
}

interface JwtPayload {
  exp: number;
  email?: string;
  role?: Role;
  [key: string]: any;
}

const AuthRoute: React.FC<UserAuthCheckProps> = ({ roles = [], children }) => {
  const token = Cookies.get("jwt");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  let decoded: JwtPayload;

  try {
    decoded = jwtDecode<JwtPayload>(token);
  } catch (_error) {
    Cookies.remove("jwt");
    return <Navigate to="/signin" replace />;
  }

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    Cookies.remove("jwt");
    return <Navigate to="/signin" replace />;
  }

  const userRole = decoded.role;
  const allowedRoles: Role[] =
    typeof roles === "string" && roles.toLowerCase() === "all"
      ? Object.values(ROLES)
      : (roles as Role[]);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
