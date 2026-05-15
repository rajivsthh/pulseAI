import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { TrendingFeed } from "@/components/site/TrendingFeed";
import { ControlRoom } from "@/components/site/ControlRoom";
import { LiveDemo } from "@/components/site/LiveDemo";
import { AISearch } from "@/components/site/AISearch";
import { Pipeline } from "@/components/site/Pipeline";
import { Agents } from "@/components/site/Agents";
import { Studio } from "@/components/site/Studio";
import { Trust } from "@/components/site/Trust";
import { Analytics } from "@/components/site/Analytics";
import { Reels } from "@/components/site/Reels";
import { CTA, Footer } from "@/components/site/CTA";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-iris/40">
      <Navbar />
      <Hero />
      <TrendingFeed />
      <ControlRoom />
      <LiveDemo />
      <Pipeline />
      <Agents />
      <AISearch />
      <Studio />
      <Trust />
      <Analytics />
      <Reels />
      <CTA />
      <Footer />
    </main>
  );
}
