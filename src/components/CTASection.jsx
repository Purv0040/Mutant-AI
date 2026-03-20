import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-24 px-8 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-6xl font-headline font-extrabold mb-10 tracking-tight">
          Ready to activate your team's collective brain?
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/signup"
            className="bg-primary hover:bg-primary-container text-white px-10 py-5 rounded-xl font-headline font-bold text-xl transition-all shadow-xl shadow-primary/20"
          >
            Get Started for Free
          </Link>
          <Link
            to="/features"
            className="bg-surface-container-highest text-on-surface hover:bg-surface-container-high px-10 py-5 rounded-xl font-headline font-bold text-xl transition-all"
          >
            Schedule Enterprise Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
