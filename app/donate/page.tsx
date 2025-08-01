"use client"; // This directive is important for using hooks like useState and useEffect

import { Header } from "@/components/ui/page-header";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';

const Page = () => {
    // State for the online donation form
    const [donationAmount, setDonationAmount] = useState(50);
    const [isMounted, setIsMounted] = useState(false);

    const teamHeaderText = `Your contribution can make a world of difference.`;
    const logoImagePath = "/assets/logo_csf.png";
    const suggestedAmounts = [25, 50, 100, 250];

    // Your foundation's account details
    const bankDetails = {
        accountName: "Cyril & Susanna Foundation",
        accountNumber: "0000000000", // <-- Replace with your real account number
        bankName: "Guaranty Trust Bank (GTB)", // <-- Replace with your real bank name
    };

    // This effect runs only on the client, preventing hydration errors
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            {/* Blurred decorative circles */}
            <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>
            <div className="absolute top-[600px] left-[-150px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30"></div>

            {/* Header */}
            <Header pageName="Donate" title="Support Our Cause." headerText={teamHeaderText} imagePath={logoImagePath} />

            <div className="my-16 px-8 lg:px-24">
                <section className="my-8 flex gap-4 items-center">
                    <h2 className="flex-0 font-raleway text-xl w-1/2 md:w-2/3">Help Us Empower the Next Generation of Leaders and Innovators.</h2>
                    <div className="flex-1 h-[2px] bg-accent-color-primary rounded-lg"></div>
                </section>

                {/* Why Your Donation Matters Section */}
                <section className="font-raleway my-24 grid md:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold">Why Your Donation Matters</h2>
                        <p className="text-lg">
                            At the Cyril & Susanna Foundation, we are committed to nurturing the potential of bright young minds in Isuofia. Your donation directly funds scholarships for students in critical fields like Medicine, Nursing, Pharmacy, Computer Science, and Engineering.
                        </p>
                        <p className="text-lg">
                            By giving, you are not just supporting an individual&aposs education; you are investing in the future of our community and empowering the leaders of tomorrow.
                        </p>
                    </div>
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src="/assets/students.jpg"
                            fill
                            alt="Students benefiting from the scholarship"
                            className="object-cover"
                        />
                    </div>
                </section>

                {/* SIMPLIFIED Online Donation Form Section */}
                <section className="font-raleway my-24 flex flex-col gap-8 items-center bg-gray-50 p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold">Make an Online Donation via Paypal</h2>
                    
                    {isMounted ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-2/3">
                                {suggestedAmounts.map(amount => (
                                    <button key={amount} onClick={() => setDonationAmount(amount)} className={`p-4 rounded-lg text-lg font-semibold border-2 ${donationAmount === amount ? 'bg-accent-color-primary text-white border-accent-color-primary' : 'bg-white border-gray-300'}`}>${amount}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">$</span>
                                <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} className="text-2xl font-bold p-2 border-b-2 border-accent-color-primary focus:outline-none w-32 text-center"/>
                            </div>
                            <Link href="https://your-payment-gateway-link.com" className="text-center" target="_blank">
                                <button className="font-raleway cursor-pointer bg-green-600 text-white py-4 px-12 text-xl rounded-lg mx-auto transition duration-300 hover:bg-green-700">Donate Now</button>
                            </Link>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <p>Loading donation form...</p>
                        </div>
                    )}
                </section>

                {/* Bank Account Details Section */}
                <section className="font-raleway my-24 flex flex-col gap-8 items-center">
                    <h2 className="text-3xl font-bold text-center">To Donate Via Direct Bank Transfer (Naira Account)</h2>
                    <div className="bg-slate-100 p-8 rounded-lg shadow-md w-full md:w-2/3 lg:w-1/2">
                        <div className="flex flex-col gap-6 text-center md:text-left">
                            <div className="md:grid md:grid-cols-2 md:items-center">
                                <span className="text-gray-600 font-semibold">Bank Name:</span>
                                <span className="font-bold text-lg">{bankDetails.bankName}</span>
                            </div>
                            <hr/>
                            <div className="md:grid md:grid-cols-2 md:items-center">
                                <span className="text-gray-600 font-semibold">Account Name:</span>
                                <span className="font-bold text-lg">{bankDetails.accountName}</span>
                            </div>
                            <hr/>
                            <div className="md:grid md:grid-cols-2 md:items-center">
                                <span className="text-gray-600 font-semibold">Account Number:</span>
                                <span className="font-bold text-lg">{bankDetails.accountNumber}</span>
                            </div>
                        </div>
                        <div className="mt-8 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
                            <p className="text-sm"><span className="font-bold">Important: <br/> </span> Please ensure the account name matches &quot{bankDetails.accountName}&quot when making the transfer.</p>
                        </div>
                    </div>
                </section>

                {/* NEW: Contact Us Section */}
                <section className="text-center font-raleway my-16">
                    <p className="text-lg">
                        If you have any question, Please <Link href="/contact" className="text-accent-color-primary font-bold underline hover:opacity-80">CLICK HERE</Link> to contact us 
                        or call us on <a href="tel:+2348037651703" className="text-accent-color-primary font-bold underline hover:opacity-80">+234 (0) 803 765 1703</a>.
                    </p>
                </section>

            </div>
            
            {/* Ribbon Decoration Section */}
            <section className="relative w-full h-[300px] flex items-center justify-center overflow-hidden">
                <div className="z-10 text-center font-raleway px-8">
                    <h2 className="text-3xl font-bold">Thank You for Your Support</h2>
                    <p className="text-lg mt-4">
                        Every donation makes a significant impact.
                    </p>
                </div>
                <Image
                    src="/assets/ribbon.png"
                    alt="Decorative ribbon background"
                    fill
                    className="object-cover z-0"
                />
            </section>
        </>
    );
};

export default Page;