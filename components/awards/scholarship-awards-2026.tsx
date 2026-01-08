"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export const ScholarshipAwards2026 = () => {
    // Array of award photos with descriptions
    const awardPhotos = [
        { src: '/assets/award-2026-1.JPG', description: 'Presentation of award by Chief Ezennolim (Ajofia)' },
        { src: '/assets/award-2026-2.JPG', description: 'Presentation of award by Barr. Leo Chiegboka' },
        { src: '/assets/award-2026-3.JPG', description: 'Presentation of award by Rev. Fr. Ogumelu' },
        { src: '/assets/award-2026-4.JPG', description: 'Presentation of award by Chief Ndubuisi Okeke' },
        { src: '/assets/award-2026-5.JPG', description: 'A Beneficiary presents an Art Work to the sponsor' },
        { src: '/assets/award-2026-6.jpg', description: 'Cross sectional picture of the beneficiaries with the sponsor' },
    ];

    const ref = useRef(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
                        On <strong>January 3rd, 2026</strong>, the Cyril and Susanna Foundation honoured its 2025 scholarship award recipients in a memorable event held in <strong>Isuofia, Anambra State</strong>. Each of the successful awardees received <strong>₦250,000</strong> to support their educational journey.
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
                    <div className="hidden lg:grid grid-cols-2 gap-6">
                        {awardPhotos.map((photo, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative overflow-hidden rounded-lg shadow-lg group cursor-pointer h-64`}
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
                    <div className="lg:hidden flex flex-wrap justify-center gap-4">
                        {awardPhotos.map((photo, index) => (
                            <motion.div
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                whileHover={{ scale: 1.05 }}
                                className={`relative overflow-hidden rounded-lg shadow-lg h-48 cursor-pointer ${
                                    index === 4 ? 'w-[calc(50%-8px)]' : 'w-[calc(50%-8px)]'
                                }`}
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

                {/* Full Screen Image Modal for Mobile and Desktop */}
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImageIndex(null)}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full h-full flex flex-col items-center justify-center"
                            drag="x"
                            dragElastic={0.2}
                            onDragEnd={(e, info) => {
                                if (info.offset.x > 50) {
                                    // Swiped right - go to previous image
                                    setSelectedImageIndex((prev) => 
                                        prev !== null && prev > 0 ? prev - 1 : null
                                    );
                                } else if (info.offset.x < -50) {
                                    // Swiped left - go to next image
                                    setSelectedImageIndex((prev) => 
                                        prev !== null && prev < awardPhotos.length - 1 ? prev + 1 : null
                                    );
                                }
                            }}
                        >
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="absolute top-4 right-4 z-60 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                                aria-label="Close image"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                                <Image
                                    src={awardPhotos[selectedImageIndex].src}
                                    alt={awardPhotos[selectedImageIndex].description}
                                    fill
                                    className="object-contain"
                                    onClick={() => {
                                        // If it's the last image, close. Otherwise, go to next
                                        if (selectedImageIndex === awardPhotos.length - 1) {
                                            setSelectedImageIndex(null);
                                        } else {
                                            setSelectedImageIndex(selectedImageIndex + 1);
                                        }
                                    }}
                                />
                            </div>

                            {/* Navigation Arrows */}
                            {selectedImageIndex > 0 && (
                                <button
                                    onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                                    aria-label="Previous image"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            {selectedImageIndex < awardPhotos.length - 1 && (
                                <button
                                    onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                                    aria-label="Next image"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            {/* Image Counter and Description */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-white text-center text-sm font-raleway mb-2">
                                    {awardPhotos[selectedImageIndex].description}
                                </p>
                                <p className="text-white/60 text-xs text-center">
                                    {selectedImageIndex + 1} of {awardPhotos.length}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Call to Action Section */}
                <motion.div
                    variants={itemVariants}
                    className="mt-16 bg-gradient-to-r from-accent-color-primary/5 to-accent-color-primary/10 rounded-lg p-8 text-center"
                >
                    <p className="font-raleway text-gray-700 text-lg">
                        Are you an Isuofia indigene interested in applying for next year&apos;s scholarship? 
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
