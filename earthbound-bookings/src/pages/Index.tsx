import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Calendar, Heart, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-yoga.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Find Your
              <span className="block text-primary">Inner Peace</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join us for transformative yoga classes designed to nurture your body, 
              mind, and spirit. Book your practice today.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link to="/classes">Browse Classes</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/classes">View Schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose Serenity</h2>
            <p className="text-lg text-muted-foreground">
              Experience the difference in every practice
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Calendar,
                title: "Flexible Schedule",
                description: "Classes throughout the day to fit your lifestyle",
              },
              {
                icon: Users,
                title: "Expert Instructors",
                description: "Learn from certified, experienced teachers",
              },
              {
                icon: Heart,
                title: "All Levels Welcome",
                description: "From beginners to advanced practitioners",
              },
              {
                icon: Sparkles,
                title: "Serene Environment",
                description: "Beautiful, peaceful studio spaces",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-card p-8 shadow-soft transition-smooth hover:shadow-elevated animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-warm p-12 text-center shadow-elevated">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Join our community and discover the transformative power of yoga
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/classes">Book Your First Class</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Serenity Yoga Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
