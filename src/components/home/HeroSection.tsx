'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="bg-grid relative overflow-hidden py-32">
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.08)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10"
        >
          <Link
            href="/strategies"
            className="inline-block rounded-lg bg-accent-profit px-8 py-3 text-sm font-semibold text-bg-primary transition-shadow hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
          >
            {t('cta')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
