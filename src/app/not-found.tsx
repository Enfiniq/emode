"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Image from "next/image";
import loader from "../../public/loader.gif";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="flex flex-row justify-center items-center">
          <Image src={loader} alt="Loading..." width={96} height={96} />
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Transmission Lost</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The Emolien message you&apos;re looking for has drifted into deep
          space. Let&apos;s navigate back to known coordinates.
        </p>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Play
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
