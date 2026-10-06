import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
} from 'lucide-react';
import { getWeatherInfo } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: number;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = 1,
  className = 'w-6 h-6',
  size,
}) => {
  const info = getWeatherInfo(code, isDay);
  const iconProps = {
    className: `${info.theme.accentColor} ${className}`,
    size,
    strokeWidth: 1.75,
  };

  switch (info.iconName) {
    case 'sun':
      return <Sun {...iconProps} />;
    case 'moon':
      return <Moon {...iconProps} />;
    case 'cloud-sun':
      return <CloudSun {...iconProps} />;
    case 'cloud-moon':
      return <CloudMoon {...iconProps} />;
    case 'cloud':
      return <Cloud {...iconProps} />;
    case 'cloud-fog':
      return <CloudFog {...iconProps} />;
    case 'cloud-drizzle':
      return <CloudDrizzle {...iconProps} />;
    case 'cloud-rain':
      return <CloudRain {...iconProps} />;
    case 'cloud-snow':
      return <CloudSnow {...iconProps} />;
    case 'cloud-lightning':
      return <CloudLightning {...iconProps} />;
    case 'snowflake':
      return <Snowflake {...iconProps} />;
    default:
      return <Cloud {...iconProps} />;
  }
};
