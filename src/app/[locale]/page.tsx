import { HeroSection } from '@/components/home/HeroSection';
import { MetricCards } from '@/components/home/MetricCards';
import { RecentStrategies } from '@/components/home/RecentStrategies';

export default function Home() {
  return (
    <>
      <HeroSection />
      <MetricCards />
      <RecentStrategies />
    </>
  );
}
