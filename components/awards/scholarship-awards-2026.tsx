"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export const ScholarshipAwards2026 = () => {
    // Array of award photos with descriptions
    const awardPhotos = [
        { src: '/assets/award-2026-1.JPG', description: 'Presentation of award by Chief Ezennolim (Ajofia)' },
        { src: '/assets/award-2026-2.JPG', description: 'Presentation of award by Barr. Leo Chiegboka' },
        { src: '/assets/award-2026-3.JPG', description: 'Presentation of award by Rev. Fr. Ogumelu' },
        { src: '/assets/award-2026-4.JPG', description: 'Presentation of award by Chief Ndubuisi Okeke' },
        { src: '/assets/award-2026-5.JPG', description: 'A Beneficiary presents an Art Work to the sponsor' },
    ];

    const ref = useRef(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <section className="relative w-full py-16 lg:py-24 px-8 lg:px-24 bg-gradient-to-b from-red-50 to-white overflow-hidden">
            {/* Decorative Blurred Circles */}
            <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-30 -z-10"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-accent-color-primary rounded-full blur-[80px] opacity-20 -z-10"></div>

            <motion.div
                ref={ref}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
                className="max-w-6xl mx-auto"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h2 className="font-michroma text-3xl lg:text-4xl text-accent-color-primary mb-4">
                        2026 Scholarship Award Recipients
                    </h2>
                    <p className="font-raleway text-sm lg:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        On <strong>January 3rd, 2026</strong>, the Cyril and Susanna Foundation honoured its 2026 scholarship award recipients in a memorable event held in <strong>Isuofia, Anambra State</strong>. Each of the successful awardees received <strong>₦250,000</strong> to support their educational journey.
                    </p>
                </motion.div>

                {/* Award Stats Section */}
                <motion.div
                    variants={itemVariants}
                    className="flex justify-center mb-16"
                >
                    <div className="bg-accent-color-primary/10 rounded-lg p-6 text-center w-full max-w-sm">
                        <p className="font-michroma text-3xl lg:text-4xl text-accent-color-primary font-bold">
                            over N1M+ 
                        </p>
                        <p className="font-raleway text-gray-700 mt-2">Total Awarded</p>
                    </div>
                </motion.div>

                {/* Photo Gallery */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h3 className="font-raleway text-2xl text-gray-800 mb-8 text-center">
                        Moments from the Award Ceremony
                    </h3>
                    
                    {/* Desktop Grid Layout */}
                    <div className="hidden lg:grid grid-cols-3 gap-6">
                        {awardPhotos.map((photo, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className={`relative overflow-hidden rounded-lg shadow-lg group
                                    ${index === 0 || index === 5 ? "row-span-2 h-96" : "h-48"}`}
                            >
                                <Image
                                    src={photo.src}
                                    alt={photo.description}
                                    fill
                                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
                                {/* Photo Description Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-sm font-raleway">{photo.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Grid Layout */}
                    <div className="lg:hidden grid grid-cols-2 gap-4">
                        {awardPhotos.slice(0, 4).map((photo, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="relative overflow-hidden rounded-lg shadow-lg h-48"
                            >
                                <Image
                                    src={photo.src}
                                    alt={photo.description}
                                    fill
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black/30"></div>
                                {/* Photo Description Overlay - Always visible on mobile */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                                    <p className="text-white text-xs font-raleway line-clamp-2">{photo.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action Section */}
                <motion.div
                    variants={itemVariants}
                    className="mt-16 bg-gradient-to-r from-accent-color-primary/5 to-accent-color-primary/10 rounded-lg p-8 text-center"
                >
                    <p className="font-raleway text-gray-700 text-lg">
                        Are you an Isuofia indigene interested in applying for next year's scholarship? 
                        <br/>
                        <span className="font-semibold text-accent-color-primary">
                            Stay tuned for the 2026 application cycle!
                        </span>
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
};
