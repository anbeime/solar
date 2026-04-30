'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Project, BiddingItem, AwardItem, ChargerItem, OverviewStats, ProvinceStat } from '@/lib/types';
import { computeOverviewStats, computeProvinceStats } from '@/lib/data';

/**
 * 加载全部 JSON 数据的 Hook
 */
export function useSiteData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bidding, setBidding] = useState<BiddingItem[]>([]);
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [chargers, setChargers] = useState<ChargerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/projects.json').then(r => r.json()).catch(() => []),
      fetch('/data/bidding.json').then(r => r.json()).catch(() => []),
      fetch('/data/awards.json').then(r => r.json()).catch(() => []),
      fetch('/data/chargers.json').then(r => r.json()).catch(() => []),
    ]).then(([p, b, a, c]) => {
      setProjects(p);
      setBidding(b);
      setAwards(a);
      setChargers(c);
      setLoading(false);
    });
  }, []);

  const stats: OverviewStats = useMemo(
    () => computeOverviewStats(projects, bidding, awards, chargers),
    [projects, bidding, awards, chargers],
  );

  const provinceStats: ProvinceStat[] = useMemo(
    () => computeProvinceStats(projects),
    [projects],
  );

  const provinces = useMemo(() => {
    const s = new Set(projects.map(p => p.province).filter(Boolean));
    return ['全部', ...Array.from(s).sort()];
  }, [projects]);

  const types = useMemo(() => {
    const s = new Set(projects.map(p => p.type).filter(Boolean));
    return ['全部', ...Array.from(s)];
  }, [projects]);

  return {
    projects, bidding, awards, chargers,
    stats, provinceStats, provinces, types,
    loading,
  };
}
