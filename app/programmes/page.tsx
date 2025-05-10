import { Header } from "@/components/ui/page-header";
import Image from "next/image";
import { GraduationCap, Users, School, Award, BookOpen, ShieldCheck } from "lucide-react";

const scholarshipItems = [
  {
    icon: <GraduationCap className="w-5 h-5 text-white" />,
    title: "Isuofia-wide University Support",
    description:
      "For disadvantaged Isuofia citizens admitted to a Nigerian university. Each year, two new students are added to the program, focusing on academic excellence. Currently, 8 students are on this scheme.",
  },
  {
    icon: <Users className="w-5 h-5 text-white" />,
    title: "Founder’s Family University Support",
    description:
      "Open to any indigent member of the founder’s family admitted to a Nigerian university. The family submits names yearly. Course of study is not restricted.",
  },
  {
    icon: <School className="w-5 h-5 text-white" />,
    title: "Primary to Secondary School Scholarships",
    description:
      "Awarded to the best-graduating pupil from each of the six Isuofia primary schools to attend Holychild Secondary School. Open to all, regardless of town of origin. Three students are currently enrolled.",
  },
  {
    icon: <Award className="w-5 h-5 text-white" />,
    title: "Postgraduate Sponsorship",
    description:
      "Planned for the future. Students who graduate with a First-Class or strong 2:1 may be considered for postgraduate support.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-white" />,
    title: "JAMB/WAEC Fee Support",
    description:
      "Supported around 20 students by paying their exam fees. This initiative is currently on hold due to coordination challenges.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-white" />,
    title: "Planned Trust Fund",
    description:
      "The Foundation plans to establish a long-term trust fund to sustain these educational efforts.",
  },
];

const Page = () => {
  const headerText =
    "Empowering students through education — from Nigeria to the world. Learn how we’re building a future of possibilities through targeted scholarship support from Primary to Tertiary level.";

  return (
    <>
      {/* Background Blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
      <div className="absolute top-[600px] right-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>

      {/* Page Header */}
      <Header
        pageName="Programmes"
        title="Scholarship Scheme"
        headerText={headerText}
      />

      {/* Intro with Image */}
      <section className="my-16 px-8 lg:px-24 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="md:w-1/2">
          <Image
            src="/assets/cs_pictures/10.jpeg" // Replace with actual path
            alt="Mrs Ekwy Nwife addressing the students"
            width={600}
            height={400}
            className="rounded-xl shadow-md object-cover w-full h-auto"
          />
        </div>
        {/* Text */}
        <div className="font-raleway md:w-1/2 text-sm text-gray-800 leading-7">
          <p className="mb-4">
            The Cyril and Susanna Foundation was established to foster human capital development in Nigeria, with an initial focus on the Isuofia community in Aguata Local Government Area of Anambra State. It was founded by Dr. Ike Nwankwor, an illustrious son of Isuofia.
          </p>
          <p>
            Our scholarship initiatives span across multiple levels of education, targeting bright but financially challenged individuals.
          </p>
        </div>

      </section>

      {/* Scholarship Cards */}
      <section className="grid gap-6 px-8 lg:px-24 max-w-5xl mx-auto mb-16">
        {scholarshipItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 bg-white p-6 shadow-md rounded-xl border-l-4 border-light-red"
          >
            <div className="bg-light-red rounded-full p-2">
              {item.icon}
            </div>
            <div>
              <h3 className="font-raleway font-bold text-base text-gray-800 mb-1">{item.title}</h3>
              <p className="font-raleway text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Closing Note */}
      <section className="text-center px-8 lg:px-24 max-w-3xl mx-auto pb-20">
        <p className="text-md font-medium text-light-red">
          Together, let’s uplift Umu-Isuofia and build lasting impact through education!.
        </p>
      </section>
    </>
  );
};

export default Page;
