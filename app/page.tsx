import React from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { CarouselPlugin } from "@/components/ui/home-carousel";
import { Feedback } from "@/components/testimonials/feedback";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamSection } from "@/components/team-section";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Footer } from "@/components/ui/footer";
import { ScholarshipAwards2026 } from "@/components/awards/scholarship-awards-2026";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar />

      {/* ==================== HEADER WITH EXTRA SMALL SCREEN FIX ==================== */}
      <header className="relative flex flex-col justify-center items-center w-full h-[85vh] lg:h-screen overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/header-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Darker Overlay for Better Contrast */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

        {/* Header Content Container */}
        <div className="relative z-20 mt-20 lg:mt-0 flex flex-col lg:flex-row items-center justify-center w-full px-8 lg:px-24 lg:space-x-16">
          {/* Left side: Animated Title */}
          <div className="w-full lg:w-1/2 text-left text-white">
            <h1 
              // CORRECTED: Added a smaller base size for extra small screens
              className="font-display font-michroma text-[2.5rem] sm:text-[2.5rem] lg:text-[4.5rem] leading-none tracking-tight"
              style={{
                animation: `fadeInUp 1s ease-out forwards`,
                animationDelay: '0.2s',
                opacity: 0,
                textShadow: '0px 3px 12px rgba(0,0,0,0.5)'
              }}
            >
              CYRIL & SUSANNA
              <span 
                // CORRECTED: Scaled down proportionally for extra small screens
                className="block text-white text-[1.6rem] sm:text-[1.8rem] lg:text-[3.4rem]"
                style={{
                  animation: `fadeInUp 1s ease-out forwards`,
                  animationDelay: '0.6s',
                  opacity: 0,
                }}
              >
                FOUNDATION
              </span>
            </h1>
          </div>

          {/* Right side: Animated Tagline */}
          <div className="w-full lg:w-1/2 justify-end text-white lg:pl-20 mt-24 lg:mt-36">
            <h2 
              // CORRECTED: Made tagline responsive on mobile
              className="text-2xl lg:text-3xl leading-[1.2] lg:text-left"
              style={{
                animation: `fadeInUp 1s ease-out forwards`,
                animationDelay: '1s',
                opacity: 0,
              }}
            >
              <span className="font-michroma text-gray-200/90 font-light">
                Lighting the Path to a Brighter Future...
              </span>
            </h2>
            
            <div
              className="mt-8 lg:mt-10 lg:text-left flex justify-center lg:justify-start"
              style={{
                animation: `fadeInUp 1s ease-out forwards`,
                animationDelay: '1.3s',
                opacity: 0,
              }}
            >
              <Link 
                href="/scholarships/apply" 
                className="inline-flex items-center gap-4 bg-red-600/90 hover:bg-red-700 text-white rounded-full px-6 py-3.5 transition-all backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] border border-red-500/50 hover:scale-105"
              >
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-raleway font-bold text-sm md:text-base tracking-wide uppercase">
                  2026/2027 Scholarship Application is Now Open!
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* ======================== END OF HEADER ======================== */}


      <main className="relative flex-1 flex flex-col items-center bg-white">
        {/* Blurred Circles */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30 -z-10"></div>
        <div className="absolute top-[600px] left-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30 -z-10"></div>

        {/* ... Rest of your page content remains unchanged ... */}
        <section className="w-full flex flex-col items-center lg:flex-row lg:items-center justify-between lg:h-auto px-8 py-12 lg:px-24 lg:py-16 gap-12">
          <div className="w-full flex flex-col items-center lg:items-start mt-4 lg:w-1/2 lg:mt-0 lg:h-full text-center lg:text-left">
            <h2 className="text-xl 2xl:text-3xl font-bold text-accent-color-primary">
              ABOUT US
            </h2>
            <p className="font-raleway text-sm 2xl:text-xl mt-4 flex-1 leading-relaxed text-gray-800">
            The Cyril and Susanna Foundation is a non-profit organization committed to fostering human capital development in Nigeria, with a special focus on the Isuofia community in Aguata Local Government Area of Anambra State. <br/> Founded by <strong>Dr. Ike Nwankwor, MD, FRCPC</strong>, an accomplished son of Isuofia in Aguata LGA. Anambra State. This Foundation seeks to create opportunities for education and personal growth among the youth, particularly those from underprivileged backgrounds.
Since its inception, the Foundation has launched several scholarship schemes aimed at supporting students across different educational levels—from primary school to university. <br/> Our initiatives include university scholarships for brilliant but disadvantaged Isuofia indigenes, educational support for members of the founder’s extended family, and merit-based scholarships for top-performing primary school pupils progressing to secondary school.
<br/>We currently support over a dozen students and aim to expand our reach annually. The Foundation also envisions future postgraduate sponsorships and is actively working towards establishing a trust fund to ensure the sustainability of its programs.
Driven by a passion to uplift the next generation, the Cyril and Susanna Foundation believes in empowering young minds through education—nurturing talent, inspiring excellence, and transforming lives.
            </p>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <Image
              className="rounded-2xl shadow-xl object-cover w-full h-auto max-w-lg lg:max-w-full"
              alt="C&S Foundation Picture"
              src={`/assets/cs_pictures/1.jpeg`}
              width={650}
              height={650}
            />
          </div>
        </section>
        
        {/* Carousel Section */}
        <section className="w-full flex flex-col items-center lg:flex-row lg:items-center justify-between lg:h-auto px-8 py-12 lg:px-24 lg:py-16 gap-12">
          <div className="w-full flex flex-col items-center mt-4 lg:w-1/2 lg:mt-0 lg:h-full">
            <CarouselPlugin />
          </div>
          <div className="w-full flex flex-col items-center lg:items-start mt-4 lg:w-1/2 lg:mt-0 lg:h-full text-center lg:text-left">
            <h2 className="text-xl 2xl:text-3xl font-bold text-accent-color-primary">
              GALLERY
            </h2>
            <p className="font-raleway text-sm 2xl:text-2xl mt-4 flex-1 leading-relaxed text-gray-800">
            Discover the faces behind our mission — from dedicated sponsors and visionary board members to the inspiring scholars whose lives have been touched by the Cyril & Susanna Foundation. Browse through moments captured at our scholarship awards, community outreach, and other impactful events that shape our story.
            </p>
            <Link href="/programmes">
              <Button variant="default" className="mt-6 2xl:text-lg 2xl:py-4 transition-transform hover:scale-105">
                VIEW OUR PROGRAMMES
                <svg width="36" height="20" viewBox="0 0 49 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                  <path d="M2 12H47M47 12L36.6154 2M47 12L36.6154 22" stroke="#FFF5F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </Link>
          </div>
        </section>
          {/* 2026 Scholarship Awards Section */}
        <ScholarshipAwards2026 />

        {/* Gallery Section */}
        <section className="mt-8 w-full relative flex flex-col items-center lg:flex-row lg:items-start justify-between lg:h-auto px-8 py-12 lg:px-24 lg:py-16 gap-4 overflow-hidden">
          <Image
            className="absolute top-[10px] left-1/2 transform -translate-x-1/2 max-w-full"
            src={`/assets/cs_pictures/little_stars.png`}
            height={195}
            width={1000}
            alt="Little Stars"
          />
          <div className="w-full flex flex-col items-center mt-4 lg:mt-0 lg:h-full">
            <h2 className="text-2xl 2xl:text-3xl text-center">
              Hear from some of our current Beneficiaries
            </h2>
            <Feedback/>
          </div>
        </section>

      

        {/* Team Section */}
        <TeamSection />
        {/* Newsletter Section */}
        <section className="w-full p-8 lg:p-24">
          <NewsletterSignup />
        </section>
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Home;