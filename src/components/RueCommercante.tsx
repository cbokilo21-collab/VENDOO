import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import FacadeBoutique from './FacadeBoutique';
import { Case } from '../types';

interface RueCommercanteProps {
  cases: Case[];
}

const RueCommercante: React.FC<RueCommercanteProps> = ({ cases }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cases.map((caseItem) => (
          <View key={caseItem.id} style={styles.caseContainer}>
            <FacadeBoutique
              niveau={caseItem.niveau}
              couleurPrincipale={caseItem.couleurPrincipale}
              couleurSecondaire={caseItem.couleurSecondaire}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  caseContainer: {
    marginRight: 15,
  },
});

export default RueCommercante;
