import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  name,
  gender = 'other',
  size = 48,
}) => {
  const avatarSize = size;

  const renderDefaultAvatar = () => {
    if (gender === 'female') {
      return (
        <Svg width={avatarSize} height={avatarSize} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} fill="#FF6B9D" />
          <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 20a7 7 0 0 1 14 0" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    } else if (gender === 'male') {
      return (
        <Svg width={avatarSize} height={avatarSize} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} fill="#3B82F6" />
          <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 20a7 7 0 0 1 14 0" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    } else {
      return (
        <Svg width={avatarSize} height={avatarSize} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} fill="#9CA3AF" />
          <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 20a7 7 0 0 1 14 0" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    }
  };

  return (
    <View style={[s.container, { width: avatarSize, height: avatarSize }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[s.image, { width: avatarSize, height: avatarSize }]} />
      ) : (
        renderDefaultAvatar()
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 999,
  },
});

export default UserAvatar;
