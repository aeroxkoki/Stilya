import React from 'react';
import Svg, { Path, Circle, Rect, LinearGradient, Stop, Defs, G } from 'react-native-svg';

interface LogoProps {
  width?: number;
  height?: number;
}

export const StilyaLogo: React.FC<LogoProps> = ({ width = 200, height = 200 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="50%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#EC4899" />
        </LinearGradient>
      </Defs>
      {/* 背景円 */}
      <Circle cx="100" cy="100" r="90" fill="url(#logoGradient)" opacity="0.1" />
      {/* Sの文字をパスで描画 */}
      <Path
        d="M70 60 Q70 40, 100 40 Q130 40, 130 60 Q130 80, 100 100 Q70 120, 70 140 Q70 160, 100 160 Q130 160, 130 140"
        stroke="url(#logoGradient)"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

interface WelcomeIllustrationProps {
  width?: number;
  height?: number;
}

export const WelcomeIllustration: React.FC<WelcomeIllustrationProps> = ({ 
  width = 300, 
  height = 200 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 200">
      <Defs>
        <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#60A5FA" />
        </LinearGradient>
        <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#A78BFA" />
        </LinearGradient>
        <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#F472B6" />
        </LinearGradient>
      </Defs>
      
      {/* ハンガー1 */}
      <G transform="translate(50, 30) rotate(-5)">
        <Path d="M0 30 Q0 0, 30 0 Q60 0, 60 30" stroke="url(#grad1)" strokeWidth="4" fill="none" />
        <Rect x="10" y="30" width="40" height="60" rx="8" fill="url(#grad1)" opacity="0.2" />
        <Rect x="10" y="30" width="40" height="60" rx="8" stroke="url(#grad1)" strokeWidth="3" fill="none" />
      </G>
      
      {/* ハンガー2 */}
      <G transform="translate(120, 30)">
        <Path d="M0 30 Q0 0, 30 0 Q60 0, 60 30" stroke="url(#grad2)" strokeWidth="4" fill="none" />
        <Rect x="10" y="30" width="40" height="60" rx="8" fill="url(#grad2)" opacity="0.2" />
        <Rect x="10" y="30" width="40" height="60" rx="8" stroke="url(#grad2)" strokeWidth="3" fill="none" />
      </G>
      
      {/* ハンガー3 */}
      <G transform="translate(190, 30) rotate(5)">
        <Path d="M0 30 Q0 0, 30 0 Q60 0, 60 30" stroke="url(#grad3)" strokeWidth="4" fill="none" />
        <Rect x="10" y="30" width="40" height="60" rx="8" fill="url(#grad3)" opacity="0.2" />
        <Rect x="10" y="30" width="40" height="60" rx="8" stroke="url(#grad3)" strokeWidth="3" fill="none" />
      </G>
      
      {/* スワイプインジケーター */}
      <G transform="translate(100, 140)">
        {/* 手のアイコン */}
        <Circle cx="20" cy="20" r="20" fill="#3B82F6" opacity="0.2" />
        <Path
          d="M15 15 L15 25 M20 12 L20 25 M25 15 L25 25 M30 18 L30 25 M12 25 L28 25"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* 矢印 */}
        <Path
          d="M50 20 L80 20 M75 15 L80 20 L75 25"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

interface SwipeIntroIllustrationProps {
  width?: number;
  height?: number;
}

export const SwipeIntroIllustration: React.FC<SwipeIntroIllustrationProps> = ({ 
  width = 300, 
  height = 200 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 200">
      <Defs>
        <LinearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#A78BFA" />
        </LinearGradient>
      </Defs>
      
      {/* 中央のカード */}
      <Rect x="100" y="30" width="100" height="140" rx="12" fill="url(#cardGrad)" opacity="0.1" />
      <Rect x="100" y="30" width="100" height="140" rx="12" stroke="url(#cardGrad)" strokeWidth="3" fill="none" />
      
      {/* 服のアイコン */}
      <Path
        d="M130 60 Q130 50, 150 50 Q170 50, 170 60 L170 80 L180 70 L180 100 L170 90 L170 130 L130 130 L130 90 L120 100 L120 70 L130 80 Z"
        fill="url(#cardGrad)"
        opacity="0.5"
      />
      
      {/* 左側 - No */}
      <G transform="translate(30, 80)">
        <Circle cx="25" cy="25" r="25" fill="#EF4444" opacity="0.2" />
        <Path
          d="M15 15 L35 35 M35 15 L15 35"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </G>
      
      {/* 右側 - Yes */}
      <G transform="translate(220, 80)">
        <Circle cx="25" cy="25" r="25" fill="#10B981" opacity="0.2" />
        <Path
          d="M15 25 L22 32 L35 15"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      
      {/* 矢印 */}
      <Path
        d="M85 100 L65 100 M70 95 L65 100 L70 105"
        stroke="#EF4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <Path
        d="M215 100 L235 100 M230 95 L235 100 L230 105"
        stroke="#10B981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </Svg>
  );
};
