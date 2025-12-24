"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/resources";
import { Flex, Spinner } from "@once-ui-system/core";
import NotFound from "@/app/not-found";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!pathname) {
      setIsRouteEnabled(false);
      setLoading(false);
      return;
    }

    // 1️⃣ Exact static routes
    if (pathname in routes) {
      setIsRouteEnabled(routes[pathname as keyof typeof routes]);
      setLoading(false);
      return;
    }

    // 2️⃣ Dynamic route prefixes
    const dynamicRoutes = [
      "/blog",
      "/work",
      "/studio",
    ] as const;

    for (const route of dynamicRoutes) {
      if (pathname.startsWith(route) && routes[route]) {
        setIsRouteEnabled(true);
        setLoading(false);
        return;
      }
    }

    // 3️⃣ Not allowed
    setIsRouteEnabled(false);
    setLoading(false);
  }, [pathname]);

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export { RouteGuard };
