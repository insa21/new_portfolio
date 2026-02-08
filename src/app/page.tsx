import { Hero } from "@/components/home/hero";
import { TechStack } from "@/components/home/tech-stack";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TechStack />
      </main>
      <Footer />
    </>
  );
}
