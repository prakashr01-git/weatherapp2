export interface WeatherInfo {
  code: number;
  label: string;
  description: string;
  iconName: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'cloud-fog' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning' | 'snowflake';
  category: 'clear' | 'clouds' | 'fog' | 'rain' | 'snow' | 'thunderstorm';
  theme: {
    bgGradient: string;
    cardBorder: string;
    accentColor: string;
  };
}

export function getWeatherInfo(code: number, isDay: number = 1): WeatherInfo {
  const day = isDay === 1;

  switch (code) {
    case 0:
      return {
        code,
        label: 'Clear Sky',
        description: day ? 'Sunny and cloudless' : 'Clear starry night',
        iconName: day ? 'sun' : 'moon',
        category: 'clear',
        theme: {
          bgGradient: day ? 'from-amber-500/10 via-sky-500/5 to-transparent' : 'from-indigo-950/40 via-slate-900 to-transparent',
          cardBorder: day ? 'border-amber-500/20' : 'border-indigo-500/20',
          accentColor: day ? 'text-amber-400' : 'text-indigo-400',
        },
      };

    case 1:
      return {
        code,
        label: 'Mainly Clear',
        description: 'Scattered fair weather clouds',
        iconName: day ? 'cloud-sun' : 'cloud-moon',
        category: 'clear',
        theme: {
          bgGradient: day ? 'from-amber-500/10 via-sky-500/5 to-transparent' : 'from-indigo-950/30 to-transparent',
          cardBorder: 'border-sky-500/20',
          accentColor: day ? 'text-amber-300' : 'text-sky-300',
        },
      };

    case 2:
      return {
        code,
        label: 'Partly Cloudy',
        description: 'Mix of sun and cloud formations',
        iconName: day ? 'cloud-sun' : 'cloud-moon',
        category: 'clouds',
        theme: {
          bgGradient: 'from-sky-500/10 via-slate-800/20 to-transparent',
          cardBorder: 'border-slate-700/60',
          accentColor: 'text-sky-400',
        },
      };

    case 3:
      return {
        code,
        label: 'Overcast',
        description: 'Persistent cloud deck covering sky',
        iconName: 'cloud',
        category: 'clouds',
        theme: {
          bgGradient: 'from-slate-700/15 via-slate-900 to-transparent',
          cardBorder: 'border-slate-700/50',
          accentColor: 'text-slate-300',
        },
      };

    case 45:
    case 48:
      return {
        code,
        label: code === 45 ? 'Fog' : 'Rime Fog',
        description: 'Reduced visibility due to suspended condensation',
        iconName: 'cloud-fog',
        category: 'fog',
        theme: {
          bgGradient: 'from-zinc-500/15 via-slate-900 to-transparent',
          cardBorder: 'border-zinc-700/60',
          accentColor: 'text-zinc-300',
        },
      };

    case 51:
    case 53:
    case 55:
      return {
        code,
        label: code === 51 ? 'Light Drizzle' : code === 53 ? 'Moderate Drizzle' : 'Dense Drizzle',
        description: 'Fine misting precipitation',
        iconName: 'cloud-drizzle',
        category: 'rain',
        theme: {
          bgGradient: 'from-teal-500/15 via-slate-900 to-transparent',
          cardBorder: 'border-teal-500/20',
          accentColor: 'text-teal-300',
        },
      };

    case 56:
    case 57:
      return {
        code,
        label: code === 56 ? 'Freezing Drizzle' : 'Dense Freezing Drizzle',
        description: 'Sub-zero drizzle creating surface glaze',
        iconName: 'cloud-snow',
        category: 'snow',
        theme: {
          bgGradient: 'from-cyan-500/15 via-slate-900 to-transparent',
          cardBorder: 'border-cyan-500/20',
          accentColor: 'text-cyan-300',
        },
      };

    case 61:
    case 63:
    case 65:
      return {
        code,
        label: code === 61 ? 'Slight Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain',
        description: code === 65 ? 'Torrential precipitation' : 'Continuous rainfall',
        iconName: 'cloud-rain',
        category: 'rain',
        theme: {
          bgGradient: 'from-blue-600/15 via-slate-900 to-transparent',
          cardBorder: 'border-blue-500/25',
          accentColor: 'text-blue-400',
        },
      };

    case 66:
    case 67:
      return {
        code,
        label: code === 66 ? 'Freezing Rain' : 'Heavy Freezing Rain',
        description: 'Liquid precipitation freezing on road contact',
        iconName: 'snowflake',
        category: 'snow',
        theme: {
          bgGradient: 'from-cyan-600/15 via-slate-900 to-transparent',
          cardBorder: 'border-cyan-500/30',
          accentColor: 'text-cyan-300',
        },
      };

    case 71:
    case 73:
    case 75:
    case 77:
      return {
        code,
        label: code === 71 ? 'Slight Snow' : code === 73 ? 'Moderate Snow' : code === 75 ? 'Heavy Snow' : 'Snow Grains',
        description: 'Atmospheric crystalline accumulation',
        iconName: 'cloud-snow',
        category: 'snow',
        theme: {
          bgGradient: 'from-sky-400/15 via-slate-900 to-transparent',
          cardBorder: 'border-sky-400/20',
          accentColor: 'text-sky-200',
        },
      };

    case 80:
    case 81:
    case 82:
      return {
        code,
        label: code === 80 ? 'Light Showers' : code === 81 ? 'Moderate Showers' : 'Violent Showers',
        description: 'Passing localized rain squalls',
        iconName: 'cloud-rain',
        category: 'rain',
        theme: {
          bgGradient: 'from-blue-500/20 via-slate-900 to-transparent',
          cardBorder: 'border-blue-500/30',
          accentColor: 'text-blue-400',
        },
      };

    case 85:
    case 86:
      return {
        code,
        label: code === 85 ? 'Light Snow Showers' : 'Heavy Snow Showers',
        description: 'Intermittent convective snow squalls',
        iconName: 'cloud-snow',
        category: 'snow',
        theme: {
          bgGradient: 'from-indigo-400/15 via-slate-900 to-transparent',
          cardBorder: 'border-indigo-400/20',
          accentColor: 'text-indigo-200',
        },
      };

    case 95:
    case 96:
    case 99:
      return {
        code,
        label: code === 95 ? 'Thunderstorm' : 'Thunderstorm with Hail',
        description: 'Convective instability with lightning activity',
        iconName: 'cloud-lightning',
        category: 'thunderstorm',
        theme: {
          bgGradient: 'from-purple-900/25 via-amber-950/20 to-slate-950',
          cardBorder: 'border-purple-500/30',
          accentColor: 'text-amber-400',
        },
      };

    default:
      return {
        code,
        label: 'Moderate Conditions',
        description: 'Variable atmospheric conditions',
        iconName: 'cloud',
        category: 'clouds',
        theme: {
          bgGradient: 'from-slate-800/20 via-slate-900 to-transparent',
          cardBorder: 'border-slate-800',
          accentColor: 'text-slate-300',
        },
      };
  }
}
