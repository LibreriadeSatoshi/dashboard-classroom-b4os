'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'phosphor-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // Remove the current locale from the pathname if present
      const pathWithoutLocale = pathname.replace(`/${locale}`, '').replace(/^\//, '');
      // Navigate to the new locale
      const newPath = `/${nextLocale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 text-white bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg px-3 py-2 transition-all duration-200 border border-slate-600/40 shadow-lg">
      <Globe size={20} className="text-amber-400" />
      <select
        id="language-select"
        value={locale}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={isPending}
        className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer uppercase"
      >
        <option value="es" className="bg-slate-800 text-white">es</option>
        <option value="en" className="bg-slate-800 text-white">en</option>
      </select>
    </div>
  );
}
