import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiscordSVG, InstagramSVG, EmailSVG } from "@/app/svgs";
import {TbPhone} from "react-icons/tb"
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="w-full bg-fontcolor text-white">
      
      {/* Socials and Mail List Row */}
      <div className="p-8 gap-8 lg:px-24 lg:py-16 max-w-6xl mx-auto flex flex-col md:flex-row justify-between text-center md:text-left lg:gap-4">
        {/* Left Section - Socials and Email */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h3 className="text-base lg:text-lg tracking-wider">CONNECT.</h3>
          <p className="text-base lg:text-lg tracking-wider">OUR SOCIALS.</p>
          <div className="flex gap-4 text-2xl">
            <Link href="https://facebook.com" target="_blank">
              <DiscordSVG />
            </Link>
            <Link href="https://www.instagram.com/candsfoundation" target="_blank">
              <InstagramSVG />
            </Link>
          </div>
        </div>

        {/* Right Section - Mailing List */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <h3 className="text-base lg:text-lg tracking-wider">SUPPORT OUR CAUSE</h3>
          <Button
            variant="outline"
            className="border-accent-color-primary text-accent-color-primary hover:bg-accent-color-primary hover:text-background px-6 py-2"
          >
            <Link href="/donate">How to Donate?</Link> 
          </Button>
        </div>
      </div>

      {/* Email Row */}
<div className="p-8 lg:py-12 lg:px-24 max-w-6xl mx-auto flex flex-col md:flex-row justify-between text-center md:text-left">
  <div className="flex flex-col items-center lg:items-start text-center gap-2">
    <h3 className="text-base lg:text-lg text-center flex gap-2 items-center"><EmailSVG /> Send us an Email</h3>
    <div>
      <p className="text-sm">
        <Link href="mailto:cyrilandsusannafoundation@gmail.org">info@cyrilandsusannafoundation.org</Link>
      </p>
    </div>
    
    {/* Add margin-bottom to create space between email and phone */}
    <div className="mt-5 flex items-center">
      <TbPhone className="w-7 h-7 mr-2" />
      <p className="text-sm"> 
        08037651703, 08033073871
      </p>
    </div>

  </div>
</div>


      {/* Bottom Section - Logo and Copyright */}
      <div className="flex flex-col mx-auto items-center mt-10">
        <Image
          src="/assets/cyril-susanna-logo.png"
          alt="C&S Foundation Logo"
          width={36}
          height={36}
        />
        <p className="text-xs text-gray-400 my-4 text-center">
          Made with ❤ by <br /> Olisa Digital Solutions.
        </p>
      </div>
    </footer>
  );
};
