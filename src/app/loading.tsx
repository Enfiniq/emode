import Image from "next/image";
import loader from "../../public/loader.gif";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-background flex items-center justify-center">
      <div className="text-center">
        <Image src={loader} alt="Loading..." width={256} height={256} />
      </div>
    </div>
  );
}
