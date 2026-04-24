export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-6 mt-10 text-center">
      <p className="text-slate-600 text-xs leading-relaxed">
        Weather:{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Open-Meteo</a>
        {' · '}Webcams:{' '}
        <a href="https://a.atmos.washington.edu/data/webcams.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">UW Atmospheric Sciences</a>
        {' · '}
        <a href="https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">NPS Mt Rainier</a>
        {' · '}
        <a href="https://wsdot.wa.gov/travel/real-time/mountainpasses/Snoqualmie" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">WSDOT</a>
        <br className="mt-1" />
        <span className="text-slate-700">Built with React · Vite · Tailwind · Seattle, WA</span>
      </p>
    </footer>
  );
}
