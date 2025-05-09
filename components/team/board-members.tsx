"use client";

// import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BoardMember, TeamCategory } from "@/lib/interfaces";
// import { renderSkeletons } from "@/lib/functions";
// import { BoardMemberSkeleton } from "./board-member-skeleton";
import { BoardMemberModal } from "@/components/team/board-member-modal";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { PiLinkedinLogoLight } from "react-icons/pi";
// import { TwitterSVG, InstagramSVG2, GitHubSVG, PortfolioSVG } from "@/app/svgs";

// 🔽 Import the static JSON
import boardMembers from "@/data/board_members.json";

// const categories: TeamCategory[] = ["Leadership Team", "Operations Team", "Technical Team"];
const categories: TeamCategory[] = ["Leadership Team"];

const BoardMembers = () => {
    const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

    const renderMembersByCategory = (category: string) => {
        return boardMembers
            .filter((member) => member.category === category)
            .map((member) => (
                <div key={member.name} className="mx-auto md:mx-0 min-h-80 w-3/4">
                    <div className="md:h-3/4 w-full">
                        <Image
                            src={member.picture}
                            width={300}
                            height={400}
                            className="w-full h-full object-cover"
                            alt="Team Member"
                        />
                    </div>
                    <div className="flex flex-col mt-2">
                        <h3 className="text-light-red text-lg">{member.position}</h3>
                        <p className="text-sm text-gray">{member.name}</p>
                        <div className="mt-2 text-sm flex justify-between w-full items-center z-[9]">
                            {/* <div className="socials flex items-center gap-2">
                                {member.socials.linkedin && (
                                    <Link href={member.socials.linkedin} target="_blank" className="text-fontcolor">
                                        <PiLinkedinLogoLight className="w-8 h-8 text-fontcolor transition" />
                                    </Link>
                                )}
                                {member.socials.twitter && (
                                    <Link href={member.socials.twitter} target="_blank" className="text-fontcolor">
                                        <TwitterSVG className="w-8 h-8 text-fontcolor transition hover:text-light-red" />
                                    </Link>
                                )}
                                {member.socials.instagram && (
                                    <Link href={member.socials.instagram} target="_blank" className="text-fontcolor">
                                        <InstagramSVG2 className="w-8 h-8 text-fontcolor transition hover:text-light-red" />
                                    </Link>
                                )}
                                {member.socials.portfolio && (
                                    <Link href={member.socials.portfolio} target="_blank" className="text-fontcolor">
                                        <PortfolioSVG className="w-8 h-8 text-fontcolor transition hover:text-light-red" />
                                    </Link>
                                )}
                                {member.socials.github && (
                                    <Link href={member.socials.github} target="_blank" className="text-fontcolor">
                                        <GitHubSVG className="w-8 h-8 text-fontcolor transition hover:text-light-red" />
                                    </Link>
                                )}
                            </div> */}
                            <div>
                                <Button
                                    variant="default"
                                    className="text-sm bg-gray text-background hover:bg-fontcolor"
                                    onClick={() => setSelectedMember({ ...member, category: member.category as TeamCategory })}

                                >
                                    View Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ));
    };

    return (
        <>
            {categories.map((category) => (
                <div key={category} className="mb-24">
                    <h3 className="mb-8">{category}</h3>
                    <div className="board-members grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                        {renderMembersByCategory(category)}
                    </div>
                </div>
            ))}
            {selectedMember && (
                <BoardMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}
        </>
    );
};

export default BoardMembers;
