// app/our-sponsor/page.tsx
import { Header } from '@/components/ui/page-header';
import  Image  from "next/image";

const Page = () => {
    const logoImagePath = "/assets/logo_csf.png"; 
    const sponsorHeaderText = `Behind every great initiative are people who believe in its purpose. Get to know the individuals championing our journey.`;

    return (
        <>
            {/* Top left Blurred Circle */}
            <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
            {/* Mid left Blurred Circle */}
            <div className="absolute top-[600px] left-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>

            {/* Header */}
            <Header pageName="Our Sponsor" title="Meet Our Sponsor." headerText={sponsorHeaderText} imagePath={logoImagePath} />

            {/* Sponsor Section */}
            <section className="w-full my-8 px-8 lg:px-24 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <Image
                        src="/assets/cs_pictures/9.jpeg" 
                        alt="Our Sponsor"
                        className="w-full md:w-1/3 rounded-2xl shadow-lg object-cover"
                        width={400}
                        height={400}
                    />
                    <div className="text-left">
                        <h2 className="text-2xl font-raleway font-bold mb-4">Dr & Dr (Mrs) Ike Nwankwor</h2>
                        <p className="text-base font-raleway leading-relaxed text-gray-700">
                            Dr. Ike Nwankwor, MD, FRCPC, was born in Nigeria to Cyril and Susanna Nwankwor. His educational journey commenced in Nigeria, where he attended Central School in Isuofia and Uga Boys Secondary School. He subsequently pursued a degree in medicine and surgery at the University of Nigeria, graduating in 1997. After completing his residency training in general adult psychiatry in Dublin, Ireland, he relocated to Canada in 2017 to advance his career, having achieved a fellowship with the Royal College of Physicians and Surgeons of Canada. In Canada, Ike is an assistant clinical professor and faculty member at the College of Medicine, University of Saskatchewan. <br/> His dedication to medical education is evident as he instructs medical students and mentors psychiatry residents and young faculty members. As a consultant psychiatrist, he continually seeks to make a positive impact on the lives of his patients and the broader community. <br/> 
                            <br/> Dr. Ify Nwankwor, MD, FAAP, FRCPC, was born in Oklahoma, USA, to Dr. Raphael and Felicia Ilo from Oko. She attended FGGC Abuloma before earning her degree in medicine and surgery from Abia State University. Ify completed her residency in Alabama and pursued a fellowship in neonatology at Winston-Salem, North Carolina. As a distinguished Fellow in the American Academy of Pediatrics, she is an assistant clinical professor at the University of Saskatchewan and a neonatologist at Regina General Hospital. She equally contributes a lot to post-graduate medical education. Since their marriage in 2004, Ify and Ike have been blessed with three wonderful sons: Kamsiyo, JD, and Osy.  <br/>  Their decision to establish the foundation is rooted in a deep desire to honour Cyril and Susanna&apos;s legacy of community upliftment through education and give back to the community that has profoundly influenced their lives. Ike fondly recalls the support he received through Chief (Dr.) P.A. Okonkwo’s scholarship in the 1990s which fostered a lasting gratitude for the opportunities that have greatly benefitted him.  <br/> Ify is equally committed to advocating for the education of young girls, believing that their empowerment is essential for societal progress. Ify and Ike are dedicated to making a significant difference through the foundation, promoting human capital development, and inspiring youth to expand their horizons and contribute positively to their families, communities, and the world.<br/> Their guiding philosophy aligns with the Dalai Lama&apos;s statement: “Our prime purpose in this life is to help others; if you can’t help them, at least don’t hurt them.” In their personal lives, Ify and Ike enjoy hosting friends over a glass of wine, valuing the warmth of companionship. They also enjoy mentoring others, exploring new places, and enjoying sunny days together. </p>
                    </div>
                </div>
            </section>
            <br />
            <section className="flex flex-col items-center lg:flex-row lg:items-start justify-between lg:h-[500px] p-8 lg:p-24 gap-4">
        
          <div className="w-full flex flex-col items-center mt-4 lg:w-1/2 lg:mt-0 lg:h-full">
            <h2 className="text-lg 2xl:text-2xl text-center text-accent-color-primary">
              OUR PATRIARCH & MATRIARCH
            </h2>
            <p className="font-raleway text-sm 2xl:text-2xl mt-2 flex-1">
            This foundation draws its inspiration from the visionary contributions of <strong>Cyril and Susanna Nwankwor</strong>, two esteemed individuals who devoted their lives to advancing education. As retired educators, their unwavering belief in the importance of education and the cultivation of meaningful relationships has had a lasting impact on their community. While Cyril now rests peacefully, Susanna continues to radiate vitality and energy. Together, they passionately advocated for empowering their community through educational initiatives. Cyril and Susanna are blessed with eight children.
            </p>
          </div>
          <div className="w-full flex flex-col items-center mt-4 lg:w-1/2 lg:mt-0 lg:h-full">
        <Image
            className="rounded-md"
            alt="C&S Foundation Picture"
            src={`/assets/cs_pictures/5.jpeg`}
            width={400}
            height={400}
          />
          </div>
        </section>
        </>
    );
};

export default Page;
