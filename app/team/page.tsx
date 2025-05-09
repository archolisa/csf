import { Header } from "@/components/ui/page-header";
import BoardMembers from "@/components/team/board-members";

const Page = () => {
    const teamHeaderText = `At the heart of the Cyril and Susanna Foundation is a passionate board dedicated to opening doors through education. Their leadership ensures our mission continues to impact lives and build brighter futures.`;
    
    return(
        <>
        {/* Top left Blurred Circle */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
        {/* Mid left Blurred Circle */}
        <div className="absolute top-[600px] left-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
        
        {/* Header */}
        <Header pageName="Meet Our" title=" Board Members" headerText={teamHeaderText} />
        <div className="my-16 px-8 lg:px-24">
            <BoardMembers />
        </div>
        </>
    );
};

export default Page;