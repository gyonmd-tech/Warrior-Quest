import { useState, useEffect } from 'react';

export interface RealTimeInfo {
  now: Date;
  timeString: string; // "18:15:30"
  dateString: string; // "Jumat, 21 Agustus 2026"
  shortDate: string; // "21 Ags 2026"
  dayName: string; // "Jumat"
  greeting: string; // "Selamat Sore"
  greetingIcon: string; // "wb_sunny"
  secondsToMidnight: number;
  formattedResetCountdown: string; // "05:44:18"
}

export function useRealTime(): RealTimeInfo {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const dateString = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shortDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const dayName = now.toLocaleDateString('id-ID', { weekday: 'long' });

  let greeting = 'Selamat Pagi';
  let greetingIcon = 'wb_sunny';
  if (hours >= 4 && hours < 11) {
    greeting = 'Selamat Pagi';
    greetingIcon = 'wb_sunny';
  } else if (hours >= 11 && hours < 15) {
    greeting = 'Selamat Siang';
    greetingIcon = 'light_mode';
  } else if (hours >= 15 && hours < 18) {
    greeting = 'Selamat Sore';
    greetingIcon = 'wb_twilight';
  } else {
    greeting = 'Selamat Malam';
    greetingIcon = 'bedtime';
  }

  // Calculate seconds until 23:59:59 tonight
  const midnight = new Date(now);
  midnight.setHours(23, 5, 59, 999);
  const secondsToMidnight = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));

  const resetHours = Math.floor(secondsToMidnight / 3600);
  const resetMins = Math.floor((secondsToMidnight % 3600) / 60);
  const resetSecs = secondsToMidnight % 60;
  const formattedResetCountdown = `${String(resetHours).padStart(2, '0')}:${String(resetMins).padStart(2, '0')}:${String(resetSecs).padStart(2, '0')}`;

  return {
    now,
    timeString,
    dateString,
    shortDate,
    dayName,
    greeting,
    greetingIcon,
    secondsToMidnight,
    formattedResetCountdown,
  };
}
