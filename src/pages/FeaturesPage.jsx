import FeaturesSection from '../components/FeaturesSection';

const FeaturesPage = () => {
  return (
    <div>
      <div className="text-center pt-20 pb-10">
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
          Our Features
        </h1>
      </div>
      <FeaturesSection />
    </div>
  );
};

export default FeaturesPage;
