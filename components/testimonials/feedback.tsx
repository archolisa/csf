const testimonials = [
    
    {
      name: "Chinenye Christabel Okpala",
      course: "Medicine & Surgery",
      quote:
        "I'm really grateful. May this Foundation never lack. I will use this opportunity to the fullest. God bless you and your generation.",
      image: "/assets/testimonials/christabel.jpg",
    },
    {
      name: "Geraldine M. Ilechukwu",
      course: "Medicine & Surgery, UNIZIK",
      quote:
        "It's a luxury I could only afford by God's grace and the incredible support from this foundation. I promise to do my best in my academics to make my family and the Foundation proud.",
      image: "/assets/testimonials/geraldine.jpg",
    },
    {
      name: "Mmesoma Azolibe",
      course: "",
      quote:
        "Thank you to the Cyril & Susanna Foundation for lifting the financial burden off my parents' shoulders. May your kindness be richly rewarded.",
      image: "/assets/testimonials/mmesoma.jpg",
    }
  ];
  

  export const Feedback = () => {
    
    return (
      <>
        {/* Background Blurs */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
        <div className="absolute top-[600px] right-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
  
        {/* Testimonials Section */}
        <section className="my-24 px-8 lg:px-24 max-w-6xl mx-auto grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="flex flex-col justify-between h-full text-center shadow-lg rounded-2xl p-6 bg-white"
            >
              <div>
                <p className="text-sm italic text-gray-700 mb-6">“{t.quote}”</p>
              </div>
              <div className="mt-auto pt-4 border-t">
                <h4 className="font-bold text-md text-light-red">{t.name}</h4>
                {t.course && (
                  <p className="text-xs text-gray-500 mt-1">{t.course}</p>
                )}
              </div>
            </div>
          ))}
        </section>
      </>
    );
  };
  
