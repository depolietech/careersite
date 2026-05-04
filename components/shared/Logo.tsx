import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="shrink-0">
      <Image
        src="/images/logo.png"
        alt="Equalhires"
        width={160}
        height={48}
        className="h-10 w-auto object-contain"
        priority
      />
    </Link>
  );
}
