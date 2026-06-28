import React from 'react';
import { Svg, Rect, Path, Circle, Ellipse, Line, Text as SvgText } from 'react-native-svg';
import { NiveauFacade } from '../types';

interface FacadeBoutiqueProps {
  niveau: NiveauFacade;
  couleurPrincipale: string;
  couleurSecondaire: string;
  width?: number;
  height?: number;
}

const FacadeBoutique: React.FC<FacadeBoutiqueProps> = ({
  niveau,
  couleurPrincipale,
  couleurSecondaire,
  width = 120,
  height = 100,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 100">
      {/* Sol de la rue */}
      <Rect x="0" y="85" width="120" height="15" fill="#E8E8E8" />
      
      {niveau === 1 && (
        <>
          {/* Niveau 1: Simple stand */}
          {/* Table basique */}
          <Rect x="10" y="60" width="100" height="25" rx="3" fill={couleurPrincipale} />
          {/* Tente/toile simple */}
          <Path d="M5 60 L60 30 L115 60" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="2" />
          {/* Poteaux */}
          <Rect x="8" y="60" width="4" height="25" fill={couleurPrincipale} />
          <Rect x="108" y="60" width="4" height="25" fill={couleurPrincipale} />
        </>
      )}

      {niveau === 2 && (
        <>
          {/* Niveau 2: Petite boutique */}
          {/* Mur principal */}
          <Rect x="5" y="35" width="110" height="50" rx="5" fill={couleurPrincipale} />
          {/* Toit simple */}
          <Path d="M0 35 L60 10 L120 35" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="2" />
          {/* Porte */}
          <Rect x="45" y="55" width="30" height="30" rx="2" fill={couleurSecondaire} />
          <Circle cx="70" cy="70" r="2" fill={couleurPrincipale} />
          {/* Petite fenêtre */}
          <Rect x="12" y="45" width="25" height="20" rx="2" fill={couleurSecondaire} />
          <Line x1="24.5" y1="45" x2="24.5" y2="65" stroke={couleurPrincipale} strokeWidth="2" />
          <Line x1="12" y1="55" x2="37" y2="55" stroke={couleurPrincipale} strokeWidth="2" />
        </>
      )}

      {niveau === 3 && (
        <>
          {/* Niveau 3: Boutique avec enseigne et vitrine */}
          {/* Mur principal */}
          <Rect x="5" y="30" width="110" height="55" rx="5" fill={couleurPrincipale} />
          {/* Toit avec bordure */}
          <Path d="M0 30 L60 5 L120 30" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="3" />
          {/* Enseigne */}
          <Rect x="30" y="8" width="60" height="15" rx="3" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="2" />
          {/* Grande vitrine */}
          <Rect x="10" y="40" width="45" height="30" rx="3" fill={couleurSecondaire} />
          <Line x1="32.5" y1="40" x2="32.5" y2="70" stroke={couleurPrincipale} strokeWidth="2" />
          <Line x1="10" y1="55" x2="55" y2="55" stroke={couleurPrincipale} strokeWidth="2" />
          {/* Porte */}
          <Rect x="65" y="50" width="30" height="35" rx="2" fill={couleurSecondaire} />
          <Circle cx="90" cy="67" r="2" fill={couleurPrincipale} />
          {/* Détail décoratif */}
          <Circle cx="60" cy="75" r="3" fill={couleurSecondaire} />
        </>
      )}

      {niveau === 4 && (
        <>
          {/* Niveau 4: Façade premium avec détails */}
          {/* Mur principal avec texture */}
          <Rect x="5" y="25" width="110" height="60" rx="5" fill={couleurPrincipale} />
          {/* Toit élaboré */}
          <Path d="M0 25 L60 0 L120 25" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="3" />
          {/* Auvent */}
          <Path d="M5 25 L5 35 L115 35 L115 25" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="2" />
          <Ellipse cx="60" cy="35" rx="55" ry="5" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="2" />
          {/* Enseigne décorée */}
          <Rect x="25" y="5" width="70" height="18" rx="4" fill={couleurSecondaire} stroke={couleurPrincipale} strokeWidth="3" />
          {/* Deux grandes vitrines */}
          <Rect x="8" y="38" width="35" height="32" rx="3" fill={couleurSecondaire} />
          <Line x1="25.5" y1="38" x2="25.5" y2="70" stroke={couleurPrincipale} strokeWidth="2" />
          <Line x1="8" y1="54" x2="43" y2="54" stroke={couleurPrincipale} strokeWidth="2" />
          
          <Rect x="77" y="38" width="35" height="32" rx="3" fill={couleurSecondaire} />
          <Line x1="94.5" y1="38" x2="94.5" y2="70" stroke={couleurPrincipale} strokeWidth="2" />
          <Line x1="77" y1="54" x2="112" y2="54" stroke={couleurPrincipale} strokeWidth="2" />
          {/* Porte centrale */}
          <Rect x="48" y="50" width="24" height="35" rx="2" fill={couleurSecondaire} />
          <Circle cx="68" cy="67" r="2" fill={couleurPrincipale} />
          {/* Éclairage/décorations */}
          <Circle cx="15" cy="30" r="4" fill="#FFD700" />
          <Circle cx="105" cy="30" r="4" fill="#FFD700" />
          <Circle cx="60" cy="20" r="3" fill="#FFD700" />
          {/* Plante décorative */}
          <Rect x="50" y="82" width="20" height="8" rx="2" fill={couleurSecondaire} />
          <Circle cx="55" cy="80" r="4" fill="#4CAF50" />
          <Circle cx="65" cy="80" r="4" fill="#4CAF50" />
        </>
      )}
    </Svg>
  );
};

export default FacadeBoutique;
