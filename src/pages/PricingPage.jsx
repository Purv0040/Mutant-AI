const PricingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center pt-20">
      <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-6">
        Pricing Plans
      </h1>
      <p className="text-xl text-on-surface-variant max-w-2xl mb-10">
        Choose the best plan for your team and unlock the power of Enterprise Intelligence.
      </p>
      <div className="bg-surface-container-low p-10 rounded-xl shadow-lg border border-outline-variant/20 inline-block">
        <h2 className="text-3xl font-bold mb-4">Enterprise</h2>
        <p className="text-4xl font-extrabold text-primary mb-6">Custom Pricing</p>
        <p className="text-on-surface-variant mb-8">Contact us for tailored solutions based on your organization's needs.</p>
        <button className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl font-headline font-bold transition-all w-full">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
