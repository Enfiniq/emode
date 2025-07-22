import React from "react";

interface MaxWidthWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function MaxWidthWrapper({
  children,
  className = "",
}: MaxWidthWrapperProps) {
  return <div className={`max-w-7xl mx-auto ${className}`}>{children}</div>;
}
