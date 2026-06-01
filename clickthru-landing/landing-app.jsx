/* landing-app.jsx — theme state + page assembly. Loaded last. */

function LandingApp() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('ct-landing-theme') || 'light');
  React.useEffect(() => { localStorage.setItem('ct-landing-theme', theme); }, [theme]);

  return (
    <div className="studio ct-site" data-theme={theme}>
      <Nav theme={theme} setTheme={setTheme} />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <ExportBand />
      <Showcase />
      <Comparison />
      <Pricing />
      <FAQ />
      <ClosingCTA />
      <Footer theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LandingApp />);
