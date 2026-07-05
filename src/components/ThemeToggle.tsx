'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === 'system' ? systemTheme : theme;

  return (
    <Button
      variant='plain'
      size='icon'
      aria-label='Toggle theme'
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      className='md:h-10 md:w-10 h-12 w-12'
    >
      {current === 'dark' ? (
        <Sun className='h-7 w-7 md:h-5 md:w-5' />
      ) : (
        <Moon className='h-7 w-7 md:h-5 md:w-5' />
      )}
    </Button>
  );
}
