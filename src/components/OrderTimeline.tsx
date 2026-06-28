import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { T } from '../theme';
import { OrderStatus, ORDER_STATUS_TIMELINE, ORDER_STATUS_META } from '../services/orderService';

interface Props {
  currentStatus: OrderStatus;
}

const ICONS: Record<string, string> = {
  pending:    'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  paid:       'M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  processing: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4',
  shipped:    'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM19.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  delivered:  'M20 6L9 17l-5-5',
};

const StepIcon: React.FC<{ pathD: string; active: boolean; done: boolean }> = ({ pathD, active, done }) => {
  const color = done || active ? T.white : T.muted;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={pathD} />
    </Svg>
  );
};

const OrderTimeline: React.FC<Props> = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';
  const steps = ORDER_STATUS_TIMELINE;
  const currentIdx = steps.indexOf(currentStatus as any);

  if (isCancelled) {
    return (
      <View style={s.root}>
        <View style={[s.cancelBadge]}>
          <Text style={s.cancelText}>
            {currentStatus === 'refunded' ? '🔄 Commande remboursée' : '❌ Commande annulée'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {steps.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const meta   = ORDER_STATUS_META[step];
        const iconPath = ICONS[step] || ICONS.pending;
        const isLast = idx === steps.length - 1;

        return (
          <View key={step} style={s.stepRow}>
            {/* Circle + connector */}
            <View style={s.track}>
              <View style={[
                s.dot,
                done   && { backgroundColor: T.success },
                active && { backgroundColor: meta.color },
                !done && !active && { backgroundColor: T.page, borderWidth: 2, borderColor: T.border },
              ]}>
                {(done || active) && (
                  <StepIcon pathD={done ? ICONS.delivered : iconPath} active={active} done={done} />
                )}
              </View>
              {!isLast && (
                <View style={[s.line, done && { backgroundColor: T.success }]} />
              )}
            </View>

            {/* Label */}
            <View style={s.labelWrap}>
              <Text style={[
                s.stepLabel,
                active && { color: meta.color, fontWeight: '800' },
                done   && { color: T.success, fontWeight: '700' },
                !done && !active && { color: T.muted },
              ]}>
                {meta.label}
              </Text>
              {active && (
                <View style={[s.activePill, { backgroundColor: meta.soft }]}>
                  <Text style={[s.activePillText, { color: meta.color }]}>En cours</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const DOT = 32;
const s = StyleSheet.create({
  root:       { gap: 0 },
  stepRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14, minHeight: DOT + 8 },
  track:      { alignItems: 'center', width: DOT },
  dot:        { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: 'center', justifyContent: 'center' },
  line:       { width: 2, flex: 1, minHeight: 20, backgroundColor: T.border, marginVertical: 2 },
  labelWrap:  { flex: 1, paddingTop: 6, gap: 4, paddingBottom: 12 },
  stepLabel:  { fontSize: 14, fontWeight: '600' },
  activePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
  activePillText: { fontSize: 11, fontWeight: '700' },
  cancelBadge:{ backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#DC2626', textAlign: 'center' },
});

export default OrderTimeline;
