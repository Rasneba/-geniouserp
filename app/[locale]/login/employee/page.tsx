"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );
}
