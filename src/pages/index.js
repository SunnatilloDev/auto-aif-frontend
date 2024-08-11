import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  let router = useRouter();
  useEffect(() => {
    router.push("/login");
  });
  return <main></main>;
}
