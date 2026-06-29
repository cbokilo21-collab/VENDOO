import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DomainService from '../services/domainService';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');

const C = {
  navy: '#FF6B35',
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
};

type RootStackParamList = {
  CountrySelection: { country?: string; city?: string };
  QuartierScreen: { country: string; city: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

const CountrySelectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const countries = DomainService.getAllPays();
  const filteredCountries = countries.filter(c =>
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.villes.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity(null);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  const handleContinue = () => {
    if (selectedCountry && selectedCity) {
      navigation.navigate('QuartierScreen', {
        country: selectedCountry,
        city: selectedCity,
      });
    }
  };

  const selectedCountryData = countries.find(c => c.nom === selectedCountry);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Choisissez votre pays</Text>
        <Text style={s.headerSub}>Sélectionnez votre localisation pour accéder à la marketplace</Text>
      </View>

      <View style={s.searchContainer}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
          <Circle cx="11" cy="11" r="8"/>
          <Path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </Svg>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher un pays ou une ville..."
          placeholderTextColor={C.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {filteredCountries.map(country => (
          <TouchableOpacity
            key={country.code}
            style={[s.countryCard, selectedCountry === country.nom && s.countryCardSelected]}
            onPress={() => handleCountrySelect(country.nom)}
            activeOpacity={0.7}
          >
            <View style={s.countryLeft}>
              <Text style={s.countryFlag}>{country.flag}</Text>
              <View>
                <Text style={[s.countryName, selectedCountry === country.nom && s.countryNameSelected]}>
                  {country.nom}
                </Text>
                <Text style={s.countryCities}>{country.villes.length} villes disponibles</Text>
              </View>
            </View>
            {selectedCountry === country.nom && (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth={2}>
                <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCountry && (
        <View style={s.citiesModal}>
          <View style={s.citiesHeader}>
            <Text style={s.citiesTitle}>{selectedCountryData?.flag} {selectedCountry}</Text>
            <TouchableOpacity onPress={() => setSelectedCountry(null)}>
              <Text style={s.citiesClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.citiesList} showsVerticalScrollIndicator={false}>
            {selectedCountryData?.villes.map(city => (
              <TouchableOpacity
                key={city}
                style={[s.cityItem, selectedCity === city && s.cityItemSelected]}
                onPress={() => handleCitySelect(city)}
                activeOpacity={0.7}
              >
                <Text style={[s.cityName, selectedCity === city && s.cityNameSelected]}>{city}</Text>
                {selectedCity === city && (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth={2}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[s.continueBtn, (!selectedCity) && s.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selectedCity}
          >
            <Text style={s.continueBtnText}>Continuer vers la marketplace</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: C.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
  },
  clearBtn: {
    fontSize: 16,
    color: C.muted,
    paddingHorizontal: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  countryCardSelected: {
    borderColor: C.navy,
    backgroundColor: C.navy + '08',
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
  },
  countryNameSelected: {
    color: C.navy,
  },
  countryCities: {
    fontSize: 13,
    color: C.textLight,
    marginTop: 2,
  },
  citiesModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: '70%',
  },
  citiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  citiesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
  },
  citiesClose: {
    fontSize: 24,
    color: C.textLight,
  },
  citiesList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    maxHeight: 300,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cityItemSelected: {
    backgroundColor: C.navy + '08',
  },
  cityName: {
    fontSize: 15,
    color: C.textDark,
  },
  cityNameSelected: {
    color: C.navy,
    fontWeight: '600',
  },
  continueBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: C.navy,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: C.muted,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});

export default CountrySelectionScreen;
