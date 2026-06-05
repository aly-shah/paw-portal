import React from 'react';
import { Flame, Gift, Trophy, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Avatar, useToast } from '../ui';
import { usePawData } from '../../contexts/PawDataContext';
import { Reward, LeaderboardEntry } from '../../types';

const REWARDS: Reward[] = [
  { id: 'r1', title: '10% off grooming', description: 'At any partner groomer', costPoints: 500, icon: '✂️', vendorName: 'PawSpa' },
  { id: 'r2', title: 'Free bag of treats', description: 'Premium training treats', costPoints: 800, icon: '🦴', vendorName: 'NutriPet' },
  { id: 'r3', title: 'Rs 1,000 marketplace credit', description: 'Spend on anything', costPoints: 1500, icon: '🛍️' },
  { id: 'r4', title: 'Free telehealth consult', description: '15-min video vet call', costPoints: 2000, icon: '🩺', vendorName: 'PawCare' },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, petName: 'Rocky', petImage: 'https://picsum.photos/id/1062/100/100', ownerName: 'Bilal R.', points: 4120 },
  { rank: 2, petName: 'Barnaby', petImage: 'https://picsum.photos/id/237/100/100', ownerName: 'Jane Doe', points: 2450, isCurrentUser: true },
  { rank: 3, petName: 'Coco', petImage: 'https://picsum.photos/id/1025/100/100', ownerName: 'Zara M.', points: 1980 },
  { rank: 4, petName: 'Luna', petImage: 'https://picsum.photos/id/1074/100/100', ownerName: 'Ali Khan', points: 1540 },
];

const RewardsCenter: React.FC = () => {
  const { pawPoints, streak, badges, ledger, redeemReward } = usePawData();
  const { toast } = useToast();

  const redeem = (r: Reward) => {
    if (redeemReward(r)) toast(`Redeemed: ${r.title} 🎉`, 'success');
    else toast(`Not enough points — need ${r.costPoints - pawPoints} more`, 'error');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-display font-semibold text-slate-800">Paw Points</h1>
        <p className="text-slate-500 mt-1">Earn points for walks, checkups & care — redeem for real perks.</p>
      </header>

      {/* Balance + streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Your balance</p>
          <p className="text-5xl font-black font-display mt-1 animate-count-up">{pawPoints.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-1">Paw Points</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center">
          <Flame className="text-accent-500" size={32} />
          <p className="text-3xl font-black text-slate-800 mt-1">{streak}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">day streak</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rewards catalog */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Gift size={18} className="text-secondary-500" /> Rewards catalog
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REWARDS.map((r) => {
                const affordable = pawPoints >= r.costPoints;
                return (
                  <div key={r.id} className="rounded-xl border border-slate-100 p-4 flex flex-col">
                    <div className="text-3xl mb-2">{r.icon}</div>
                    <p className="font-bold text-slate-800">{r.title}</p>
                    <p className="text-sm text-slate-500 flex-1">{r.description}</p>
                    {r.vendorName && <p className="text-xs text-slate-400 mt-1">by {r.vendorName}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge tone="primary">{r.costPoints.toLocaleString()} pts</Badge>
                      <Button size="sm" variant={affordable ? 'primary' : 'ghost'} disabled={!affordable} onClick={() => redeem(r)}>
                        {affordable ? 'Redeem' : <><Lock size={12} /> Locked</>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Badges */}
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-accent-500" /> Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {badges.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl border p-3 text-center ${b.earned ? 'border-primary-200 bg-primary-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                  title={b.description}
                >
                  <div className="text-3xl">{b.earned ? b.icon : '🔒'}</div>
                  <p className="text-xs font-bold text-slate-700 mt-1 leading-tight">{b.name}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard + activity */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-accent-500" /> Neighbourhood leaderboard
            </h2>
            <div className="space-y-2">
              {LEADERBOARD.map((e) => (
                <div
                  key={e.rank}
                  className={`flex items-center gap-3 rounded-xl p-2 ${e.isCurrentUser ? 'bg-primary-50 ring-1 ring-primary-200' : ''}`}
                >
                  <span className={`w-6 text-center font-black ${e.rank <= 3 ? 'text-accent-500' : 'text-slate-400'}`}>{e.rank}</span>
                  <Avatar src={e.petImage} alt={e.petName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{e.petName} {e.isCurrentUser && '(you)'}</p>
                    <p className="text-xs text-slate-400 truncate">{e.ownerName}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-600">{e.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-3">Recent activity</h2>
            <div className="space-y-2">
              {ledger.slice(0, 6).map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 truncate pr-2">{l.label}</span>
                  <span className={`font-bold shrink-0 ${l.delta >= 0 ? 'text-success' : 'text-error'}`}>
                    {l.delta >= 0 ? '+' : ''}{l.delta}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RewardsCenter;
