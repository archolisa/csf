import { Header } from "@/components/ui/page-header";
// import { StayInTouch } from "@/components/get-involved/stay-in-touch";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
    const teamHeaderText = `Apply for Cyril & Susanna Foundation 2025/2026 Scholarship.`;
    
    return(
        <>
        {/* Top left Blurred Circle */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
        {/* Mid left Blurred Circle */}
        <div className="absolute top-[600px] left-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
        
        {/* Header */}
        <Header pageName="" title="Scholarship Application." headerText={teamHeaderText} />
        <div className="my-16 px-8 lg:px-24">
            <section className="my-8 flex gap-4 items-center">
                <h2 className="flex-0 font-raleway text-xl w-1/2 md:w-1/3">Are you an Isuofia indigene studying Medicine, Nursing, Pharmacy, Computer Science, or Engineering? Apply Now!</h2>
                <div className="flex-1 h-[2px] bg-accent-color-primary rounded-lg"></div>
            </section>

            <section className="font-raleway my-24 flex flex-col gap-4 items-center">
                <h2 className="text-2xl">Scholarship Requirements</h2>
                <ul className="pl-0 mt-8 flex flex-col gap-4 crystyal-style-list">
                    <li>Must be an Indigene of Isuofia, Aguata L.G.A</li>
                    <li>Must be  enrolled as a full-time student  in an undergraduate programme at an accredited Nigerian University.</li>
                    <li>O&apos;Level Result(WAEC/NECO), Jamb Result.</li>
                    <li>Admission Letter, etc.</li>
                </ul>
            </section>
        </div>
        <section className="relative my-4 w-full h-[400px]">
            <div className="px-8 lg:px-24 flex justify-center items-center">
                <div className="z-[9] flex flex-col gap-8 font-raleway bg-fontcolor text-background rounded-lg p-8 w-full md:w-1/2">
                    <h2 className="text-2xl text-center">Undergradguate Application</h2>
                    <p className="text-sm font-lighter">
                    Apply for the Cyril & Susanna Foundation 2025/2026 undergraduate Scholarship below
                    </p>
                    <Link href="https://forms.gle/PmSUvju4cp4BXzRR7" className="text-center" target="_blank">
                        <button className="font-raleway cursor-pointer bg-accent-color-primary text-background py-4 px-8 w-full md:w-1/2 mx-auto transition duration-300 hover:opacity-80">
                            Apply Here!
                        </button>
                    </Link>
                </div>
            </div>
            <Image src="/assets/ribbon.png" width={1200} height={378} alt="Ribbon" className="absolute bottom-[150px] w-full h-[400px] object-cover" />
        </section>
        {/* <section className="my-16 px-8 lg:px-24">
            <StayInTouch />
        </section> */}
        </>
    );
};

export default Page;